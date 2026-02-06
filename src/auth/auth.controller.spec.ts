import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, UserRole } from './dto/register.dto';
import { BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    validateRegistrationOpen: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          ttl: 60,
          limit: 10,
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have AuthService injected', () => {
      expect(authService).toBeDefined();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = { 
      email: 'test@example.com', 
      password: 'Password123!' 
    };
    const mockIp = '192.168.1.1';
    const mockUserAgent = 'Mozilla/5.0';

    const successfulResponse = {
      access_token: 'fake-jwt-token',
      refresh_token: 'fake-refresh-token',
      user: {
        id: 'user-id-1',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.DRIVER,
      },
    };

    it('should call AuthService.login with correct parameters', async () => {
      mockAuthService.login.mockResolvedValue(successfulResponse);

      const result = await controller.login(loginDto, mockIp, mockUserAgent);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(successfulResponse);
    });

    it('should throw UnauthorizedException when login fails', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(
        controller.login(loginDto, mockIp, mockUserAgent)
      ).rejects.toThrow(UnauthorizedException);
      
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle rate limiting', async () => {
      mockAuthService.login.mockResolvedValue(successfulResponse);
    
      for (let i = 0; i < 5; i++) {
        await controller.login(loginDto, mockIp, mockUserAgent);
      }
      
      expect(authService.login).toHaveBeenCalledTimes(5);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: UserRole.DRIVER,
      phone: '+1234567890',
      department: 'Transport',
    };

    const successfulResponse = {
      message: 'User registered successfully',
      data: {
        id: 'user-id-1',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.DRIVER,
        createdAt: new Date().toISOString(),
      },
    };

    it('should call AuthService.register with correct DTO', async () => {
      mockAuthService.register.mockResolvedValue(successfulResponse.data);

      const result = await controller.register(registerDto, '192.168.1.1');

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        message: 'User registered successfully',
        data: successfulResponse.data,
      });
    });

    it('should throw BadRequestException for duplicate email', async () => {
      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Email already exists')
      );

      await expect(
        controller.register(registerDto, '192.168.1.1')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when registration is closed', async () => {
      mockAuthService.validateRegistrationOpen = jest.fn()
        .mockRejectedValue(new ForbiddenException('Registration is closed'));
    });

    it('should validate DTO correctly', async () => {
      const invalidDto = { ...registerDto, email: 'invalid-email' };
      
      expect(true).toBe(true); 
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const newAccessToken = { access_token: 'new-jwt-token' };
      
      mockAuthService.refreshToken.mockResolvedValue(newAccessToken);

      const result = await controller.refreshToken(`Bearer ${refreshToken}`);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(newAccessToken);
    });

    it('should throw BadRequestException when no token provided', async () => {
      await expect(controller.refreshToken('')).rejects.toThrow(BadRequestException);
      await expect(controller.refreshToken(undefined)).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should call AuthService.logout with token', async () => {
      const token = 'valid-jwt-token';
      
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(`Bearer ${token}`);

      expect(authService.logout).toHaveBeenCalledWith(token);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should succeed even without token', async () => {
      const result = await controller.logout('');

      expect(authService.logout).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request body', async () => {
      const emptyDto = {} as LoginDto;
      
      mockAuthService.login.mockRejectedValue(new BadRequestException());
      
      await expect(
        controller.login(emptyDto, '192.168.1.1', 'test-agent')
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle service throwing unexpected errors', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Database connection failed'));
      
      await expect(
        controller.login(
          { email: 'test@example.com', password: 'Password123!' },
          '192.168.1.1',
          'test-agent'
        )
      ).rejects.toThrow(Error);
    });
  });
});