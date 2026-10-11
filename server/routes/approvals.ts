import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { HumanApprovalRecord, ApprovalDecisionRequestSchema } from '../schemas/rcaContract.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';

export const approvalsRouter = Router();

// Authorized engineering approval roles per IEEE/IEC plant governance
const AUTHORIZED_APPROVAL_ROLES = [
  'LEAD_ELECTRICAL_ENGINEER',
  'RELIABILITY_DIRECTOR',
  'PLANT_OPERATIONS_MANAGER'
] as const;

/**
 * POST /api/approvals/:caseId
 * Enforces mandatory authentication, authorized role verification, and payload schema validation.
 * Caller-supplied identity in body is rejected in favor of verified authenticated principal claims.
 */
approvalsRouter.post(
  '/:caseId',
  authenticateUser,
  requireRole([...AUTHORIZED_APPROVAL_ROLES]),
  (req: Request, res: Response): void => {
    const caseId = req.params.caseId as string;
    const currentCase = db.getCaseById(caseId);

    if (!currentCase) {
      res.status(404).json({ success: false, message: `Case ${caseId} not found` });
      return;
    }

    // Validate payload against strict engineering schema
    const parseResult = ApprovalDecisionRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid engineering approval request payload',
        errors: parseResult.error.issues
      });
      return;
    }

    const { decision, notes, review_duration_minutes } = parseResult.data;

    // Authoritative principal claims from verified authentication token
    const principal = req.user!;

    const approvalRecord: HumanApprovalRecord = {
      reviewer_name: principal.name,
      reviewer_role: principal.role as any,
      reviewer_id: principal.id,
      reviewer_license: principal.licenseNumber,
      decision,
      notes,
      timestamp: new Date().toISOString(),
      review_duration_minutes: Number(review_duration_minutes) || 15
    };

    currentCase.approvals.unshift(approvalRecord);
    currentCase.metrics.engineer_review_minutes =
      (currentCase.metrics.engineer_review_minutes || 0) + approvalRecord.review_duration_minutes;

    // Update status based on verified decision
    if (decision === 'ACCEPTED') {
      currentCase.case_status = 'APPROVED';
      currentCase.root_cause_conclusion.approved_by_human = true;
      currentCase.recommended_actions.forEach(a => {
        a.approval_status = 'APPROVED';
      });
      currentCase.cmms.work_order_status = 'APPROVED_STAGED';
    } else if (decision === 'REJECTED') {
      currentCase.case_status = 'REJECTED';
      currentCase.root_cause_conclusion.approved_by_human = false;
      currentCase.recommended_actions.forEach(a => {
        a.approval_status = 'REJECTED';
      });
      currentCase.cmms.work_order_status = 'DRAFT_NOT_SUBMITTED';
    } else if (decision === 'REQUEST_MORE_EVIDENCE') {
      currentCase.case_status = 'IN_INVESTIGATION';
    }

    currentCase.updated_at = new Date().toISOString();
    db.saveCase(currentCase);

    db.appendAuditLog({
      case_id: currentCase.case_id,
      timestamp: new Date().toISOString(),
      actor: principal.name,
      actor_role: principal.role,
      action: `ENGINEERING_REVIEW_${decision}`,
      details: {
        principal_id: principal.id,
        license_number: principal.licenseNumber || 'N/A',
        department: principal.department,
        decision,
        notes,
        review_duration_minutes: approvalRecord.review_duration_minutes
      }
    });

    res.json({
      success: true,
      message: `Engineering review authenticated and recorded: ${decision} by ${principal.name} (${principal.role})`,
      case: currentCase,
      authenticated_principal: {
        name: principal.name,
        role: principal.role,
        license: principal.licenseNumber
      }
    });
  }
);
