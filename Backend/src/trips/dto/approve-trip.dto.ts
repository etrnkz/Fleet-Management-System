import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveTripDto {
  @ApiProperty({ example: 'Approved for academic purposes', required: false })
  @IsString()
  @IsOptional()
  comments?: string;
}
