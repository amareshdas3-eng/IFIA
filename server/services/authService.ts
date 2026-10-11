import crypto from 'crypto';
import { config } from '../config.js';

export type UserRole =
  | 'LEAD_ELECTRICAL_ENGINEER'
  | 'RELIABILITY_DIRECTOR'
  | 'PLANT_OPERATIONS_MANAGER'
  | 'MAINTENANCE_SUPERVISOR'
  | 'RELIABILITY_ENGINEER'
  | 'TECHNICIAN'
  | 'AUDITOR'
  | 'VIEWER';

export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  licenseNumber?: string;
  department: string;
  issuedAt?: number;
}

// Certified Engineering Principals Directory
export const CERTIFIED_PRINCIPALS: Record<string, AuthenticatedUser> = {
  'alex.henderson': {
    id: 'USR-PE-001',
    username: 'alex.henderson',
    name: 'Alex Henderson, PE',
    role: 'LEAD_ELECTRICAL_ENGINEER',
    licenseNumber: 'PE-104928-TX',
    department: 'Electrical Reliability & Asset Management'
  },
  'jane.smith': {
    id: 'USR-PE-002',
    username: 'jane.smith',
    name: 'Dr. Jane Smith, PE',
    role: 'RELIABILITY_DIRECTOR',
    licenseNumber: 'PE-884210-IL',
    department: 'Plant Operations Governance'
  },
  'marcus.vance': {
    id: 'USR-SUP-003',
    username: 'marcus.vance',
    name: 'Marcus Vance, CMRP',
    role: 'MAINTENANCE_SUPERVISOR',
    licenseNumber: 'CMRP-55219',
    department: 'Electrical Maintenance Execution'
  },
  'david.chen': {
    id: 'USR-TECH-004',
    username: 'david.chen',
    name: 'David Chen, NETA-III',
    role: 'TECHNICIAN',
    licenseNumber: 'NETA-3392',
    department: 'Substation Field Testing'
  },
  'sarah.lin': {
    id: 'USR-AUD-005',
    username: 'sarah.lin',
    name: 'Sarah Lin, CQA',
    role: 'AUDITOR',
    department: 'Quality & Process Compliance'
  }
};

// Well-known developer and integration tokens mapped directly to verified principals
const STATIC_TOKEN_MAP: Record<string, string> = {
  'ifia-token-lead-engineer-alex': 'alex.henderson',
  'ifia-token-reliability-director-jane': 'jane.smith',
  'ifia-token-maint-supervisor-marcus': 'marcus.vance',
  'ifia-token-technician-david': 'david.chen',
  'ifia-token-auditor-sarah': 'sarah.lin'
};

export class AuthService {
  private secret: string;

  constructor() {
    this.secret = config.authSecret || 'ifia-secure-industrial-airgap-auth-secret-key-2026';
  }

  /**
   * Signs a secure tamper-proof bearer token with HMAC-SHA256
   */
  public generateSignedToken(user: AuthenticatedUser): string {
    const payload = Buffer.from(
      JSON.stringify({
        ...user,
        issuedAt: Date.now()
      })
    ).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('base64url');

    return `ifia_${payload}.${signature}`;
  }

  /**
   * Verifies and decodes an incoming bearer token or pre-configured principal token
   */
  public verifyAuthToken(rawToken: string): AuthenticatedUser | null {
    if (!rawToken || typeof rawToken !== 'string') return null;

    const token = rawToken.trim();

    // Check pre-configured principal tokens
    if (STATIC_TOKEN_MAP[token]) {
      const username = STATIC_TOKEN_MAP[token];
      return CERTIFIED_PRINCIPALS[username] || null;
    }

    // Check HMAC-signed bearer tokens
    if (token.startsWith('ifia_')) {
      const parts = token.slice(5).split('.');
      if (parts.length !== 2) return null;

      const [payloadB64, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(payloadB64)
        .digest('base64url');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null;
      }

      try {
        const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as AuthenticatedUser;
        return decoded;
      } catch {
        return null;
      }
    }

    return null;
  }

  public getCertifiedPrincipals(): AuthenticatedUser[] {
    return Object.values(CERTIFIED_PRINCIPALS);
  }

  public getDefaultEngineerToken(): string {
    return 'ifia-token-lead-engineer-alex';
  }
}

export const authService = new AuthService();
