// login.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@school.edu',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'SecurePass@123',
    description: 'User password (minimum 8 characters)',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiPropertyOptional({
    example: 'employee',
    description: 'App type for role enforcement: employee | department | college-dean | president | transport-admin | deployment-office | driver | system-admin',
  })
  @IsOptional()
  @IsString()
  appType?: string;

  @ApiPropertyOptional({ example: false, description: 'Keep session alive for 45 days instead of 7 hours' })
  @IsOptional()
  keepMeSignedIn?: boolean;
}
