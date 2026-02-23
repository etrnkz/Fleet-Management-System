import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../dto/register.dto'; 

// Constants for metadata key
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn(`Role check failed: No user found in request`);
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.role) {
      this.logger.warn(`User ${user.email || user.id} has no role assigned`);
      throw new ForbiddenException('User role not defined');
    }

    const hasRole = requiredRoles.some((role) => this.matchRole(user.role, role));
    
    if (!hasRole) {
      this.logger.warn(
        `Access denied for user ${user.email} (role: ${user.role}). ` +
        `Required roles: ${requiredRoles.join(', ')}. ` +
        `Path: ${request.path}`
      );
      
      throw new ForbiddenException(
        `Insufficient permissions. Required role(s): ${requiredRoles.join(', ')}`
      );
    }

    this.logger.debug(
      `Access granted for user ${user.email} with role ${user.role} to ${request.path}`
    );
    
    return true;
  }

  private matchRole(userRole: UserRole, requiredRole: UserRole): boolean {
    if (userRole === requiredRole) {
      return true;
    }

    const roleHierarchy = {
      [UserRole.SYSTEM_ADMIN]: Object.values(UserRole),
      [UserRole.PRESIDENT]: [UserRole.PRESIDENT, UserRole.COLLEGE_DEAN, UserRole.EMPLOYEE],
      [UserRole.COLLEGE_DEAN]: [UserRole.COLLEGE_DEAN, UserRole.EMPLOYEE],
      [UserRole.TRANSPORT_ADMIN]: [UserRole.TRANSPORT_ADMIN, UserRole.DRIVER],
    };

    const allowedRoles = roleHierarchy[userRole] || [userRole];
    return allowedRoles.includes(requiredRole);
  }
}