import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import { db } from './db/database.js';
import { syntheticCases } from './data/syntheticCases.js';
import { casesRouter } from './routes/cases.js';
import { approvalsRouter } from './routes/approvals.js';
import { cmmsRouter } from './routes/cmms.js';
import { benchmarkRouter } from './routes/benchmark.js';
import { auditRouter } from './routes/audit.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize DB and ensure seed cases exist
db.init();
if (db.getCases().length === 0) {
  syntheticCases.forEach(c => db.saveCase(c));
  console.log('Seeded initial synthetic industrial electrical cases.');
}

// API Routes
app.use('/api/cases', casesRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/cmms', cmmsRouter);
app.use('/api/benchmark', benchmarkRouter);
app.use('/api/audit', auditRouter);

// Health & System Info
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Industrial Failure Intelligence Agent (IFIA)',
    version: '1.0.0',
    mode: config.nodeEnv,
    cmms_mode: config.cmmsMode,
    claude_live_api: Boolean(config.anthropicApiKey),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if present
const clientDist = path.resolve(process.cwd(), 'client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`================================================================`);
  console.log(`  IFIA - Industrial Failure Intelligence Agent Server Running   `);
  console.log(`  Port: http://localhost:${config.port}                         `);
  console.log(`  CMMS Mode: ${config.cmmsMode}                                 `);
  console.log(`  Live Claude API: ${config.anthropicApiKey ? 'ACTIVE' : 'FALLBACK_ENGINE (OFFLINE SAFE)'}`);
  console.log(`================================================================`);
});
