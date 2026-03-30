import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'Computer Science',
    description: 'Department name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'CS',
    description: 'Unique department code',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(10)
  code: string;

  @ApiPropertyOptional({
    example: 'Computer science and software engineering programs',
    description: 'Department description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'uuid-of-college',
    description: 'College ID this department belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  collegeId: string;

  @ApiPropertyOptional({
    example: 'uuid-of-department-head',
    description: 'User ID of department head',
  })
  @IsUUID()
  @IsOptional()
  headId?: string;
}
