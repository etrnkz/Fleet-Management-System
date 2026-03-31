import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed-jwt-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockJwtService.sign.mockReturnValue('signed-jwt-token');
  });

  describe('register', () => {
    it('returns user without password', async () => {
      mockUsersService.create.mockResolvedValue({
        id: 'user-1',
        email: 'a@test.com',
        name: 'Test',
        role: UserRole.Driver,
        password: 'hashed',
      });

      const dto: RegisterDto = {
        name: 'Test',
        email: 'a@test.com',
        password: 'password123',
        role: UserRole.Driver,
      };

      const result = await service.register(dto);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('a@test.com');
      expect(mockUsersService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'a@test.com',
      password: 'password123',
    };

    it('returns tokens when credentials are valid', async () => {
      const fakeUser = {
        id: 'user-1',
        email: 'a@test.com',
        name: 'Test',
        role: UserRole.Driver,
        password: 'hashed',
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      mockUsersService.findByEmail.mockResolvedValue(fakeUser);

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('signed-jwt-token');
      expect(result.refresh_token).toBe('signed-jwt-token');
      expect(result.user).not.toHaveProperty('password');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('throws when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws when password invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'a@test.com',
        validatePassword: jest.fn().mockResolvedValue(false),
        isActive: true,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('returns new access_token when refresh token valid', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      mockUsersService.findById.mockResolvedValue({
        id: 'user-1',
        isActive: true,
        email: 'a@test.com',
        role: UserRole.User,
      });
      mockJwtService.sign.mockReturnValueOnce('new-access');

      const result = await service.refreshToken('refresh-token');

      expect(result.access_token).toBe('new-access');
    });

    it('throws when refresh token invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('bad');
      });

      await expect(service.refreshToken('bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
