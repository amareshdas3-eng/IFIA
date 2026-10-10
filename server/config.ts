import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  claudeModel: process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219',
  cmmsMode: (process.env.CMMS_MODE || 'SANDBOX') as 'SANDBOX' | 'MAXIMO_REST' | 'SAP_PM_REST',
  cmmsLatencyMs: parseInt(process.env.CMMS_SANDBOX_LATENCY_MS || '150', 10),
  storageDir: path.resolve(process.cwd(), process.env.STORAGE_DIR || './data_store'),
  requireHumanApprovalForCmms: process.env.REQUIRE_HUMAN_APPROVAL_FOR_CMMS !== 'false',
  enablePromptInjectionShield: process.env.ENABLE_PROMPT_INJECTION_SHIELD !== 'false'
};
