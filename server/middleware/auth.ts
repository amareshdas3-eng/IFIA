import { Request, Response, NextFunction } from 'express';
import { authService, AuthenticatedUser, UserRole } from '../services/authService.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts and verifies bearer token from Authorization header or x-api-key header
 */
export function authenticateUser(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    token = apiKeyHeader.trim();
  }

  if (!token) {
    res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED_ANONYMOUS',
      message: 'Authentication failed: missing Bearer token in Authorization header or x-api-key'
    });
    return;
  }

  const user = authService.verifyAuthToken(token);
  if (!user) {
    res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED_INVALID_CREDENTIALS',
      message: 'Authentication failed: invalid or expired engineering credentials'
    });
    return;
  }

  req.user = user;
  next();
}

/**
 * Optional authentication: populates req.user if a valid token is provided, does not reject anonymous
 */
export function optionalAuthenticateUser(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    token = apiKeyHeader.trim();
  }

  if (token) {
    const user = authService.verifyAuthToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
}

/**
 * Authorization guard: verifies that the authenticated user possesses one of the allowed roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required before role authorization check'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: `Engineering Authorization Policy Violation: Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`,
        required_roles: allowedRoles,
        user_role: req.user.role
      });
      return;
    }

    next();
  };
}
