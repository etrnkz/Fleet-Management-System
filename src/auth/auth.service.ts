import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, UserRole } from './dto/register.dto';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly users: Map<string, User> = new Map();
  private readonly emailIndex: Map<string, string> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    if (this.emailIndex.has(email)) {
      throw new ConflictException('User with this email already exists');
    }

    const userId = uuidv4();
    const hashedPassword = await this.hashPassword(password);
    const now = new Date();

    const user: User = {
      id: userId,
      ...registerDto,
      password: hashedPassword,
      isActive: true,
      createdAt: now,
    };

    this.users.set(userId, user);
    this.emailIndex.set(email, userId);

    this.logger.log(`User registered: ${email} (${registerDto.role})`);

    return this.sanitizeUser(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateCredentials(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    user.lastLoginAt = new Date();

    const tokens = await this.generateTokens(user);
    
    this.logger.log(`User logged in: ${user.email}`);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const user = this.users.get(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException();
      }

      return this.generateAccessToken(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(token: string) {
    // Implement token blacklisting or Redis invalidation in production
    this.logger.debug(`Logout requested for token: ${token.substring(0, 20)}...`);
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async validateUserByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email);
    return userId ? this.users.get(userId) || null : null;
  }

  private async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.validateUserByEmail(email);
    
    if (!user) {
      await this.simulatePasswordCheck(); // Prevent timing attacks
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { 
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: '7d',
      }
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private generateAccessToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return { access_token: this.jwtService.sign(payload, { expiresIn: '15m' }) };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  private async simulatePasswordCheck(): Promise<void> {
    // Simulate bcrypt comparison timing to prevent timing attacks
    await bcrypt.compare('dummy', '$2b$10$dummyhashdummyhashdummyhashdu');
  }
}