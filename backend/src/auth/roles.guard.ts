import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../common/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // No @Roles() decorator, allow access
    }
    const { user } = context.switchToHttp().getRequest();

    // Ensure the user object exists and has a role property
    if (!user || !user.role) {
        return false; // User not authenticated or role not available
    }

    // Check if the user's role is included in the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
