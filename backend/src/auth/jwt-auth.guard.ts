import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Override to provide clearer error messages when no token or invalid token is provided
  handleRequest(
    err: unknown,
    user: any,
    info: unknown,
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Authentication token missing');
    }

    if (err || !user) {
      throw new ForbiddenException('Invalid or expired authentication token');
    }

    return user;
  }
}
