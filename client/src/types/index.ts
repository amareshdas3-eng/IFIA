export type CaseStatus =
  | 'AWAITING_ANALYSIS'
  | 'IN_INVESTIGATION'
  | 'AWAITING_ENGINEERING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED';

export type EvidenceSourceType =
  | 'ALARM_LOG'
  | 'RELAY_RECORD'
  | 'OPERATOR_LOG'
  | 'DGA_ANALYSIS'
  | 'VIBRATION_SPECTRUM'
  | 'THERMOGRAPHY_REPORT'
  | 'MAINTENANCE_HISTORY'
  | 'INSPECTION_RECORD'
  | 'VENDOR_MANUAL'
  | 'COMMISSIONING_TEST';

export interface EvidenceRecord {
  evidence_id: string;
  source_type: EvidenceSourceType;
  title: string;
  raw_content: string;
  timestamp: string;
  reliability: 'HIGH' | 'MEDIUM' | 'QUESTIONABLE' | 'UNVERIFIED';
  tags: string[];
  is_unreliable_timestamp: boolean;
  contradiction_flag: boolean;
  source_reference: string;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  evidence_ids: string[];
  fact_or_inference: 'OBSERVED' | 'INFERRED';
  timestamp_quality: 'SOURCE_RECORDED' | 'ESTIMATED' | 'UNRELIABLE_DRIFT' | 'SYNTHETIC_BENCHMARK';
  sequence_index?: number;
}

export interface Hypothesis {
  hypothesis_id: string;
  title: string;
  description: string;
  status: 'RETAINED' | 'UNVERIFIED_HYPOTHESIS' | 'REJECTED' | 'DOWNGRADED';
  supporting_evidence_ids: string[];
  contradicting_evidence_ids: string[];
  missing_evidence: string[];
  physical_rationale: string;
  confidence: {
    label: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_EVIDENCE';
    type: 'QUALITATIVE_MODEL_ASSESSMENT';
    calibrated: false;
    heuristic_score?: number;
  };
  falsification_test: string;
  next_diagnostic_step: string;
}

export interface FaultTreeNode {
  id: string;
  label: string;
  type: 'TOP_EVENT' | 'INTERMEDIATE' | 'BASIC_EVENT' | 'UNDEVELOPED';
  gate?: 'AND' | 'OR' | 'SINGLE';
  evidence_ids?: string[];
  children?: FaultTreeNode[];
}

export interface RootCauseConclusion {
  status: 'CONFIRMED' | 'PROBABLE' | 'INSUFFICIENT_EVIDENCE' | 'COMPETING_CAUSES_UNRESOLVED';
  approved_by_human: boolean;
  statement: string | null;
  immediate_mechanism: string;
  contributing_factors: string[];
  systemic_factors: string[];
  equipment_standards_referenced: string[];
}

export interface ActionItem {
  action_id: string;
  type: 'CORRECTIVE' | 'PREVENTIVE' | 'VERIFICATION';
  description: string;
  priority: 'SAFETY_CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'REQUIRES_ENGINEER_REVIEW';
  responsible_role: string;
  dependencies: string[];
  verification_criteria: string;
  target_date: string;
  approval_status: 'DRAFT' | 'APPROVED' | 'REJECTED';
}

export interface QAFinding {
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFORMATIONAL';
  claim: string;
  reason: string;
  remediation: string;
}

export interface QAReview {
  decision: 'READY_FOR_AUTHORIZED_REVIEW' | 'REVISE' | 'REJECT';
  traceability_score_pct: number;
  findings: QAFinding[];
  hallucination_detected: boolean;
  safety_policy_passed: boolean;
  audited_at: string;
  auditor_engine: string;
}

export interface CMMSWorkOrder {
  work_order_id: string;
  mode: 'SANDBOX' | 'MAXIMO_REST' | 'SAP_PM_REST';
  equipment_tag: string;
  problem_statement: string;
  failure_findings: string[];
  work_description: string;
  safety_prerequisites: string[];
  inspection_hold_points: string[];
  parts_requiring_verification: string[];
  idempotency_key: string;
  work_order_status: 'DRAFT_NOT_SUBMITTED' | 'APPROVED_STAGED' | 'SUBMITTED_TO_CMMS' | 'DISPATCHED';
  submitted_at?: string | null;
  cmms_system_reference?: string | null;
}

export interface HumanApprovalRecord {
  reviewer_name: string;
  reviewer_role: 'LEAD_ELECTRICAL_ENGINEER' | 'SENIOR_RELIABILITY_ENGINEER' | 'PLANT_MAINTENANCE_MANAGER' | 'CHIEF_ENGINEERING_OFFICER';
  decision: 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'REQUEST_MORE_EVIDENCE';
  notes: string;
  timestamp: string;
  review_duration_minutes: number;
}

export interface RCACase {
  case_id: string;
  title: string;
  equipment_tag: string;
  equipment_class: string;
  plant: string;
  event_timestamp: string;
  failure_symptoms: string;
  operational_impact: string;
  case_status: CaseStatus;
  data_mode: 'SYNTHETIC_DEMO' | 'FIELD_EVIDENCE' | 'BENCHMARK_SUITE';
  evidence_register: EvidenceRecord[];
  event_timeline: TimelineEvent[];
  hypotheses: Hypothesis[];
  fault_tree?: FaultTreeNode;
  root_cause_conclusion: RootCauseConclusion;
  recommended_actions: ActionItem[];
  qa_review?: QAReview;
  cmms: CMMSWorkOrder;
  approvals: HumanApprovalRecord[];
  metrics: {
    investigation_start_time: string;
    investigation_end_time?: string;
    elapsed_ai_minutes: number;
    manual_baseline_days: number;
    engineer_review_minutes: number;
    evidence_coverage_pct: number;
  };
  created_at: string;
  updated_at: string;
}

export interface BenchmarkSummary {
  total_runs: number;
  average_elapsed_reduction_pct: number;
  average_labor_hours_saved: number;
  average_traceability_score: number;
  zero_hallucination_rate_pct: number;
  zero_safety_violation_rate_pct: number;
  cmms_draft_accuracy_pct: number;
  manual_baseline_days: number;
  ai_assisted_median_hours: number;
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

export interface AuditLogEntry {
  audit_id: string;
  case_id: string;
  timestamp: string;
  actor: string;
  actor_role: string;
  action: string;
  details: Record<string, unknown>;
  integrity_hash: string;
}
