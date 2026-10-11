import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { cmmsAdapter } from '../services/cmmsAdapter.js';
import { authenticateUser, requireRole, optionalAuthenticateUser } from '../middleware/auth.js';

export const cmmsRouter = Router();

// Authorized maintenance dispatch roles
const AUTHORIZED_DISPATCH_ROLES = [
  'LEAD_ELECTRICAL_ENGINEER',
  'RELIABILITY_DIRECTOR',
  'MAINTENANCE_SUPERVISOR',
  'PLANT_OPERATIONS_MANAGER'
] as const;

// Preview CMMS Work Order draft
cmmsRouter.get('/preview/:caseId', optionalAuthenticateUser, (req: Request, res: Response): void => {
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
// Enforces mandatory caller authentication and authorized role verification (IFIA-SEC-002)
cmmsRouter.post(
  '/dispatch/:caseId',
  authenticateUser,
  requireRole([...AUTHORIZED_DISPATCH_ROLES]),
  async (req: Request, res: Response): Promise<void> => {
    const caseId = req.params.caseId as string;
    const currentCase = db.getCaseById(caseId);

    if (!currentCase) {
      res.status(404).json({ success: false, message: `Case ${caseId} not found` });
      return;
    }

    // Identity and role derived strictly from verified authenticated principal claims
    const principal = req.user!;

    const result = await cmmsAdapter.dispatchWorkOrder(
      currentCase,
      principal.role,
      principal.name
    );

    if (!result.success) {
      res.status(403).json({
        ...result,
        dispatcher: {
          name: principal.name,
          role: principal.role,
          id: principal.id
        }
      });
      return;
    }

    res.json({
      ...result,
      dispatcher: {
        name: principal.name,
        role: principal.role,
        id: principal.id
      }
    });
  }
);
