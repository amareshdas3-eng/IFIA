import { z } from 'zod';

export const TimestampQualitySchema = z.enum([
  'SOURCE_RECORDED',
  'ESTIMATED',
  'UNRELIABLE_DRIFT',
  'SYNTHETIC_BENCHMARK'
]);

export const FactOrInferenceSchema = z.enum(['OBSERVED', 'INFERRED']);

export const EvidenceSourceSchema = z.enum([
  'ALARM_LOG',
  'RELAY_RECORD',
  'OPERATOR_LOG',
  'DGA_ANALYSIS',
  'VIBRATION_SPECTRUM',
  'THERMOGRAPHY_REPORT',
  'MAINTENANCE_HISTORY',
  'INSPECTION_RECORD',
  'VENDOR_MANUAL',
  'COMMISSIONING_TEST'
]);

export const EvidenceRecordSchema = z.object({
  evidence_id: z.string(),
  source_type: EvidenceSourceSchema,
  title: z.string(),
  raw_content: z.string(),
  timestamp: z.string(),
  reliability: z.enum(['HIGH', 'MEDIUM', 'QUESTIONABLE', 'UNVERIFIED']),
  tags: z.array(z.string()).default([]),
  is_unreliable_timestamp: z.boolean().default(false),
  contradiction_flag: z.boolean().default(false),
  source_reference: z.string()
});

export const TimelineEventSchema = z.object({
  timestamp: z.string(),
  event: z.string(),
  evidence_ids: z.array(z.string()),
  fact_or_inference: FactOrInferenceSchema,
  timestamp_quality: TimestampQualitySchema,
  sequence_index: z.number().optional()
});

export const HypothesisConfidenceSchema = z.object({
  label: z.enum(['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT_EVIDENCE']),
  type: z.literal('QUALITATIVE_MODEL_ASSESSMENT'),
  calibrated: z.literal(false),
  heuristic_score: z.number().min(0).max(100).optional()
});

export const HypothesisSchema = z.object({
  hypothesis_id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['RETAINED', 'UNVERIFIED_HYPOTHESIS', 'REJECTED', 'DOWNGRADED']),
  supporting_evidence_ids: z.array(z.string()),
  contradicting_evidence_ids: z.array(z.string()),
  missing_evidence: z.array(z.string()),
  physical_rationale: z.string(),
  confidence: HypothesisConfidenceSchema,
  falsification_test: z.string(),
  next_diagnostic_step: z.string()
});

export interface FaultTreeNode {
  id: string;
  label: string;
  type: 'TOP_EVENT' | 'INTERMEDIATE' | 'BASIC_EVENT' | 'UNDEVELOPED';
  gate?: 'AND' | 'OR' | 'SINGLE';
  evidence_ids?: string[];
  children?: FaultTreeNode[];
}

export const FaultTreeNodeSchema: z.ZodType<FaultTreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['TOP_EVENT', 'INTERMEDIATE', 'BASIC_EVENT', 'UNDEVELOPED']),
    gate: z.enum(['AND', 'OR', 'SINGLE']).optional(),
    evidence_ids: z.array(z.string()).default([]),
    children: z.array(FaultTreeNodeSchema).default([])
  })
);

export const RootCauseConclusionSchema = z.object({
  status: z.enum([
    'CONFIRMED',
    'PROBABLE',
    'INSUFFICIENT_EVIDENCE',
    'COMPETING_CAUSES_UNRESOLVED'
  ]),
  approved_by_human: z.boolean(),
  statement: z.string().nullable(),
  immediate_mechanism: z.string(),
  contributing_factors: z.array(z.string()),
  systemic_factors: z.array(z.string()),
  equipment_standards_referenced: z.array(z.string()).default([])
});

export const ActionItemSchema = z.object({
  action_id: z.string(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE', 'VERIFICATION']),
  description: z.string(),
  priority: z.enum(['SAFETY_CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'REQUIRES_ENGINEER_REVIEW']),
  responsible_role: z.string(),
  dependencies: z.array(z.string()).default([]),
  verification_criteria: z.string(),
  target_date: z.string(),
  approval_status: z.enum(['DRAFT', 'APPROVED', 'REJECTED'])
});

export const QAFindingSchema = z.object({
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR', 'INFORMATIONAL']),
  claim: z.string(),
  reason: z.string(),
  remediation: z.string()
});

export const QAReviewSchema = z.object({
  decision: z.enum(['READY_FOR_AUTHORIZED_REVIEW', 'REVISE', 'REJECT']),
  traceability_score_pct: z.number().min(0).max(100),
  findings: z.array(QAFindingSchema),
  hallucination_detected: z.boolean(),
  safety_policy_passed: z.boolean(),
  audited_at: z.string(),
  auditor_engine: z.string()
});

export const CMMSWorkOrderSchema = z.object({
  work_order_id: z.string(),
  mode: z.enum(['SANDBOX', 'MAXIMO_REST', 'SAP_PM_REST']),
  equipment_tag: z.string(),
  problem_statement: z.string(),
  failure_findings: z.array(z.string()),
  work_description: z.string(),
  safety_prerequisites: z.array(z.string()),
  inspection_hold_points: z.array(z.string()),
  parts_requiring_verification: z.array(z.string()),
  idempotency_key: z.string(),
  work_order_status: z.enum([
    'DRAFT_NOT_SUBMITTED',
    'APPROVED_STAGED',
    'SUBMITTED_TO_CMMS',
    'DISPATCHED'
  ]),
  submitted_at: z.string().nullable().optional(),
  cmms_system_reference: z.string().nullable().optional()
});

export const HumanApprovalRecordSchema = z.object({
  reviewer_name: z.string(),
  reviewer_role: z.enum([
    'LEAD_ELECTRICAL_ENGINEER',
    'SENIOR_RELIABILITY_ENGINEER',
    'PLANT_MAINTENANCE_MANAGER',
    'CHIEF_ENGINEERING_OFFICER'
  ]),
  decision: z.enum(['ACCEPTED', 'REJECTED', 'MODIFIED', 'REQUEST_MORE_EVIDENCE']),
  notes: z.string(),
  timestamp: z.string(),
  review_duration_minutes: z.number().min(0)
});

export const RCACaseSchema = z.object({
  case_id: z.string(),
  title: z.string(),
  equipment_tag: z.string(),
  equipment_class: z.string(),
  plant: z.string(),
  event_timestamp: z.string(),
  failure_symptoms: z.string(),
  operational_impact: z.string(),
  case_status: z.enum([
    'AWAITING_ANALYSIS',
    'IN_INVESTIGATION',
    'AWAITING_ENGINEERING_REVIEW',
    'APPROVED',
    'REJECTED',
    'CLOSED'
  ]),
  data_mode: z.enum(['SYNTHETIC_DEMO', 'FIELD_EVIDENCE', 'BENCHMARK_SUITE']),
  evidence_register: z.array(EvidenceRecordSchema),
  event_timeline: z.array(TimelineEventSchema),
  hypotheses: z.array(HypothesisSchema),
  fault_tree: FaultTreeNodeSchema.optional(),
  root_cause_conclusion: RootCauseConclusionSchema,
  recommended_actions: z.array(ActionItemSchema),
  qa_review: QAReviewSchema.optional(),
  cmms: CMMSWorkOrderSchema,
  approvals: z.array(HumanApprovalRecordSchema).default([]),
  metrics: z.object({
    investigation_start_time: z.string(),
    investigation_end_time: z.string().optional(),
    elapsed_ai_minutes: z.number().default(0),
    manual_baseline_days: z.number().default(14),
    engineer_review_minutes: z.number().default(0),
    evidence_coverage_pct: z.number().default(0)
  }),
  created_at: z.string(),
  updated_at: z.string()
});

export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type Hypothesis = z.infer<typeof HypothesisSchema>;
export type RootCauseConclusion = z.infer<typeof RootCauseConclusionSchema>;
export type ActionItem = z.infer<typeof ActionItemSchema>;
export type QAReview = z.infer<typeof QAReviewSchema>;
export type QAFinding = z.infer<typeof QAFindingSchema>;
export type CMMSWorkOrder = z.infer<typeof CMMSWorkOrderSchema>;
export type HumanApprovalRecord = z.infer<typeof HumanApprovalRecordSchema>;
export type RCACase = z.infer<typeof RCACaseSchema>;
