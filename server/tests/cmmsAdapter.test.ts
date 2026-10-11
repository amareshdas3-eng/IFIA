import test from 'node:test';
import assert from 'node:assert';
import { cmmsAdapter } from '../services/cmmsAdapter.js';
import { syntheticCases } from '../data/syntheticCases.js';
import { RCACase } from '../schemas/rcaContract.js';
import { config } from '../config.js';

test('CMMS Adapter blocks dispatch when case is not authorized by engineer', async () => {
  const unapprovedCase: RCACase = JSON.parse(JSON.stringify(syntheticCases[0]));
  unapprovedCase.case_status = 'AWAITING_ENGINEERING_REVIEW';
  unapprovedCase.approvals = [];

  const result = await cmmsAdapter.dispatchWorkOrder(unapprovedCase, 'TECHNICIAN', 'John Doe');
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.status, 'REJECTED');
  assert.match(result.message, /Human-in-the-Loop Governance Policy/);
});

test('CMMS Adapter explicitly marks sandbox simulation output (IFIA-SEC-004)', async () => {
  const approvedCase: RCACase = JSON.parse(JSON.stringify(syntheticCases[0]));
  approvedCase.case_status = 'APPROVED';
  approvedCase.approvals = [{
    reviewer_name: 'Alex Henderson, PE',
    reviewer_role: 'LEAD_ELECTRICAL_ENGINEER',
    decision: 'ACCEPTED',
    notes: 'Approved for work order generation.',
    timestamp: new Date().toISOString(),
    review_duration_minutes: 20
  }];
  approvedCase.cmms.idempotency_key = `IDEMP-SIM-TEST-${Date.now()}`;
  approvedCase.cmms.work_order_status = 'APPROVED_STAGED';

  const result = await cmmsAdapter.dispatchWorkOrder(approvedCase, 'LEAD_ELECTRICAL_ENGINEER', 'Alex Henderson, PE');
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.is_simulation, true);
  assert.ok(result.simulation_notice);
  assert.match(result.simulation_notice, /simulation sandbox/i);
});

test('CMMS Adapter enforces fail-closed policy when external connector is unconfigured (IFIA-SEC-004)', async () => {
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
  approvedCase.cmms.idempotency_key = `IDEMP-FAILCLOSED-${Date.now()}`;
  approvedCase.cmms.work_order_status = 'APPROVED_STAGED';

  // Temporarily switch mode to MAXIMO_REST with unconfigured endpoint
  const originalMode = config.cmmsMode;
  const originalEndpoint = config.maximoEndpoint;
  config.cmmsMode = 'MAXIMO_REST';
  config.maximoEndpoint = '';

  try {
    const result = await cmmsAdapter.dispatchWorkOrder(approvedCase, 'LEAD_ELECTRICAL_ENGINEER', 'Dr. Jane Smith, PE');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.status, 'REJECTED');
    assert.match(result.message, /CMMS Fail-Closed Policy/);
    assert.strictEqual(result.is_simulation, false);
  } finally {
    // Restore config
    config.cmmsMode = originalMode;
    config.maximoEndpoint = originalEndpoint;
  }
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
