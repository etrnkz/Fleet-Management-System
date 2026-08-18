import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from './token-blacklist.service';
import { EmailService } from '../email/email.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;
  let configService: any;
  let tokenBlacklistService: any;
  let emailService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    role: UserRole.User,
    isActive: true,
    validatePassword: jest.fn(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByResetToken: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    };
    configService = {
      get: jest.fn(),
    };
    tokenBlacklistService = {
      add: jest.fn(),
    };
    emailService = {
      sendEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: TokenBlacklistService, useValue: tokenBlacklistService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'no@one.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if user is inactive', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });
      await expect(
        service.login({ email: 'test@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is invalid', async () => {
      const user = { ...mockUser, validatePassword: jest.fn().mockResolvedValue(false) };
      usersService.findByEmail.mockResolvedValue(user);
      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on successful login', async () => {
      const user = { ...mockUser, validatePassword: jest.fn().mockResolvedValue(true) };
      usersService.findByEmail.mockResolvedValue(user);
      configService.get.mockReturnValue('7h');

      const result = await service.login({ email: 'test@example.com', password: 'correct' });

      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result).toHaveProperty('refresh_token', 'mock-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should block driver role on employee app', async () => {
      const user = { ...mockUser, role: UserRole.Driver, validatePassword: jest.fn().mockResolvedValue(true) };
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({ email: 'test@example.com', password: 'correct', appType: 'employee' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should throw for non-User role self-registration', async () => {
      await expect(
        service.register({
          email: 'x@x.com',
          password: 'pass',
          name: 'X',
          role: UserRole.Driver as any,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should create user and strip password', async () => {
      usersService.create.mockResolvedValue({ ...mockUser, password: 'hashed' });

      const result = await service.register({
        email: 'test@example.com',
        password: 'pass',
        name: 'Test',
      });

      expect(usersService.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('refreshToken', () => {
    it('should throw for invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error('bad token'); });
      await expect(service.refreshToken('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens when valid', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      usersService.findById.mockResolvedValue({ ...mockUser });
      configService.get.mockReturnValue('7d');

      const result = await service.refreshToken('valid-token');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
  });

  describe('forgotPassword', () => {
    it('should always return generic message', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const result = await service.forgotPassword('no@one.com');
      expect(result.message).toContain('reset link');
    });

    it('should send email and save token when user exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue({});
      emailService.sendEmail.mockResolvedValue({});

      const result = await service.forgotPassword('test@example.com');
      expect(result.message).toContain('reset link');
      expect(usersService.update).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should throw for invalid token', async () => {
      usersService.findByResetToken.mockResolvedValue(null);
      await expect(service.resetPassword('bad', 'newpass')).rejects.toThrow(BadRequestException);
    });

    it('should throw for expired token', async () => {
      const expired = { ...mockUser, resetTokenExpiry: new Date('2020-01-01') };
      usersService.findByResetToken.mockResolvedValue(expired);
      await expect(service.resetPassword('tok', 'newpass')).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should blacklist the token', async () => {
      const result = await service.logout('my-token');
      expect(tokenBlacklistService.add).toHaveBeenCalledWith('my-token');
      expect(result.message).toContain('Logged out');
    });
  });
});
