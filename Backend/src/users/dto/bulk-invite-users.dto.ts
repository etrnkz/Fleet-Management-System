import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkInviteUsersDto {
  @ApiProperty({
    description: 'Array of email addresses to invite',
    example: ['john.doe@university.edu', 'jane.smith@university.edu'],
    type: [String],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  @ApiProperty({
    description: 'Optional department ID to assign users to',
    example: 'uuid-department-id',
    required: false,
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({
    description: 'Optional college ID to assign users to',
    example: 'uuid-college-id',
    required: false,
  })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiProperty({
    description: 'Optional welcome message to include in invitation email',
    example: 'Welcome to the University Fleet Management System!',
    required: false,
  })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;
}