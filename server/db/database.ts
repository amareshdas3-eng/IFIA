import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config.js';
import { RCACase, RCACaseSchema } from '../schemas/rcaContract.js';

export interface AuditLogEntry {
  audit_id: string;
  case_id: string;
  timestamp: string;
  actor: string;
  actor_role: string;
  action: string;
  details: Record<string, unknown>;
  ip_address?: string;
  integrity_hash: string;
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

class Store {
  private casesMap: Map<string, RCACase> = new Map();
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
    // Validate with Zod schema
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

  public appendAuditLog(entry: Omit<AuditLogEntry, 'audit_id' | 'integrity_hash'>): AuditLogEntry {
    this.init();
    const audit_id = `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const payload = `${audit_id}:${entry.case_id}:${entry.timestamp}:${entry.action}:${JSON.stringify(entry.details)}`;
    const integrity_hash = crypto.createHash('sha256').update(payload).digest('hex');

    const record: AuditLogEntry = {
      audit_id,
      ...entry,
      integrity_hash
    };

    this.auditLogs.unshift(record);
    this.saveAudit();
    return record;
  }

  public getAuditLogs(caseId?: string): AuditLogEntry[] {
    this.init();
    if (caseId) {
      return this.auditLogs.filter(l => l.case_id === caseId);
    }
    return this.auditLogs;
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
