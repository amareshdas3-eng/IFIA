import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { cmmsAdapter } from '../services/cmmsAdapter.js';

export const cmmsRouter = Router();

// Preview CMMS Work Order draft
cmmsRouter.get('/preview/:caseId', (req: Request, res: Response) => {
  const caseId = req.params.caseId as string;
  const currentCase = db.getCaseById(caseId);

  if (!currentCase) {
    res.status(404).json({ success: false, message: `Case ${caseId} not found` });
    return;
  }

  res.json({
    success: true,
    work_order: currentCase.cmms,
    case_status: currentCase.case_status,
    requires_approval: !currentCase.root_cause_conclusion.approved_by_human
  });
});

// Dispatch work order to CMMS
cmmsRouter.post('/dispatch/:caseId', async (req: Request, res: Response) => {
  const caseId = req.params.caseId as string;
  const currentCase = db.getCaseById(caseId);

  if (!currentCase) {
    res.status(404).json({ success: false, message: `Case ${caseId} not found` });
    return;
  }

  const { user_role, user_name } = req.body;
  const role = user_role || 'LEAD_ELECTRICAL_ENGINEER';
  const name = user_name || 'Authorized Engineer';

  const result = await cmmsAdapter.dispatchWorkOrder(currentCase, role, name);

  if (!result.success) {
    res.status(403).json(result);
    return;
  }

  res.json(result);
});
