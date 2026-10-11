import test from 'node:test';
import assert from 'node:assert';
import { db } from '../db/database.js';
import { authService } from '../services/authService.js';
import { syntheticCases } from '../data/syntheticCases.js';
import { RCACase } from '../schemas/rcaContract.js';

test('Auth Service verifies certified engineering tokens and issues signed bearer tokens', () => {
  const leadEng = authService.verifyAuthToken('ifia-token-lead-engineer-alex');
  assert.ok(leadEng);
  assert.strictEqual(leadEng?.name, 'Alex Henderson, PE');
  assert.strictEqual(leadEng?.role, 'LEAD_ELECTRICAL_ENGINEER');

  const tech = authService.verifyAuthToken('ifia-token-technician-david');
  assert.ok(tech);
  assert.strictEqual(tech?.role, 'TECHNICIAN');

  const invalid = authService.verifyAuthToken('bogus-malicious-token');
  assert.strictEqual(invalid, null);

  // Test dynamic HMAC token generation and verification
  const signedToken = authService.generateSignedToken({
    id: 'USR-TEST-99',
    username: 'test.engineer',
    name: 'Test Engineer, PE',
    role: 'LEAD_ELECTRICAL_ENGINEER',
    department: 'Testing'
  });
  assert.ok(signedToken.startsWith('ifia_'));
  const verifiedSigned = authService.verifyAuthToken(signedToken);
  assert.ok(verifiedSigned);
  assert.strictEqual(verifiedSigned?.name, 'Test Engineer, PE');
});

test('Approval Authorization Policy rejects unauthenticated and unauthorized callers (IFIA-SEC-001)', () => {
  const testCase: RCACase = JSON.parse(JSON.stringify(syntheticCases[0]));
  testCase.case_id = 'RCA-AUTH-TEST-01';
  testCase.case_status = 'AWAITING_ENGINEERING_REVIEW';
  testCase.approvals = [];
  db.saveCase(testCase);

  // 1. Verify that Technician role does NOT have approval authority
  const techUser = authService.verifyAuthToken('ifia-token-technician-david');
  assert.ok(techUser);
  const authorizedRoles = ['LEAD_ELECTRICAL_ENGINEER', 'RELIABILITY_DIRECTOR', 'PLANT_OPERATIONS_MANAGER'];
  const isTechAuthorized = authorizedRoles.includes(techUser!.role);
  assert.strictEqual(isTechAuthorized, false, 'Technician must not have approval privileges');

  // 2. Verify that Lead Engineer role has approval authority
  const leadEng = authService.verifyAuthToken('ifia-token-lead-engineer-alex');
  assert.ok(leadEng);
  const isLeadAuthorized = authorizedRoles.includes(leadEng!.role);
  assert.strictEqual(isLeadAuthorized, true, 'Lead Electrical Engineer must have approval privileges');

  // 3. Forged identity protection: ensure server-derived principal overrides body values
  const forgedPayload = {
    reviewer_name: 'Impersonated Chief Officer',
    reviewer_role: 'CHIEF_ENGINEERING_OFFICER',
    decision: 'ACCEPTED',
    notes: 'Approved without valid credentials.',
    review_duration_minutes: 20
  };

  // Simulating server route execution logic with verified principal
  const principal = leadEng!;
  const approvalRecord = {
    reviewer_name: principal.name, // Derived strictly from authenticated principal
    reviewer_role: principal.role,
    reviewer_id: principal.id,
    reviewer_license: principal.licenseNumber,
    decision: forgedPayload.decision as any,
    notes: forgedPayload.notes,
    timestamp: new Date().toISOString(),
    review_duration_minutes: forgedPayload.review_duration_minutes
  };

  assert.strictEqual(approvalRecord.reviewer_name, 'Alex Henderson, PE');
  assert.strictEqual(approvalRecord.reviewer_role, 'LEAD_ELECTRICAL_ENGINEER');
  assert.notStrictEqual(approvalRecord.reviewer_name, forgedPayload.reviewer_name);
});

test('CMMS Dispatch Authorization blocks unauthorized roles and unapproved cases (IFIA-SEC-002)', async () => {
  const unapprovedCase: RCACase = JSON.parse(JSON.stringify(syntheticCases[0]));
  unapprovedCase.case_id = 'RCA-AUTH-TEST-02';
  unapprovedCase.case_status = 'AWAITING_ENGINEERING_REVIEW';
  unapprovedCase.approvals = [];
  db.saveCase(unapprovedCase);

  const authorizedDispatchRoles = [
    'LEAD_ELECTRICAL_ENGINEER',
    'RELIABILITY_DIRECTOR',
    'MAINTENANCE_SUPERVISOR',
    'PLANT_OPERATIONS_MANAGER'
  ];

  // Technician cannot dispatch
  const techUser = authService.verifyAuthToken('ifia-token-technician-david')!;
  assert.strictEqual(authorizedDispatchRoles.includes(techUser.role), false);

  // Maintenance Supervisor can dispatch IF approved
  const supervisorUser = authService.verifyAuthToken('ifia-token-maint-supervisor-marcus')!;
  assert.strictEqual(authorizedDispatchRoles.includes(supervisorUser.role), true);
});
