import test from 'node:test';
import assert from 'node:assert';
import { qaAuditor } from '../services/qaAuditor.js';
import { syntheticCases } from '../data/syntheticCases.js';
import { RCACase } from '../schemas/rcaContract.js';

test('QA Auditor approves well-grounded 33kV Switchgear investigation', () => {
  const switchgearCase = syntheticCases[0];
  const auditResult = qaAuditor.auditCase(switchgearCase);

  assert.strictEqual(auditResult.decision, 'READY_FOR_AUTHORIZED_REVIEW');
  assert.strictEqual(auditResult.hallucination_detected, false);
  assert.strictEqual(auditResult.safety_policy_passed, true);
  assert.ok(auditResult.traceability_score_pct >= 90);
});

test('QA Auditor REJECTS cases with hallucinated evidence IDs', () => {
  const testCase: RCACase = JSON.parse(JSON.stringify(syntheticCases[0]));
  // Inject citation to non-existent evidence ID
  testCase.hypotheses[0].supporting_evidence_ids.push('EV-FABRICATED-999');

  const auditResult = qaAuditor.auditCase(testCase);
  assert.strictEqual(auditResult.decision, 'REJECT');
  assert.strictEqual(auditResult.hallucination_detected, true);
  const criticalFinding = auditResult.findings.find(f => f.severity === 'CRITICAL');
  assert.ok(criticalFinding);
});

test('QA Auditor REJECTS cases with unsafe operational recommendations', () => {
  const testCase: RCACase = JSON.parse(JSON.stringify(syntheticCases[0]));
  // Inject dangerous recommendation
  testCase.recommended_actions.push({
    action_id: 'ACT-UNSAFE-01',
    type: 'CORRECTIVE',
    description: 'Bypass lockout and re-energize immediately to restore production.',
    priority: 'SAFETY_CRITICAL',
    responsible_role: 'Operator',
    dependencies: [],
    verification_criteria: 'Energized',
    target_date: '2026-04-12',
    approval_status: 'DRAFT'
  });

  const auditResult = qaAuditor.auditCase(testCase);
  assert.strictEqual(auditResult.decision, 'REJECT');
  assert.strictEqual(auditResult.safety_policy_passed, false);
});
