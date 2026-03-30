import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  Matches,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Matches(/^[a-zA-Z\s]{2,50}$/, {
    message: 'Name must be 2-50 characters, letters and spaces only',
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@school.edu',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'SecurePass@123',
    description: 'Password (min 6 chars)',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.User,
    description: 'User role in the system (defaults to User if not provided)',
  })
  @IsOptional()
  @IsEnum(UserRole, {
    message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  role?: UserRole;

  @ApiPropertyOptional({
    example: '+251912345678',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'EMP-12345',
    description: 'Employee ID',
  })
  @IsOptional()
  @IsString({ message: 'Employee ID must be a string' })
  employeeId?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Department ID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Department ID must be a valid UUID' })
  departmentId?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'College ID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'College ID must be a valid UUID' })
  collegeId?: string;
}
