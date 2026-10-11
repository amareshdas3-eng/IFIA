import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config.js';
import { RCACase, RCACaseSchema } from '../schemas/rcaContract.js';

export const GENESIS_AUDIT_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export interface AuditLogEntry {
  audit_id: string;
  case_id: string;
  timestamp: string;
  actor: string;
  actor_role: string;
  action: string;
  details: Record<string, unknown>;
  ip_address?: string;
  previous_hash: string;
  integrity_hash: string;
}

export interface AuditVerificationResult {
  is_valid: boolean;
  total_records: number;
  tampered_records_count: number;
  chain_broken: boolean;
  tampered_audit_ids: string[];
  message: string;
  verified_at: string;
}

export interface BenchmarkRun {
  run_id: string;
  timestamp: string;
  case_id: string;
  manual_baseline_hours: number;
  ai_investigation_minutes: number;
  engineer_review_minutes: number;
  total_elapsed_hours: number;
  time_reduction_pct: number;
  evidence_traceability_score: number;
  hallucinations_detected: number;
  safety_violations_detected: number;
  cmms_draft_valid: boolean;
}

/**
 * Computes deterministic SHA-256 cryptographic digest over canonical record representation
 */
export function computeAuditEntryHash(
  previousHash: string,
  auditId: string,
  caseId: string,
  timestamp: string,
  actor: string,
  actorRole: string,
  action: string,
  details: Record<string, unknown>
): string {
  // Sort keys for canonical JSON serialization to guarantee deterministic output
  const keys = Object.keys(details).sort();
  const sortedDetails: Record<string, unknown> = {};
  for (const k of keys) {
    sortedDetails[k] = details[k];
  }
  const canonicalDetails = JSON.stringify(sortedDetails);
  const payload = `${previousHash}|${auditId}|${caseId}|${timestamp}|${actor}|${actorRole}|${action}|${canonicalDetails}`;
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

class Store {
  private casesMap: Map<string, RCACase> = new Map();
  // auditLogs stored in chronological order (oldest at index 0, newest at end)
  private auditLogs: AuditLogEntry[] = [];
  private benchmarkRuns: BenchmarkRun[] = [];
  private initialized = false;

  private casesFilePath: string;
  private auditFilePath: string;
  private benchmarkFilePath: string;

  constructor() {
    this.casesFilePath = path.join(config.storageDir, 'cases.json');
    this.auditFilePath = path.join(config.storageDir, 'audit_logs.json');
    this.benchmarkFilePath = path.join(config.storageDir, 'benchmark_runs.json');
  }

  public init() {
    if (this.initialized) return;

    if (!fs.existsSync(config.storageDir)) {
      fs.mkdirSync(config.storageDir, { recursive: true });
    }

    // Load cases
    if (fs.existsSync(this.casesFilePath)) {
      try {
        const data = fs.readFileSync(this.casesFilePath, 'utf-8');
        const parsed = JSON.parse(data) as RCACase[];
        parsed.forEach(c => this.casesMap.set(c.case_id, c));
      } catch (err) {
        console.error('Failed to parse existing cases file, starting fresh:', err);
      }
    }

    // Load audit logs
    if (fs.existsSync(this.auditFilePath)) {
      try {
        const data = fs.readFileSync(this.auditFilePath, 'utf-8');
        this.auditLogs = JSON.parse(data) as AuditLogEntry[];
        // Migrate legacy audit logs to unbroken chained SHA-256 standards (IFIA-SEC-005)
        if (this.auditLogs.some(l => !l.previous_hash)) {
          this.auditLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          let prev = GENESIS_AUDIT_HASH;
          for (const entry of this.auditLogs) {
            entry.previous_hash = prev;
            entry.integrity_hash = computeAuditEntryHash(
              prev,
              entry.audit_id,
              entry.case_id,
              entry.timestamp,
              entry.actor,
              entry.actor_role,
              entry.action,
              entry.details
            );
            prev = entry.integrity_hash;
          }
          this.saveAudit();
        }
      } catch (err) {
        console.error('Failed to parse existing audit logs:', err);
      }
    }

    // Load benchmarks
    if (fs.existsSync(this.benchmarkFilePath)) {
      try {
        const data = fs.readFileSync(this.benchmarkFilePath, 'utf-8');
        this.benchmarkRuns = JSON.parse(data) as BenchmarkRun[];
      } catch (err) {
        console.error('Failed to parse existing benchmarks:', err);
      }
    }

    this.initialized = true;
  }

  private saveCases() {
    const list = Array.from(this.casesMap.values());
    fs.writeFileSync(this.casesFilePath, JSON.stringify(list, null, 2), 'utf-8');
  }

  private saveAudit() {
    fs.writeFileSync(this.auditFilePath, JSON.stringify(this.auditLogs, null, 2), 'utf-8');
  }

  private saveBenchmark() {
    fs.writeFileSync(this.benchmarkFilePath, JSON.stringify(this.benchmarkRuns, null, 2), 'utf-8');
  }

  public getCases(): RCACase[] {
    this.init();
    return Array.from(this.casesMap.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  public getCaseById(caseId: string): RCACase | undefined {
    this.init();
    return this.casesMap.get(caseId);
  }

  public saveCase(rcaCase: RCACase): RCACase {
    this.init();
    const validated = RCACaseSchema.parse(rcaCase);
    this.casesMap.set(validated.case_id, validated);
    this.saveCases();
    return validated;
  }

  public deleteCase(caseId: string): boolean {
    this.init();
    const removed = this.casesMap.delete(caseId);
    if (removed) {
      this.saveCases();
    }
    return removed;
  }

  /**
   * Appends an immutable, chained cryptographic audit record using SHA-256 (IFIA-SEC-005)
   */
  public appendAuditLog(
    entry: Omit<AuditLogEntry, 'audit_id' | 'integrity_hash' | 'previous_hash'>
  ): AuditLogEntry {
    this.init();
    const audit_id = `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Chain hash to the latest existing entry in chronological log
    const previous_hash =
      this.auditLogs.length > 0
        ? this.auditLogs[this.auditLogs.length - 1].integrity_hash
        : GENESIS_AUDIT_HASH;

    const integrity_hash = computeAuditEntryHash(
      previous_hash,
      audit_id,
      entry.case_id,
      entry.timestamp,
      entry.actor,
      entry.actor_role,
      entry.action,
      entry.details
    );

    const record: AuditLogEntry = {
      audit_id,
      ...entry,
      previous_hash,
      integrity_hash
    };

    this.auditLogs.push(record);
    this.saveAudit();
    return record;
  }

  public getAuditLogs(caseId?: string): AuditLogEntry[] {
    this.init();
    const records = caseId
      ? this.auditLogs.filter(l => l.case_id === caseId)
      : this.auditLogs;
    // Return newest first for UI display
    return [...records].reverse();
  }

  /**
   * Verifies the cryptographic tamper-evident integrity of the entire audit trail
   */
  public verifyAuditLogIntegrity(): AuditVerificationResult {
    this.init();
    const tamperedIds: string[] = [];
    let chainBroken = false;

    for (let i = 0; i < this.auditLogs.length; i++) {
      const current = this.auditLogs[i];
      const expectedPrevHash =
        i === 0 ? GENESIS_AUDIT_HASH : this.auditLogs[i - 1].integrity_hash;

      // 1. Check chain continuity
      if (current.previous_hash !== expectedPrevHash) {
        chainBroken = true;
        tamperedIds.push(current.audit_id);
      }

      // 2. Recompute cryptographic hash from raw attributes
      const expectedHash = computeAuditEntryHash(
        current.previous_hash,
        current.audit_id,
        current.case_id,
        current.timestamp,
        current.actor,
        current.actor_role,
        current.action,
        current.details
      );

      if (current.integrity_hash !== expectedHash) {
        if (!tamperedIds.includes(current.audit_id)) {
          tamperedIds.push(current.audit_id);
        }
      }
    }

    const isValid = tamperedIds.length === 0 && !chainBroken;

    return {
      is_valid: isValid,
      total_records: this.auditLogs.length,
      tampered_records_count: tamperedIds.length,
      chain_broken: chainBroken,
      tampered_audit_ids: tamperedIds,
      message: isValid
        ? `Audit integrity verified: all ${this.auditLogs.length} records cryptographically validated with unbroken SHA-256 hash chains.`
        : `Audit integrity violation detected: ${tamperedIds.length} records have tampered payloads or broken hash links.`,
      verified_at: new Date().toISOString()
    };
  }

  public recordBenchmark(run: BenchmarkRun) {
    this.init();
    this.benchmarkRuns.unshift(run);
    this.saveBenchmark();
  }

  public getBenchmarkRuns(): BenchmarkRun[] {
    this.init();
    return this.benchmarkRuns;
  }
}

export const db = new Store();
