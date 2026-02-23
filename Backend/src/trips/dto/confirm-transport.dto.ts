import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmTransportDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  fuelApproved: boolean;

  @ApiProperty({ example: 'Fuel allocated, ready for dispatch', required: false })
  @IsString()
  @IsOptional()
  comments?: string;
}
