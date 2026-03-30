import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteMaintenanceDto {
  @ApiProperty({ example: 520.0 })
  @IsNumber()
  @Min(0)
  actualCost: number;

  @ApiProperty({ example: 'Timing belt replaced successfully' })
  @IsString()
  @IsNotEmpty()
  completionNotes: string;
}
