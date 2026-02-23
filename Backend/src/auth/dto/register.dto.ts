import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ 
    example: 'John Doe',
    description: 'Full name of the user'
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Matches(/^[a-zA-Z\s]{2,50}$/, {
    message: 'Name must be 2-50 characters, letters and spaces only'
  })
  name: string;

  @ApiProperty({ 
    example: 'john.doe@school.edu',
    description: 'User email address'
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ 
    example: 'SecurePass@123',
    description: 'Password (min 8 chars, must include uppercase, lowercase, number, and special character)'
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character'
  })
  password: string;

  @ApiProperty({ 
    enum: UserRole,
    example: UserRole.Driver,
    description: 'User role in the system'
  })
  @IsEnum(UserRole, { 
    message: `Role must be one of: ${Object.values(UserRole).join(', ')}` 
  })
  role: UserRole;

  @ApiPropertyOptional({ 
    example: '+251912345678',
    description: 'Phone number (10-15 digits)'
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[0-9+\-\s]{10,15}$/, {
    message: 'Phone number must be 10-15 digits and can include +, -, or spaces'
  })
  phoneNumber?: string;
}
