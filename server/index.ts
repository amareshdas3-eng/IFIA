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
import { authService, CERTIFIED_PRINCIPALS } from './services/authService.js';
import { optionalAuthenticateUser } from './middleware/auth.js';

const app = express();

// Restrictive CORS Allowlist (IFIA-SEC-003)
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser callers (server-to-server, curl, tests) or explicitly configured origins
    if (
      !origin ||
      config.allowedOrigins.includes(origin) ||
      config.allowedOrigins.includes('*') ||
      config.nodeEnv === 'development'
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Security Violation: Origin '${origin}' is not authorized.`));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Defensive Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

// Initialize DB and ensure seed cases exist
db.init();
if (db.getCases().length === 0) {
  syntheticCases.forEach(c => db.saveCase(c));
  console.log('Seeded initial synthetic industrial electrical cases.');
}

// Issue Cryptographically Signed Engineering Bearer Token
app.post('/api/auth/token', (req, res) => {
  const { username } = req.body || {};
  if (!username || typeof username !== 'string') {
    res.status(400).json({
      success: false,
      code: 'AUTH_INVALID_REQUEST',
      message: 'Username is required to issue signed credentials'
    });
    return;
  }

  const token = authService.issueTokenForPrincipal(username.trim());
  if (!token) {
    res.status(404).json({
      success: false,
      code: 'AUTH_USER_NOT_FOUND',
      message: `Unregistered or unauthorized engineering principal: '${username}'`
    });
    return;
  }

  const principal = CERTIFIED_PRINCIPALS[username.trim()];
  res.json({
    success: true,
    token,
    user: principal
  });
});


app.get('/api/auth/me', optionalAuthenticateUser, (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      success: true,
      authenticated: false,
      user: null
    });
  }
});

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
    security_controls: {
      auth_middleware_active: true,
      role_authorization_enforced: true,
      audit_integrity_sha256_chained: true,
      prompt_injection_shield: config.enablePromptInjectionShield,
      human_approval_mandatory_for_cmms: config.requireHumanApprovalForCmms
    },
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
  console.log(`  Auth & Role Gates: ACTIVE (Engineering RBAC)                  `);
  console.log(`  Live Claude API: ${config.anthropicApiKey ? 'ACTIVE' : 'FALLBACK_ENGINE (OFFLINE SAFE)'}`);
  console.log(`================================================================`);
});
