import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../token-blacklist.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    const secret = configService.get<string>('jwt.secret') || 'SECRET_KEY';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');

    if (token && this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
