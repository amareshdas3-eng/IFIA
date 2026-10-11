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

// Certified Engineering Principals Directory
export const VALID_USER_ROLES: readonly UserRole[] = [
  'LEAD_ELECTRICAL_ENGINEER',
  'RELIABILITY_DIRECTOR',
  'PLANT_OPERATIONS_MANAGER',
  'MAINTENANCE_SUPERVISOR',
  'RELIABILITY_ENGINEER',
  'TECHNICIAN',
  'AUDITOR',
  'VIEWER'
] as const;

export interface TokenClaims extends AuthenticatedUser {
  issuedAt: number;
  expiresAt: number;
}

export class AuthService {
  private secret: string;
  private readonly defaultTtlMs: number = 24 * 60 * 60 * 1000; // 24-hour token validity

  constructor() {
    this.secret = config.authSecret;
  }

  /**
   * Signs a secure tamper-proof bearer token with HMAC-SHA256 and expiration claims
   */
  public generateSignedToken(user: AuthenticatedUser, expiresInMs?: number): string {
    const now = Date.now();
    const expiresAt = typeof expiresInMs === 'number' ? now + expiresInMs : now + this.defaultTtlMs;

    const payloadObj: TokenClaims = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      licenseNumber: user.licenseNumber,
      issuedAt: typeof user.issuedAt === 'number' ? user.issuedAt : now,
      expiresAt
    };

    const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(payloadB64)
      .digest('base64url');

    return `ifia_${payloadB64}.${signature}`;
  }

  /**
   * Issues a cryptographically signed HMAC token for a registered certified principal
   */
  public issueTokenForPrincipal(username: string, expiresInMs?: number): string | null {
    const principal = CERTIFIED_PRINCIPALS[username];
    if (!principal) return null;
    return this.generateSignedToken(principal, expiresInMs);
  }

  /**
   * Verifies and decodes an incoming bearer token strictly against HMAC-SHA256 signature,
   * expiration window, and certified principal claim constraints.
   * All hardcoded/shared tokens are rejected.
   */
  public verifyAuthToken(rawToken: string): AuthenticatedUser | null {
    if (!rawToken || typeof rawToken !== 'string') return null;

    const token = rawToken.trim();

    // Enforce strict signed token scheme prefix
    if (!token.startsWith('ifia_')) {
      return null;
    }

    const parts = token.slice(5).split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    if (!payloadB64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(payloadB64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature, 'utf-8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');

    // Constant-time comparison to prevent timing side-channel attacks
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    try {
      const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as TokenClaims;

      // 1. Validate mandatory fields
      if (!decoded.id || !decoded.username || !decoded.name || !decoded.role || !decoded.department) {
        return null;
      }

      // 2. Validate role is within recognized Engineering User Roles
      if (!VALID_USER_ROLES.includes(decoded.role)) {
        return null;
      }

      const now = Date.now();

      // 3. Reject future tokens (clock-skew tolerance: 60s)
      if (typeof decoded.issuedAt !== 'number' || decoded.issuedAt > now + 60000) {
        return null;
      }

      // 4. Reject expired tokens
      if (typeof decoded.expiresAt !== 'number' || decoded.expiresAt < now) {
        return null;
      }

      // 5. Verify against Certified Principals directory to prevent forged claim payloads.
      // Every valid engineering token MUST correspond to a registered, certified principal.
      const verifiedPrincipal = CERTIFIED_PRINCIPALS[decoded.username];
      if (!verifiedPrincipal) {
        return null; // Unknown principal rejected
      }

      // 6. Cross-check ALL authoritative claims against registered directory
      if (
        verifiedPrincipal.id !== decoded.id ||
        verifiedPrincipal.role !== decoded.role ||
        verifiedPrincipal.name !== decoded.name ||
        verifiedPrincipal.department !== decoded.department ||
        (verifiedPrincipal.licenseNumber || '') !== (decoded.licenseNumber || '')
      ) {
        return null; // Authoritative claim mismatch / tampering detected
      }

      return {
        id: verifiedPrincipal.id,
        username: verifiedPrincipal.username,
        name: verifiedPrincipal.name,
        role: verifiedPrincipal.role,
        licenseNumber: verifiedPrincipal.licenseNumber,
        department: verifiedPrincipal.department,
        issuedAt: decoded.issuedAt
      };
    } catch {
      return null;
    }
  }

  /**
   * Returns certified principals directory without disclosing credentials or tokens
   */
  public getPublicPrincipalsDirectory(): Array<Omit<AuthenticatedUser, 'issuedAt'>> {
    return Object.values(CERTIFIED_PRINCIPALS).map(p => ({
      id: p.id,
      username: p.username,
      name: p.name,
      role: p.role,
      licenseNumber: p.licenseNumber,
      department: p.department
    }));
  }
}

export const authService = new AuthService();

