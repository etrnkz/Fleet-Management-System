import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('jwt.secret') ||
      'REFRESH_SECRET_KEY';
  }

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registering new user: ${registerDto.email}`);

    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
      role: registerDto.role || UserRole.User, // Default to User role if not provided
      phoneNumber: registerDto.phoneNumber,
      departmentId: registerDto.departmentId,
      collegeId: registerDto.collegeId,
    });

    // Remove password from response
    const { password, ...result } = user;

    return result;
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for: ${loginDto.email}`);

    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      this.logger.warn(`Login failed: User not found - ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.warn(`Login failed: User inactive - ${loginDto.email}`);
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await user.validatePassword(loginDto.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password - ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    });

    this.logger.log(`Login successful for: ${loginDto.email}`);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userWithoutPassword,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      // Rotate refresh token on each use
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.refreshSecret,
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      this.logger.error(`Refresh token failed: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(token: string) {
    // In a production app, you would add the token to a blacklist
    // For now, we'll just log the logout
    this.logger.log('User logged out');
    return { message: 'Logged out successfully' };
  }

  async validateUser(payload: any): Promise<User> {
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
