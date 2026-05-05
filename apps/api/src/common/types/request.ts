import { UserRole } from 'database';

export interface AuthRequest {
  user: {
    id: string;
    role: UserRole;
    name: string;
    email: string | null;
    phone: string | null;
  };
}
