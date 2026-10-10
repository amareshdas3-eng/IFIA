import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { HumanApprovalRecord } from '../schemas/rcaContract.js';

export const approvalsRouter = Router();

approvalsRouter.post('/:caseId', (req: Request, res: Response) => {
  const caseId = req.params.caseId as string;
  const currentCase = db.getCaseById(caseId);

  if (!currentCase) {
    res.status(404).json({ success: false, message: `Case ${caseId} not found` });
    return;
  }

  const {
    reviewer_name,
    reviewer_role,
    decision,
    notes,
    review_duration_minutes
  } = req.body;

  if (!reviewer_name || !decision) {
    res.status(400).json({ success: false, message: 'reviewer_name and decision are required' });
    return;
  }

  const approvalRecord: HumanApprovalRecord = {
    reviewer_name,
    reviewer_role: reviewer_role || 'LEAD_ELECTRICAL_ENGINEER',
    decision,
    notes: notes || 'Engineering evaluation conducted per standard operating procedures.',
    timestamp: new Date().toISOString(),
    review_duration_minutes: Number(review_duration_minutes) || 15
  };

  currentCase.approvals.push(approvalRecord);
  currentCase.metrics.engineer_review_minutes =
    (currentCase.metrics.engineer_review_minutes || 0) + approvalRecord.review_duration_minutes;

  // Update status based on decision
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
  } else if (decision === 'REQUEST_MORE_EVIDENCE') {
    currentCase.case_status = 'IN_INVESTIGATION';
  }

  currentCase.updated_at = new Date().toISOString();
  db.saveCase(currentCase);

  db.appendAuditLog({
    case_id: currentCase.case_id,
    timestamp: new Date().toISOString(),
    actor: reviewer_name,
    actor_role: reviewer_role,
    action: `ENGINEERING_REVIEW_${decision}`,
    details: {
      decision,
      notes,
      review_duration_minutes
    }
  });

  res.json({
    success: true,
    message: `Engineering review recorded: ${decision}`,
    case: currentCase
  });
});
