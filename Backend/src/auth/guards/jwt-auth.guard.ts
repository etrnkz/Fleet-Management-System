import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    const request = context.switchToHttp().getRequest();
    this.logger.log(
      `Authentication attempt from IP: ${request.ip}, Path: ${request.path}`,
    );

    if (err || !user) {
      this.logger.warn(
        `Authentication failed: ${err?.message || 'No user found'}`,
      );

      if (info instanceof Error) {
        switch (info.name) {
          case 'TokenExpiredError':
            throw new UnauthorizedException('Token has expired');
          case 'JsonWebTokenError':
            throw new UnauthorizedException('Invalid token');
          case 'NotBeforeError':
            throw new UnauthorizedException('Token not yet valid');
          default:
            throw new UnauthorizedException('Authentication failed');
        }
      }

      throw new UnauthorizedException(
        'Invalid or missing authentication token',
      );
    }

    // Attach user to request for logging/monitoring
    request.user = user;

    // Optional: Add session timeout check
    // const tokenIssuedAt = user.iat * 1000; // Convert to milliseconds
    // const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    // if (Date.now() - tokenIssuedAt > sessionTimeout) {
    //   throw new UnauthorizedException('Session expired');
    // }

    return user;
  }

  // Optional: Add method to extract token for logging/auditing
  private extractTokenFromHeader(request: any): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
