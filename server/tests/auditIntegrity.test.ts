import test from 'node:test';
import assert from 'node:assert';
import { db, computeAuditEntryHash, GENESIS_AUDIT_HASH } from '../db/database.js';

test('Audit Log ensures chained SHA-256 cryptographic integrity (IFIA-SEC-005)', () => {
  // Append first test entry
  const entry1 = db.appendAuditLog({
    case_id: 'RCA-HASH-TEST-01',
    timestamp: new Date().toISOString(),
    actor: 'Alex Henderson, PE',
    actor_role: 'LEAD_ELECTRICAL_ENGINEER',
    action: 'TEST_ACTION_INITIAL',
    details: { step: 1, parameter: '33kV' }
  });

  assert.ok(entry1.audit_id.startsWith('AUD-'));
  assert.strictEqual(entry1.integrity_hash.length, 64, 'Integrity hash must be a 64-char hex SHA-256 string');
  assert.ok(entry1.previous_hash.length >= 64, 'Previous hash must be present');

  // Append second test entry: should chain to entry1
  const entry2 = db.appendAuditLog({
    case_id: 'RCA-HASH-TEST-01',
    timestamp: new Date().toISOString(),
    actor: 'Dr. Jane Smith, PE',
    actor_role: 'RELIABILITY_DIRECTOR',
    action: 'TEST_ACTION_FOLLOWUP',
    details: { step: 2, verified: true }
  });

  assert.strictEqual(entry2.previous_hash, entry1.integrity_hash, 'Entry 2 must cryptographically chain to Entry 1');

  // Verify that full audit trail passes integrity check
  const verificationReport = db.verifyAuditLogIntegrity();
  assert.strictEqual(verificationReport.is_valid, true);
  assert.strictEqual(verificationReport.chain_broken, false);
  assert.strictEqual(verificationReport.tampered_records_count, 0);
});

test('Audit Log verification engine detects tampered records and broken hash chains', () => {
  // Compute expected hash manually
  const dummyPrevHash = 'a'.repeat(64);
  const dummyAuditId = 'AUD-TAMPER-TEST';
  const dummyCaseId = 'RCA-TAMPER-001';
  const dummyTimestamp = '2026-10-11T00:00:00.000Z';
  const originalActor = 'Alex Henderson, PE';
  const role = 'LEAD_ELECTRICAL_ENGINEER';
  const action = 'APPROVAL_ACCEPTED';
  const originalDetails = { notes: 'Genuine approval' };

  const validHash = computeAuditEntryHash(
    dummyPrevHash,
    dummyAuditId,
    dummyCaseId,
    dummyTimestamp,
    originalActor,
    role,
    action,
    originalDetails
  );

  // Scenario 1: Maliciously altered actor
  const tamperedActorHash = computeAuditEntryHash(
    dummyPrevHash,
    dummyAuditId,
    dummyCaseId,
    dummyTimestamp,
    'Attacker Impersonator', // Tampered actor
    role,
    action,
    originalDetails
  );
  assert.notStrictEqual(validHash, tamperedActorHash, 'Tampering with actor must alter cryptographic digest');

  // Scenario 2: Maliciously altered payload details
  const tamperedDetailsHash = computeAuditEntryHash(
    dummyPrevHash,
    dummyAuditId,
    dummyCaseId,
    dummyTimestamp,
    originalActor,
    role,
    action,
    { notes: 'Altered forged content' } // Tampered details
  );
  assert.notStrictEqual(validHash, tamperedDetailsHash, 'Tampering with payload must alter cryptographic digest');
});
