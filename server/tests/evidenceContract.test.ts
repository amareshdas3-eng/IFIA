import test from 'node:test';
import assert from 'node:assert';
import { RCACaseSchema, EvidenceRecordSchema } from '../schemas/rcaContract.js';
import { syntheticCases } from '../data/syntheticCases.js';

test('Evidence Contract Schema Validation on Synthetic 33kV Switchgear Case', () => {
  const switchgearCase = syntheticCases[0];
  const parsed = RCACaseSchema.safeParse(switchgearCase);
  assert.strictEqual(parsed.success, true, `Validation failed: ${JSON.stringify(parsed.error?.issues)}`);
});

test('Evidence Record Schema catches invalid reliability value', () => {
  const invalidRecord = {
    evidence_id: 'EV-999',
    source_type: 'ALARM_LOG',
    title: 'Test Alarm',
    raw_content: 'Alarm message',
    timestamp: '2026-04-12T04:12:00Z',
    reliability: 'SUPER_HIGH', // invalid enum
    tags: ['test'],
    is_unreliable_timestamp: false,
    contradiction_flag: false,
    source_reference: 'Test Ref'
  };

  const parsed = EvidenceRecordSchema.safeParse(invalidRecord);
  assert.strictEqual(parsed.success, false);
});
