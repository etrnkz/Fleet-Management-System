import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class CreateSystemUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.User })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'uuid-of-department', required: false })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ example: 'uuid-of-college', required: false })
  @IsOptional()
  @IsUUID()
  collegeId?: string;
}
