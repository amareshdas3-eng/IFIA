import test from 'node:test';
import assert from 'node:assert';
import { cmmsAdapter } from '../services/cmmsAdapter.js';
import { syntheticCases } from '../data/syntheticCases.js';
import { RCACase } from '../schemas/rcaContract.js';

test('CMMS Adapter blocks dispatch when case is not authorized by engineer', async () => {
  const unapprovedCase: RCACase = JSON.parse(JSON.stringify(syntheticCases[0]));
  unapprovedCase.case_status = 'AWAITING_ENGINEERING_REVIEW';
  unapprovedCase.approvals = [];

  const result = await cmmsAdapter.dispatchWorkOrder(unapprovedCase, 'TECHNICIAN', 'John Doe');
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.status, 'REJECTED');
  assert.match(result.message, /Human-in-the-Loop Governance/);
});

test('CMMS Adapter allows dispatch and prevents duplicate submissions via idempotency', async () => {
  const approvedCase: RCACase = JSON.parse(JSON.stringify(syntheticCases[0]));
  approvedCase.case_status = 'APPROVED';
  approvedCase.approvals = [{
    reviewer_name: 'Dr. Jane Smith, PE',
    reviewer_role: 'LEAD_ELECTRICAL_ENGINEER',
    decision: 'ACCEPTED',
    notes: 'Approved for work order generation.',
    timestamp: new Date().toISOString(),
    review_duration_minutes: 20
  }];
  approvedCase.cmms.idempotency_key = `IDEMP-TEST-${Date.now()}`;
  approvedCase.cmms.work_order_status = 'APPROVED_STAGED';

  // First dispatch: should succeed
  const result1 = await cmmsAdapter.dispatchWorkOrder(approvedCase, 'LEAD_ELECTRICAL_ENGINEER', 'Dr. Jane Smith, PE');
  assert.strictEqual(result1.success, true);
  assert.strictEqual(result1.status, 'SUBMITTED_TO_CMMS');

  // Second duplicate dispatch: must be idempotently recognized
  const result2 = await cmmsAdapter.dispatchWorkOrder(approvedCase, 'LEAD_ELECTRICAL_ENGINEER', 'Dr. Jane Smith, PE');
  assert.strictEqual(result2.success, true);
  assert.strictEqual(result2.status, 'DUPLICATE_IGNORED');
  assert.match(result2.message, /Idempotency control active/);
});
