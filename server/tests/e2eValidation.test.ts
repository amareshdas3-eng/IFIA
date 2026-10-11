import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { AddressInfo } from 'net';
import { app } from '../index.js';
import { db } from '../db/database.js';
import { authService } from '../services/authService.js';
import { qaAuditor } from '../services/qaAuditor.js';
import { syntheticCases } from '../data/syntheticCases.js';
import { RCACase, RCACaseSchema } from '../schemas/rcaContract.js';

test('End-to-End Validation: Evidence Grounding, QA Review, Real HTTP Authorization Path, and Mock CMMS Dispatch', async () => {
  // 1. Ingest Synthetic Industrial Failure Case
  const sourceCase = syntheticCases[0]; // 33 kV Incomer Switchgear Flashover
  assert.ok(sourceCase, 'Synthetic industrial case must exist');
  assert.strictEqual(sourceCase.data_mode, 'SYNTHETIC_DEMO', 'Controlled demo mode must be active');

  const testCase: RCACase = JSON.parse(JSON.stringify(sourceCase));
  testCase.case_id = `RCA-E2E-HTTP-${Date.now()}`;
  testCase.case_status = 'AWAITING_ENGINEERING_REVIEW';
  testCase.approvals = [];
  testCase.cmms.work_order_status = 'DRAFT_NOT_SUBMITTED';
  testCase.cmms.submitted_at = null;
  testCase.cmms.idempotency_key = `IDEMP-E2E-HTTP-${Date.now()}`;
  testCase.root_cause_conclusion.approved_by_human = false;
  db.saveCase(testCase);

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

  // 4. Start ephemeral HTTP server to test REAL network API authorization path
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const engineerToken = authService.issueTokenForPrincipal('alex.henderson')!;
    const technicianToken = authService.issueTokenForPrincipal('david.chen')!;

    // 4.1 Real HTTP Authorization Gate: Anonymous approval attempt MUST be rejected with 401
    const anonApprovalRes = await fetch(`${baseUrl}/api/approvals/${testCase.case_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: 'ACCEPTED',
        notes: 'Anonymous attacker attempting unauthorized approval.',
        review_duration_minutes: 10
      })
    });
    assert.strictEqual(anonApprovalRes.status, 401, 'Anonymous approval must receive HTTP 401 Unauthorized');
    const anonApprovalData = await anonApprovalRes.json();
    assert.strictEqual(anonApprovalData.code, 'UNAUTHORIZED_ANONYMOUS');

    // 4.2 Real HTTP Authorization Gate: Unauthorized role (Technician) MUST be rejected with 403
    const techApprovalRes = await fetch(`${baseUrl}/api/approvals/${testCase.case_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${technicianToken}`
      },
      body: JSON.stringify({
        decision: 'ACCEPTED',
        notes: 'Technician attempting approval without PE license.',
        review_duration_minutes: 15
      })
    });
    assert.strictEqual(techApprovalRes.status, 403, 'Technician approval must receive HTTP 403 Forbidden');
    const techApprovalData = await techApprovalRes.json();
    assert.strictEqual(techApprovalData.code, 'FORBIDDEN_ROLE');

    // 4.3 Real HTTP Authorization Gate: Premature CMMS dispatch BEFORE approval MUST be rejected (403)
    const prematureDispatchRes = await fetch(`${baseUrl}/api/cmms/dispatch/${testCase.case_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${engineerToken}`
      }
    });
    assert.strictEqual(prematureDispatchRes.status, 403, 'Premature CMMS dispatch before approval must receive HTTP 403');
    const prematureDispatchData = await prematureDispatchRes.json();
    assert.strictEqual(prematureDispatchData.success, false);
    assert.match(prematureDispatchData.message, /Human-in-the-Loop Governance Policy/i);

    // 4.4 Real HTTP Authorization Gate: Anonymous CMMS dispatch MUST be rejected with 401
    const anonDispatchRes = await fetch(`${baseUrl}/api/cmms/dispatch/${testCase.case_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(anonDispatchRes.status, 401, 'Anonymous CMMS dispatch must receive HTTP 401');

    // 4.5 Real HTTP Authorization Gate: Unauthorized role (Technician) CMMS dispatch MUST be rejected with 403
    const techDispatchRes = await fetch(`${baseUrl}/api/cmms/dispatch/${testCase.case_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${technicianToken}`
      }
    });
    assert.strictEqual(techDispatchRes.status, 403, 'Technician CMMS dispatch must receive HTTP 403');

    // 5. Real HTTP Approval by Certified Lead Electrical Engineer
    // Note: Request body attempts identity spoofing, which server MUST discard in favor of verified claims
    const authorizedApprovalRes = await fetch(`${baseUrl}/api/approvals/${testCase.case_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${engineerToken}`
      },
      body: JSON.stringify({
        reviewer_name: 'Attacker Forged Name', // Must be ignored
        reviewer_role: 'CHIEF_EXECUTIVE_OFFICER', // Must be ignored
        decision: 'ACCEPTED',
        notes: 'Technical review complete per IEEE C37. Corrective actions and LOTO boundaries verified.',
        review_duration_minutes: 25
      })
    });
    assert.strictEqual(authorizedApprovalRes.status, 200, 'Authorized lead engineer approval must receive HTTP 200');
    const approvalData = await authorizedApprovalRes.json();
    assert.strictEqual(approvalData.success, true);
    assert.strictEqual(approvalData.authenticated_principal.name, 'Alex Henderson, PE');
    assert.strictEqual(approvalData.authenticated_principal.role, 'LEAD_ELECTRICAL_ENGINEER');
    assert.strictEqual(approvalData.authenticated_principal.license, 'PE-104928-TX');

    // Verify DB was updated via real API endpoint
    const approvedCase = db.getCaseById(testCase.case_id)!;
    assert.strictEqual(approvedCase.case_status, 'APPROVED');
    assert.strictEqual(approvedCase.root_cause_conclusion.approved_by_human, true);
    assert.strictEqual(approvedCase.cmms.work_order_status, 'APPROVED_STAGED');
    assert.strictEqual(approvedCase.approvals[0].reviewer_name, 'Alex Henderson, PE');
    assert.strictEqual(approvedCase.approvals[0].reviewer_role, 'LEAD_ELECTRICAL_ENGINEER');

    // 6. Real HTTP CMMS Dispatch Execution by Authorized Lead Engineer
    const authorizedDispatchRes = await fetch(`${baseUrl}/api/cmms/dispatch/${testCase.case_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${engineerToken}`
      }
    });
    assert.strictEqual(authorizedDispatchRes.status, 200, 'Approved case dispatch must receive HTTP 200');
    const dispatchData = await authorizedDispatchRes.json();
    assert.strictEqual(dispatchData.success, true);
    assert.strictEqual(dispatchData.status, 'SUBMITTED_TO_CMMS');
    assert.strictEqual(dispatchData.is_simulation, true, 'Must operate strictly in air-gapped simulation sandbox');
    assert.ok(dispatchData.work_order_id, 'CMMS work order ID must be generated');

    const dispatchedCase = db.getCaseById(testCase.case_id)!;
    assert.strictEqual(dispatchedCase.cmms.work_order_status, 'SUBMITTED_TO_CMMS');

    // Verify LOTO, Safety Prerequisites, Hold Points, and Parts Verification
    assert.ok(
      dispatchedCase.cmms.safety_prerequisites.length > 0,
      'Safety prerequisites and LOTO boundaries must be specified'
    );
    assert.ok(
      dispatchedCase.cmms.safety_prerequisites.some((s: string) => s.includes('LOTO') || s.includes('Lockout/Tagout')),
      'Lockout/Tagout (LOTO) boundary must be enforced'
    );
    assert.ok(
      dispatchedCase.cmms.inspection_hold_points.length > 0,
      'Mandatory inspection hold points must be defined'
    );
    assert.ok(
      dispatchedCase.cmms.parts_requiring_verification.length > 0,
      'Critical spare parts must be checked prior to work order execution'
    );

    // 7. Prevent Duplicate Dispatch via Idempotency over Real HTTP
    const duplicateDispatchRes = await fetch(`${baseUrl}/api/cmms/dispatch/${testCase.case_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${engineerToken}`
      }
    });
    assert.strictEqual(duplicateDispatchRes.status, 200);
    const duplicateData = await duplicateDispatchRes.json();
    assert.strictEqual(duplicateData.success, true);
    assert.strictEqual(duplicateData.status, 'DUPLICATE_IGNORED', 'Idempotency must prevent duplicate work order creation');

    // 8. Verify Cryptographic Chained SHA-256 Audit Trail
    const auditReport = db.verifyAuditLogIntegrity();
    assert.strictEqual(auditReport.is_valid, true, 'Cryptographic audit trail chain must remain valid');
    assert.strictEqual(auditReport.chain_broken, false, 'Audit chain must not be broken');
    assert.strictEqual(auditReport.tampered_records_count, 0, 'No tampered audit records permitted');
  } finally {
    server.close();
  }
});
