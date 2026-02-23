import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InspectMaintenanceDto {
  @ApiProperty({ example: 'Requires timing belt replacement' })
  @IsString()
  @IsNotEmpty()
  inspectionNotes: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0)
  estimatedCost: number;
}
