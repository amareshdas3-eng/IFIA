import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { benchmarkService } from '../services/benchmarkService.js';

export const benchmarkRouter = Router();

benchmarkRouter.get('/summary', (_req: Request, res: Response) => {
  const summary = benchmarkService.getSummary();
  res.json({ success: true, summary });
});

benchmarkRouter.get('/runs', (_req: Request, res: Response) => {
  const runs = db.getBenchmarkRuns();
  res.json({ success: true, runs });
});

benchmarkRouter.post('/run/:caseId', (req: Request, res: Response) => {
  const caseId = req.params.caseId as string;
  const currentCase = db.getCaseById(caseId);

  if (!currentCase) {
    res.status(404).json({ success: false, message: `Case ${caseId} not found` });
    return;
  }

  const result = benchmarkService.runCaseBenchmark(currentCase);
  res.json({ success: true, run: result });
});

// Run full suite on all available cases
benchmarkRouter.post('/run-all', (_req: Request, res: Response) => {
  const cases = db.getCases();
  const runs = cases.map(c => benchmarkService.runCaseBenchmark(c));
  const summary = benchmarkService.getSummary();
  res.json({ success: true, run_count: runs.length, runs, summary });
});
