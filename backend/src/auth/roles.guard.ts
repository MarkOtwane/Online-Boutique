/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Authentication token missing');
    }

    const user = request.user; // Set by JwtStrategy

    if (!user) {
      throw new ForbiddenException('Invalid or expired authentication token');
    }

    // Compare roles case-insensitively to avoid mismatch due to casing
    const normalizedRequired = requiredRoles.map((r) => r.toLowerCase());
    const userRole = (user.role || '').toString().toLowerCase();

    // Add lightweight logging in non-production to help debug role mismatches
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('RolesGuard:', { requiredRoles, userRole });
    }

    if (!normalizedRequired.includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }
}
