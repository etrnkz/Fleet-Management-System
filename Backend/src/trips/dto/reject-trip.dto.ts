import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectTripDto {
  @ApiProperty({ example: 'Insufficient justification for trip' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
