import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { rcaEngine } from '../services/rcaEngine.js';
import { syntheticCases } from '../data/syntheticCases.js';

export const casesRouter = Router();

// List all cases
casesRouter.get('/', (_req: Request, res: Response) => {
  let cases = db.getCases();
  if (cases.length === 0) {
    // Seed initial synthetic cases if database empty
    syntheticCases.forEach(c => db.saveCase(c));
    cases = db.getCases();
  }
  res.json({ success: true, count: cases.length, cases });
});

// Seed or reset synthetic cases
casesRouter.post('/seed', (_req: Request, res: Response) => {
  syntheticCases.forEach(c => db.saveCase(c));
  const cases = db.getCases();
  res.json({ success: true, message: 'Seeded synthetic industrial electrical cases', cases });
});

// Get case by ID
casesRouter.get('/:id', (req: Request, res: Response) => {
  const caseId = req.params.id as string;
  const found = db.getCaseById(caseId);
  if (!found) {
    res.status(404).json({ success: false, message: `Case ${caseId} not found` });
    return;
  }
  res.json({ success: true, case: found });
});

// Create new case and run investigation
casesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      equipment_tag,
      equipment_class,
      plant,
      event_timestamp,
      failure_symptoms,
      operational_impact,
      raw_evidence
    } = req.body;

    if (!equipment_tag || !failure_symptoms) {
      res.status(400).json({ success: false, message: 'equipment_tag and failure_symptoms are required' });
      return;
    }

    const newCase = await rcaEngine.runFullInvestigation({
      title: title || `Failure Investigation: ${equipment_tag}`,
      equipment_tag,
      equipment_class: equipment_class || 'Industrial Electrical Apparatus',
      plant: plant || 'Industrial Facility',
      event_timestamp: event_timestamp || new Date().toISOString(),
      failure_symptoms,
      operational_impact: operational_impact || 'Operational curtailment and inspection hold.',
      raw_evidence: raw_evidence || []
    });

    res.status(201).json({ success: true, case: newCase });
  } catch (err: any) {
    console.error('Case intake error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error during RCA' });
  }
});

// Delete case
casesRouter.delete('/:id', (req: Request, res: Response) => {
  const caseId = req.params.id as string;
  const deleted = db.deleteCase(caseId);
  if (!deleted) {
    res.status(404).json({ success: false, message: `Case ${caseId} not found` });
    return;
  }
  res.json({ success: true, message: `Case ${caseId} deleted` });
});
