import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  ValidationPipe,
  UsePipes,
  Headers,
  Ip,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { CollegesService } from '../colleges/colleges.service';
import { DepartmentsService } from '../departments/departments.service';

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly collegesService: CollegesService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Get('signup-metadata')
  @ApiOperation({
    summary: 'Public signup metadata',
    description:
      'Returns colleges and departments for signup forms without authentication.',
  })
  @ApiResponse({ status: 200, description: 'Colleges and departments list' })
  async getSignupMetadata() {
    const [colleges, departments] = await Promise.all([
      this.collegesService.findAll(),
      this.departmentsService.findAll(),
    ]);

    return {
      colleges: colleges.map((college) => ({
        id: college.id,
        name: college.name,
        code: college.code,
      })),
      departments: departments.map((department) => ({
        id: department.id,
        name: department.name,
        code: department.code,
        collegeId: department.college?.id || null,
        collegeName: department.college?.name || null,
      })),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }))
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return JWT token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'driver',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Ip() ip: string) {
    this.logger.log(`Login attempt from IP: ${ip}, Email: ${loginDto.email}`);

    try {
      const result = await this.authService.login(loginDto);

      this.logger.log(`Successful login for user: ${loginDto.email}`);

      return result;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed login attempt for ${loginDto.email} from ${ip}: ${msg}`,
      );

      throw error; // Re-throw for global exception filter
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account (may require admin privileges)',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        message: 'User registered successfully',
        data: {
          id: 'uuid',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'driver',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or duplicate email',
  })
  @ApiResponse({ status: 403, description: 'Registration not allowed' })
  async register(@Body() registerDto: RegisterDto, @Ip() ip: string) {
    this.logger.log(
      `Registration attempt from IP: ${ip}, Email: ${registerDto.email}`,
    );

    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(
        `User registered: ${registerDto.email} with role ${registerDto.role}`,
      );

      return {
        message: 'User registered successfully',
        data: result,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Registration failed for ${registerDto.email}: ${msg}`);
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token. Accepts token in Authorization header (Bearer) or request body.',
  })
  @ApiHeader({ name: 'Authorization', description: 'Bearer refresh_token (optional if body provided)' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(
    @Headers('authorization') authHeader: string,
    @Body() body: { refresh_token?: string },
  ) {
    // Accept token from body or Authorization header
    const refreshToken = body?.refresh_token || authHeader?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user', description: 'Invalidate the current JWT token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      await this.authService.logout(token);
    }

    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
