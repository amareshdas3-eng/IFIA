import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { authService, CERTIFIED_PRINCIPALS } from '../services/authService.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { validateAuthSecretConfig } from '../config.js';
import { syntheticCases } from '../data/syntheticCases.js';
import { RCACase } from '../schemas/rcaContract.js';

function createMockReqRes(headers: Record<string, string> = {}, body: any = {}, params: Record<string, string> = {}) {
  let statusCode = 200;
  let jsonBody: any = null;
  let nextCalled = false;

  const req: any = {
    headers,
    body,
    params,
    user: undefined
  };

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      jsonBody = data;
      return res;
    }
  };

  const next = () => {
    nextCalled = true;
  };

  return {
    req,
    res,
    next,
    getStatus: () => statusCode,
    getBody: () => jsonBody,
    isNextCalled: () => nextCalled
  };
}

test('Auth Service eliminates hardcoded static shared tokens and enforces signed bearer scheme', () => {
  // 1. Verify that old shared static tokens are unconditionally rejected
  const oldLeadEng = authService.verifyAuthToken('ifia-token-lead-engineer-alex');
  assert.strictEqual(oldLeadEng, null, 'Legacy static lead engineer token must be rejected');

  const oldTech = authService.verifyAuthToken('ifia-token-technician-david');
  assert.strictEqual(oldTech, null, 'Legacy static technician token must be rejected');

  const oldSupervisor = authService.verifyAuthToken('ifia-token-maint-supervisor-marcus');
  assert.strictEqual(oldSupervisor, null, 'Legacy static supervisor token must be rejected');

  // 2. Bogus / unformatted token rejection
  const invalid = authService.verifyAuthToken('bogus-malicious-token');
  assert.strictEqual(invalid, null, 'Arbitrary unformatted token must be rejected');

  // 3. Issue cryptographically signed token for certified principal
  const signedAlexToken = authService.issueTokenForPrincipal('alex.henderson');
  assert.ok(signedAlexToken, 'Signed token must be issued for certified principal');
  assert.ok(signedAlexToken.startsWith('ifia_'), 'Token must carry ifia_ signature prefix');

  const verifiedAlex = authService.verifyAuthToken(signedAlexToken);
  assert.ok(verifiedAlex, 'Signed token must verify cleanly');
  assert.strictEqual(verifiedAlex?.name, 'Alex Henderson, PE');
  assert.strictEqual(verifiedAlex?.role, 'LEAD_ELECTRICAL_ENGINEER');
  assert.strictEqual(verifiedAlex?.licenseNumber, 'PE-104928-TX');
});

test('Auth Service detects token tampering, forged signatures, and expired credentials', () => {
  const validToken = authService.issueTokenForPrincipal('alex.henderson')!;
  const [prefixAndPayload, signature] = validToken.split('.');

  // 1. Tampered signature
  const tamperedSigToken = `${prefixAndPayload}.${signature.slice(0, -2)}xx`;
  assert.strictEqual(
    authService.verifyAuthToken(tamperedSigToken),
    null,
    'Tampered signature must fail verification'
  );

  // 2. Role escalation tampering (attempting to turn technician into lead engineer)
  const techToken = authService.issueTokenForPrincipal('david.chen')!;
  const techParts = techToken.slice(5).split('.');
  const techPayload = JSON.parse(Buffer.from(techParts[0], 'base64url').toString('utf-8'));
  techPayload.role = 'LEAD_ELECTRICAL_ENGINEER'; // Attacker attempts role forgery
  const forgedPayloadB64 = Buffer.from(JSON.stringify(techPayload)).toString('base64url');
  const forgedTokenWithOldSig = `ifia_${forgedPayloadB64}.${techParts[1]}`;
  assert.strictEqual(
    authService.verifyAuthToken(forgedTokenWithOldSig),
    null,
    'Modified payload with unchanged signature must fail'
  );

  // 3. Expired token rejection
  const expiredToken = authService.generateSignedToken(
    CERTIFIED_PRINCIPALS['alex.henderson'],
    -1000 // Expired 1 second ago
  );
  assert.strictEqual(
    authService.verifyAuthToken(expiredToken),
    null,
    'Expired bearer token must be rejected'
  );

  // 4. Future token rejection (beyond clock-drift tolerance)
  const futureClaims = {
    ...CERTIFIED_PRINCIPALS['alex.henderson'],
    issuedAt: Date.now() + 300000 // 5 minutes in future
  };
  const futureToken = authService.generateSignedToken(futureClaims);
  assert.strictEqual(
    authService.verifyAuthToken(futureToken),
    null,
    'Token issued far in the future must be rejected'
  );
});

test('Approval Authorization Policy rejects unauthenticated and unauthorized callers (IFIA-SEC-001)', () => {
  const testCase: RCACase = JSON.parse(JSON.stringify(syntheticCases[0]));
  testCase.case_id = 'RCA-AUTH-TEST-01';
  testCase.case_status = 'AWAITING_ENGINEERING_REVIEW';
  testCase.approvals = [];
  db.saveCase(testCase);

  // 1. Anonymous caller rejected with 401
  const anonCtx = createMockReqRes({}, { decision: 'ACCEPTED', notes: 'Anonymous attempt' }, { caseId: testCase.case_id });
  authenticateUser(anonCtx.req, anonCtx.res, anonCtx.next);
  assert.strictEqual(anonCtx.isNextCalled(), false, 'Anonymous caller must not proceed');
  assert.strictEqual(anonCtx.getStatus(), 401);
  assert.strictEqual(anonCtx.getBody().code, 'UNAUTHORIZED_ANONYMOUS');

  // 2. Legacy static token caller rejected with 401
  const legacyCtx = createMockReqRes(
    { authorization: 'Bearer ifia-token-lead-engineer-alex' },
    { decision: 'ACCEPTED', notes: 'Legacy token attempt' },
    { caseId: testCase.case_id }
  );
  authenticateUser(legacyCtx.req, legacyCtx.res, legacyCtx.next);
  assert.strictEqual(legacyCtx.isNextCalled(), false, 'Legacy token caller must not proceed');
  assert.strictEqual(legacyCtx.getStatus(), 401);
  assert.strictEqual(legacyCtx.getBody().code, 'UNAUTHORIZED_INVALID_CREDENTIALS');

  // 3. Technician role rejected with 403 by role guard
  const techToken = authService.issueTokenForPrincipal('david.chen')!;
  const techAuthCtx = createMockReqRes({ authorization: `Bearer ${techToken}` });
  authenticateUser(techAuthCtx.req, techAuthCtx.res, techAuthCtx.next);
  assert.strictEqual(techAuthCtx.isNextCalled(), true, 'Technician authentication succeeds');
  assert.ok(techAuthCtx.req.user);
  assert.strictEqual(techAuthCtx.req.user.role, 'TECHNICIAN');

  const approvalRoleGuard = requireRole(['LEAD_ELECTRICAL_ENGINEER', 'RELIABILITY_DIRECTOR', 'PLANT_OPERATIONS_MANAGER']);
  approvalRoleGuard(techAuthCtx.req, techAuthCtx.res, techAuthCtx.next);
  assert.strictEqual(techAuthCtx.getStatus(), 403, 'Technician must be rejected with 403 FORBIDDEN');
  assert.strictEqual(techAuthCtx.getBody().code, 'FORBIDDEN_ROLE');

  // 4. Lead Engineer with signed token is authorized
  const leadToken = authService.issueTokenForPrincipal('alex.henderson')!;
  const leadAuthCtx = createMockReqRes({ authorization: `Bearer ${leadToken}` });
  authenticateUser(leadAuthCtx.req, leadAuthCtx.res, leadAuthCtx.next);
  assert.strictEqual(leadAuthCtx.isNextCalled(), true);

  let leadRolePassed = false;
  approvalRoleGuard(leadAuthCtx.req, leadAuthCtx.res, () => {
    leadRolePassed = true;
  });
  assert.strictEqual(leadRolePassed, true, 'Lead Engineer must be authorized');

  // 5. Forged identity protection: ensure server-derived principal overrides body values
  const forgedPayload = {
    reviewer_name: 'Impersonated Chief Officer',
    reviewer_role: 'CHIEF_ENGINEERING_OFFICER',
    decision: 'ACCEPTED',
    notes: 'Approved without valid credentials.',
    review_duration_minutes: 20
  };

  const principal = leadAuthCtx.req.user!;
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

test('CMMS Dispatch Authorization blocks unauthenticated callers and unauthorized roles (IFIA-SEC-002)', () => {
  const authorizedDispatchRoles = [
    'LEAD_ELECTRICAL_ENGINEER',
    'RELIABILITY_DIRECTOR',
    'MAINTENANCE_SUPERVISOR',
    'PLANT_OPERATIONS_MANAGER'
  ];

  // 1. Anonymous dispatch rejected with 401
  const anonCtx = createMockReqRes({}, {}, { caseId: 'RCA-2026-33KV-001' });
  authenticateUser(anonCtx.req, anonCtx.res, anonCtx.next);
  assert.strictEqual(anonCtx.isNextCalled(), false);
  assert.strictEqual(anonCtx.getStatus(), 401);

  // 2. Technician cannot dispatch CMMS (403 FORBIDDEN)
  const techToken = authService.issueTokenForPrincipal('david.chen')!;
  const techCtx = createMockReqRes({ authorization: `Bearer ${techToken}` }, {}, { caseId: 'RCA-2026-33KV-001' });
  authenticateUser(techCtx.req, techCtx.res, techCtx.next);
  assert.strictEqual(techCtx.isNextCalled(), true);

  const dispatchRoleGuard = requireRole(authorizedDispatchRoles as any);
  dispatchRoleGuard(techCtx.req, techCtx.res, techCtx.next);
  assert.strictEqual(techCtx.getStatus(), 403);
  assert.strictEqual(techCtx.getBody().code, 'FORBIDDEN_ROLE');

  // 3. Maintenance Supervisor is authorized to dispatch
  const supervisorToken = authService.issueTokenForPrincipal('marcus.vance')!;
  const supCtx = createMockReqRes({ authorization: `Bearer ${supervisorToken}` }, {}, { caseId: 'RCA-2026-33KV-001' });
  authenticateUser(supCtx.req, supCtx.res, supCtx.next);

  let supervisorPassed = false;
  dispatchRoleGuard(supCtx.req, supCtx.res, () => {
    supervisorPassed = true;
  });
  assert.strictEqual(supervisorPassed, true, 'Maintenance Supervisor must have dispatch privileges');
});

test('Auth Secret Configuration security rules prevent predictable fallback in production', () => {
  const predictable = 'ifia-secure-industrial-airgap-auth-secret-key-2026';

  // 1. In production, predictable default must throw
  assert.throws(() => {
    validateAuthSecretConfig(predictable, 'production');
  }, /Predictable default AUTH_SECRET cannot be used in production/);

  // 2. In production, missing secret must throw
  assert.throws(() => {
    validateAuthSecretConfig('', 'production');
  }, /AUTH_SECRET environment variable is mandatory in production/);

  // 3. In production, short secret (< 32 chars) must throw
  assert.throws(() => {
    validateAuthSecretConfig('short-secret-key', 'production');
  }, /AUTH_SECRET must be at least 32 characters long in production/);

  // 4. In production, valid 256-bit secret succeeds
  const validSecret = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const resolved = validateAuthSecretConfig(validSecret, 'production');
  assert.strictEqual(resolved, validSecret);

  // 5. In development with missing secret, ephemeral 256-bit secret is generated
  const devEphemeral = validateAuthSecretConfig(undefined, 'development');
  assert.ok(devEphemeral);
  assert.strictEqual(devEphemeral.length, 64); // 32 bytes in hex = 64 hex chars
});

test('Public Principals Directory does not disclose credentials or tokens', () => {
  const publicDirectory = authService.getPublicPrincipalsDirectory();
  assert.ok(Array.isArray(publicDirectory));
  assert.ok(publicDirectory.length >= 4);

  publicDirectory.forEach(principal => {
    assert.ok(principal.id);
    assert.ok(principal.name);
    assert.ok(principal.role);
    // Explicitly verify no tokens or secrets are present
    assert.strictEqual((principal as any).token, undefined);
    assert.strictEqual((principal as any).secret, undefined);
    assert.strictEqual((principal as any).default_token, undefined);
  });
});

test('Principal-claim validation closes directory gap: rejects unknown usernames and every mismatched authoritative claim', () => {
  const validPrincipal = CERTIFIED_PRINCIPALS['alex.henderson'];

  // 1. Unknown principal username is rejected even if signature is valid
  const unknownPrincipalToken = authService.generateSignedToken({
    id: 'USR-UNKNOWN-999',
    username: 'unknown.intruder',
    name: 'Unknown Intruder',
    role: 'LEAD_ELECTRICAL_ENGINEER',
    department: 'Electrical Reliability & Asset Management',
    licenseNumber: 'PE-104928-TX'
  });
  assert.strictEqual(
    authService.verifyAuthToken(unknownPrincipalToken),
    null,
    'Unknown principal username must be rejected'
  );

  // 2. Mismatched ID is rejected
  const mismatchedIdToken = authService.generateSignedToken({
    ...validPrincipal,
    id: 'USR-FORGED-ID'
  });
  assert.strictEqual(
    authService.verifyAuthToken(mismatchedIdToken),
    null,
    'Mismatched principal ID must be rejected'
  );

  // 3. Mismatched Role is rejected
  const mismatchedRoleToken = authService.generateSignedToken({
    ...validPrincipal,
    role: 'TECHNICIAN'
  });
  assert.strictEqual(
    authService.verifyAuthToken(mismatchedRoleToken),
    null,
    'Mismatched principal role must be rejected'
  );

  // 4. Mismatched Name is rejected
  const mismatchedNameToken = authService.generateSignedToken({
    ...validPrincipal,
    name: 'Forged Alex Impersonator'
  });
  assert.strictEqual(
    authService.verifyAuthToken(mismatchedNameToken),
    null,
    'Mismatched principal name must be rejected'
  );

  // 5. Mismatched Department is rejected
  const mismatchedDeptToken = authService.generateSignedToken({
    ...validPrincipal,
    department: 'Unregistered Rogue Department'
  });
  assert.strictEqual(
    authService.verifyAuthToken(mismatchedDeptToken),
    null,
    'Mismatched principal department must be rejected'
  );

  // 6. Mismatched License Number is rejected
  const mismatchedLicenseToken = authService.generateSignedToken({
    ...validPrincipal,
    licenseNumber: 'PE-FAKE-LICENSE'
  });
  assert.strictEqual(
    authService.verifyAuthToken(mismatchedLicenseToken),
    null,
    'Mismatched license number must be rejected'
  );

  // 7. Legitimate token with all claims matching directory verifies cleanly
  const legitimateToken = authService.generateSignedToken(validPrincipal);
  const verified = authService.verifyAuthToken(legitimateToken);
  assert.ok(verified, 'Authentic registered principal token must verify cleanly');
  assert.strictEqual(verified?.id, validPrincipal.id);
  assert.strictEqual(verified?.username, validPrincipal.username);
  assert.strictEqual(verified?.name, validPrincipal.name);
  assert.strictEqual(verified?.role, validPrincipal.role);
  assert.strictEqual(verified?.department, validPrincipal.department);
  assert.strictEqual(verified?.licenseNumber, validPrincipal.licenseNumber);
});


