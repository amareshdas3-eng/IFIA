import test from 'node:test';
import assert from 'node:assert';
import { db } from '../db/database.js';
import { authService } from '../services/authService.js';
import { cmmsAdapter } from '../services/cmmsAdapter.js';
import { qaAuditor } from '../services/qaAuditor.js';
import { syntheticCases } from '../data/syntheticCases.js';
import { RCACase, RCACaseSchema } from '../schemas/rcaContract.js';

test('End-to-End Validation: Evidence Grounding, QA Review, Human Sign-Off, and Mock CMMS Dispatch', async () => {
  // 1. Ingest Synthetic Industrial Failure Case
  const sourceCase = syntheticCases[0]; // 33 kV Incomer Switchgear Flashover
  assert.ok(sourceCase, 'Synthetic industrial case must exist');
  assert.strictEqual(sourceCase.data_mode, 'SYNTHETIC_DEMO', 'Controlled demo mode must be active');

  const testCase: RCACase = JSON.parse(JSON.stringify(sourceCase));
  testCase.case_id = `RCA-E2E-${Date.now()}`;
  testCase.case_status = 'AWAITING_ENGINEERING_REVIEW';
  testCase.approvals = [];
  testCase.cmms.work_order_status = 'DRAFT_NOT_SUBMITTED';
  testCase.cmms.submitted_at = null;
  testCase.cmms.idempotency_key = `IDEMP-E2E-${Date.now()}`;
  testCase.root_cause_conclusion.approved_by_human = false;

  // Validate Evidence Contract Schema Compliance
  const validationResult = RCACaseSchema.safeParse(testCase);
  assert.ok(validationResult.success, 'Case must fully conform to RCA Evidence Contract Schema');

  // Verify Evidence Register completeness
  assert.ok(testCase.evidence_register.length >= 3, 'Case must contain multi-modal evidence items');
  const registeredEvidenceIds = new Set(testCase.evidence_register.map(e => e.evidence_id));

  // 2. Validate Hypotheses groundedness
  testCase.hypotheses.forEach(hyp => {
    assert.ok(hyp.hypothesis_id, 'Hypothesis must have ID');
    assert.ok(hyp.title, 'Hypothesis must have title');
    assert.ok(hyp.description, 'Hypothesis must have description');
    assert.ok(hyp.status, 'Hypothesis must have status');

    // Every supporting evidence ID must reference the Evidence Register
    hyp.supporting_evidence_ids.forEach(eid => {
      assert.ok(
        registeredEvidenceIds.has(eid),
        `Hypothesis evidence ${eid} must exist in registered evidence register`
      );
    });
  });

  // 3. QA Red-Team Auditor Verification
  const qaResult = qaAuditor.auditCase(testCase);
  assert.strictEqual(qaResult.decision, 'READY_FOR_AUTHORIZED_REVIEW', 'Sound investigation must pass QA review');
  assert.strictEqual(qaResult.hallucination_detected, false, 'No hallucinations allowed');
  assert.strictEqual(qaResult.safety_policy_passed, true, 'Safety policy must pass');

  // 4. Human-in-the-Loop Safety Gate: Attempting dispatch BEFORE human approval MUST FAIL
  const prematureDispatch = await cmmsAdapter.dispatchWorkOrder(
    testCase,
    'LEAD_ELECTRICAL_ENGINEER',
    'Alex Henderson, PE'
  );
  assert.strictEqual(prematureDispatch.success, false, 'CMMS dispatch must be blocked without human approval');
  assert.strictEqual(prematureDispatch.status, 'REJECTED');
  assert.match(prematureDispatch.message, /Human-in-the-Loop Governance Policy/i);

  // 5. Authorized Engineering Review with Signed Token
  const engineerToken = authService.issueTokenForPrincipal('alex.henderson');
  assert.ok(engineerToken, 'Signed token must be issued for Lead Electrical Engineer');

  const authenticatedPrincipal = authService.verifyAuthToken(engineerToken);
  assert.ok(authenticatedPrincipal, 'Engineer token must verify cleanly');
  assert.strictEqual(authenticatedPrincipal?.role, 'LEAD_ELECTRICAL_ENGINEER');

  // Record authenticated human engineering approval
  testCase.approvals.unshift({
    reviewer_name: authenticatedPrincipal!.name,
    reviewer_role: authenticatedPrincipal!.role as any,
    reviewer_id: authenticatedPrincipal!.id,
    reviewer_license: authenticatedPrincipal!.licenseNumber,
    decision: 'ACCEPTED',
    notes: 'Technical review complete per IEEE C37. Corrective actions and LOTO boundaries verified.',
    timestamp: new Date().toISOString(),
    review_duration_minutes: 25
  });
  testCase.case_status = 'APPROVED';
  testCase.root_cause_conclusion.approved_by_human = true;
  testCase.cmms.work_order_status = 'APPROVED_STAGED';
  db.saveCase(testCase);

  // 6. Controlled Mock CMMS Dispatch Execution
  const authorizedDispatch = await cmmsAdapter.dispatchWorkOrder(
    testCase,
    authenticatedPrincipal!.role,
    authenticatedPrincipal!.name
  );

  assert.strictEqual(authorizedDispatch.success, true, 'Approved case must dispatch to CMMS successfully');
  assert.strictEqual(authorizedDispatch.status, 'SUBMITTED_TO_CMMS');
  assert.strictEqual(authorizedDispatch.is_simulation, true, 'Must operate strictly in air-gapped simulation sandbox');
  assert.ok(authorizedDispatch.work_order_id, 'CMMS work order ID must be generated');
  assert.strictEqual(testCase.cmms.work_order_status, 'SUBMITTED_TO_CMMS');

  // Verify LOTO, Safety Prerequisites, Hold Points, and Parts Verification
  assert.ok(
    testCase.cmms.safety_prerequisites.length > 0,
    'Safety prerequisites and LOTO boundaries must be specified'
  );
  assert.ok(
    testCase.cmms.safety_prerequisites.some((s: string) => s.includes('LOTO') || s.includes('Lockout/Tagout')),
    'Lockout/Tagout (LOTO) boundary must be enforced'
  );
  assert.ok(
    testCase.cmms.inspection_hold_points.length > 0,
    'Mandatory inspection hold points must be defined'
  );
  assert.ok(
    testCase.cmms.parts_requiring_verification.length > 0,
    'Critical spare parts must be checked prior to work order execution'
  );

  // 7. Prevent Duplicate Dispatch via Idempotency
  const duplicateDispatch = await cmmsAdapter.dispatchWorkOrder(
    testCase,
    authenticatedPrincipal!.role,
    authenticatedPrincipal!.name
  );
  assert.strictEqual(duplicateDispatch.success, true);
  assert.strictEqual(duplicateDispatch.status, 'DUPLICATE_IGNORED', 'Idempotency must prevent duplicate work order creation');

  // 8. Verify Cryptographic Chained SHA-256 Audit Trail
  const auditReport = db.verifyAuditLogIntegrity();
  assert.strictEqual(auditReport.is_valid, true, 'Cryptographic audit trail chain must remain valid');
  assert.strictEqual(auditReport.chain_broken, false, 'Audit chain must not be broken');
  assert.strictEqual(auditReport.tampered_records_count, 0, 'No tampered audit records permitted');
});
