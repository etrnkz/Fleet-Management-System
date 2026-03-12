import { 
  Body, 
  Controller, 
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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor) 
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'User login', description: 'Authenticate user and return JWT token' })
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
          role: 'driver'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string
  ) {
    this.logger.log(`Login attempt from IP: ${ip}, Email: ${loginDto.email}`);
    
    try {
      const result = await this.authService.login(loginDto);
      
      this.logger.log(`Successful login for user: ${loginDto.email}`);
      
      return result;
    } catch (error) {
      this.logger.warn(`Failed login attempt for ${loginDto.email} from ${ip}: ${error.message}`);
      
      throw error; // Re-throw for global exception filter
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true 
  }))
  @ApiOperation({ 
    summary: 'Register new user', 
    description: 'Create a new user account (may require admin privileges)' 
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
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate email' })
  @ApiResponse({ status: 403, description: 'Registration not allowed' })
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
    @Headers('referer') referer?: string
  ) {
    this.logger.log(`Registration attempt from IP: ${ip}, Email: ${registerDto.email}`);
    
    try {
      
      const result = await this.authService.register(registerDto);
      this.logger.log(`User registered: ${registerDto.email} with role ${registerDto.role}`);
      
      return {
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Registration failed for ${registerDto.email}: ${error.message}`);
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token', description: 'Get new access token using refresh token' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer refresh_token' })
  async refreshToken(@Headers('authorization') authHeader: string) {
    const refreshToken = authHeader?.replace('Bearer ', '');
    
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      await this.authService.logout(token);
    }
    
    return { message: 'Logged out successfully' };
  }
}