import { UserRole } from 'database';

export interface JwtAccessPayload {
  sub: string;
  role: UserRole;
  sessionId: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenHash: string;
}
