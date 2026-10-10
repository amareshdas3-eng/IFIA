import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const auditRouter = Router();

auditRouter.get('/', (req: Request, res: Response) => {
  const caseId = req.query.case_id as string | undefined;
  const logs = db.getAuditLogs(caseId);
  res.json({ success: true, count: logs.length, logs });
});
