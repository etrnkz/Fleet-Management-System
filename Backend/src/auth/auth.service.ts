import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { TokenBlacklistService } from './token-blacklist.service';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly emailService: EmailService,
  ) {
    this.refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('jwt.secret') ||
      'REFRESH_SECRET_KEY';
  }

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registering new user: ${registerDto.email}`);

    // Self-registration is only allowed for the User role.
    // Privileged roles must be assigned by an admin via /system-admin/users or /users (admin endpoints).
    const selfRegistrableRoles: UserRole[] = [UserRole.User];
    const requestedRole = registerDto.role || UserRole.User;
    if (!selfRegistrableRoles.includes(requestedRole)) {
      this.logger.warn(
        `Registration blocked: attempted self-registration with role ${requestedRole} for ${registerDto.email}`,
      );
      throw new UnauthorizedException(
        'Self-registration is only allowed for the User role. Contact an administrator to be assigned other roles.',
      );
    }

    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
      role: UserRole.User,
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

    const user = await this.usersService.findByEmail(loginDto.email.toLowerCase().trim());

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

    // Enforce app-type role restrictions
    if (loginDto.appType) {
      const allowedRoles: Record<string, string[]> = {
        'employee':          ['User'],
        'department':        ['DepartmentHead'],
        'college-dean':      ['Dean', 'CollegeHead'],
        'president':         ['President'],
        'transport-admin':   ['TransportOffice'],
        'deployment-office': ['DeploymentTeam'],
        'driver':            ['Driver'],
        'system-admin':      ['SystemAdmin', 'Developer'],
      };
      const allowed = allowedRoles[loginDto.appType];
      if (allowed && !allowed.includes(user.role)) {
        this.logger.warn(`Login denied: role ${user.role} not allowed for app ${loginDto.appType} - ${loginDto.email}`);
        throw new UnauthorizedException(`Access denied. This portal is for ${loginDto.appType} users only.`);
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiry = loginDto.keepMeSignedIn ? '45d' : '7h';
    const refreshTokenExpiry = loginDto.keepMeSignedIn ? '45d' : '7h';

    const accessToken = this.jwtService.sign(payload, { expiresIn: accessTokenExpiry as any });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: refreshTokenExpiry as any,
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
    this.tokenBlacklistService.add(token);
    this.logger.log('User logged out, token blacklisted');
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Return generic message to avoid user enumeration
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const token = randomUUID();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.update(user.id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    } as any);

    const resetLink = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;

    await this.emailService.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>If you did not request this, please ignore this email.</p>`,
    });

    this.logger.log(`Password reset email sent to ${email}`);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(token);

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    } as any);

    return { message: 'Password reset successfully' };
  }

  async validateUser(payload: any): Promise<User> {
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
