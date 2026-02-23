import { IsString, IsNotEmpty, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollegeDto {
  @ApiProperty({ 
    example: 'College of Engineering',
    description: 'College name'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    example: 'COE',
    description: 'Unique college code'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(10)
  code: string;

  @ApiPropertyOptional({ 
    example: 'Engineering and technology programs',
    description: 'College description'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    example: 'uuid-of-college-head',
    description: 'User ID of college head'
  })
  @IsUUID()
  @IsOptional()
  headId?: string;
}
