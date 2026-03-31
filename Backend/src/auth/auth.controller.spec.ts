import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CollegesService } from '../colleges/colleges.service';
import { DepartmentsService } from '../departments/departments.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserRole } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  const mockCollegesService = {
    findAll: jest.fn().mockResolvedValue([]),
  };

  const mockDepartmentsService = {
    findAll: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 60000, limit: 100 }],
        }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CollegesService, useValue: mockCollegesService },
        { provide: DepartmentsService, useValue: mockDepartmentsService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('returns tokens from AuthService', async () => {
      const res = {
        access_token: 'at',
        refresh_token: 'rt',
        user: {
          id: '1',
          email: loginDto.email,
          name: 'T',
          role: UserRole.Driver,
        },
      };
      mockAuthService.login.mockResolvedValue(res);

      const result = await controller.login(loginDto, '127.0.0.1');

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(res);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: UserRole.Driver,
      phoneNumber: '+251911000000',
    };

    it('wraps register result', async () => {
      const userData = {
        id: 'u1',
        name: registerDto.name,
        email: registerDto.email,
        role: UserRole.Driver,
      };
      mockAuthService.register.mockResolvedValue(userData);

      const result = await controller.register(registerDto, '127.0.0.1');

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        message: 'User registered successfully',
        data: userData,
      });
    });
  });

  describe('refreshToken', () => {
    it('passes token to service', async () => {
      mockAuthService.refreshToken.mockResolvedValue({ access_token: 'new' });

      const result = await controller.refreshToken('Bearer refresh-xyz');

      expect(authService.refreshToken).toHaveBeenCalledWith('refresh-xyz');
      expect(result).toEqual({ access_token: 'new' });
    });

    it('throws when header missing', async () => {
      await expect(controller.refreshToken('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('logout', () => {
    it('calls logout when bearer present', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout('Bearer abc');

      expect(authService.logout).toHaveBeenCalledWith('abc');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
