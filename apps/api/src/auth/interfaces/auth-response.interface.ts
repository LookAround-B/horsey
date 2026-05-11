import { UserRole } from 'database';

export interface SafeUser {
  id: string;
  email: string | null;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  avatarUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: SafeUser;
}

export interface MfaRequiredResponse {
  mfaRequired: true;
  mfaSessionToken: string;
}

export interface MessageResponse {
  message: string;
}
