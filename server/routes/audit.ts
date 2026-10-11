import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { optionalAuthenticateUser } from '../middleware/auth.js';

export const auditRouter = Router();

// Retrieve audit logs
auditRouter.get('/', optionalAuthenticateUser, (req: Request, res: Response) => {
  const caseId = req.query.case_id as string | undefined;
  const logs = db.getAuditLogs(caseId);
  res.json({ success: true, count: logs.length, logs });
});

// Cryptographic audit integrity verification endpoint (IFIA-SEC-005)
auditRouter.get('/verify', optionalAuthenticateUser, (_req: Request, res: Response) => {
  const report = db.verifyAuditLogIntegrity();
  res.json({ success: true, report });
});
