import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

export function validateAuthSecretConfig(secret?: string, nodeEnv?: string): string {
  const env = nodeEnv || process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';
  const predictableFallback = 'ifia-secure-industrial-airgap-auth-secret-key-2026';

  if (secret) {
    if (secret === predictableFallback) {
      if (isProduction) {
        throw new Error(
          'CRITICAL SECURITY CONFIGURATION ERROR: Predictable default AUTH_SECRET cannot be used in production environment.'
        );
      }
      console.warn(
        '[SECURITY WARNING] Predictable default AUTH_SECRET detected. In production, this configuration will halt startup.'
      );
    }
    // Note on Entropy: A 32-character minimum length does not by itself guarantee 256 bits
    // of entropy unless generated via CSPRNG (e.g. 64 hex characters from crypto.randomBytes(32))
    // and injected via external deployment secrets managers.
    if (secret.length < 32) {
      if (isProduction) {
        throw new Error(
          'CRITICAL SECURITY CONFIGURATION ERROR: AUTH_SECRET must be at least 32 characters long in production.'
        );
      }
      console.warn(
        '[SECURITY WARNING] AUTH_SECRET is shorter than 32 characters. Use a 256-bit secret for industrial deployments.'
      );
    }
    return secret;
  }

  if (isProduction) {
    throw new Error(
      'CRITICAL SECURITY CONFIGURATION ERROR: AUTH_SECRET environment variable is mandatory in production mode.'
    );
  }

  // Non-production fallback: Generate an ephemeral cryptographically strong secret per process
  const ephemeral = crypto.randomBytes(32).toString('hex');
  console.warn(
    '[SECURITY NOTICE] AUTH_SECRET not configured. Generated ephemeral 256-bit HMAC secret for development session.'
  );
  return ephemeral;
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  claudeModel: process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219',
  cmmsMode: (process.env.CMMS_MODE || 'SANDBOX') as 'SANDBOX' | 'MAXIMO_REST' | 'SAP_PM_REST',
  cmmsLatencyMs: parseInt(process.env.CMMS_SANDBOX_LATENCY_MS || '150', 10),
  storageDir: path.resolve(process.cwd(), process.env.STORAGE_DIR || './data_store'),
  requireHumanApprovalForCmms: process.env.REQUIRE_HUMAN_APPROVAL_FOR_CMMS !== 'false',
  enablePromptInjectionShield: process.env.ENABLE_PROMPT_INJECTION_SHIELD !== 'false',
  authSecret: validateAuthSecretConfig(process.env.AUTH_SECRET, process.env.NODE_ENV),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3001,http://127.0.0.1:5173,http://127.0.0.1:3001').split(','),
  maximoEndpoint: process.env.MAXIMO_REST_ENDPOINT || '',
  sapPmEndpoint: process.env.SAP_PM_REST_ENDPOINT || ''
};

