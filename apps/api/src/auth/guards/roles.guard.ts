import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'database';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Role-based authorization guard.
 * Applied AFTER JwtAuthGuard.
 * Never trusts client-sent role claims — uses the DB-verified role from JWT strategy.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      return false;
    }

    // Role hierarchy: ADMIN > VENDOR > BUYER
    const roleHierarchy: Record<string, number> = {
      ADMIN: 3,
      VENDOR: 2,
      BUYER: 1,
    };

    const userLevel = roleHierarchy[user.role] || 0;

    // User passes if their level is >= any of the required role levels
    return requiredRoles.some(
      (role) => userLevel >= (roleHierarchy[role] || 0),
    );
  }
}
