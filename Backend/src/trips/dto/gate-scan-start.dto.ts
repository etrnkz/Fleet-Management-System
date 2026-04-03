import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GateScanStartDto {
  @ApiProperty({
    description:
      'Raw QR text: JSON from driver app (tripId, requestNumber, vehicle, action) or a trip UUID',
    example:
      '{"tripId":"550e8400-e29b-41d4-a716-446655440000","requestNumber":"TR-2026-0001","vehicle":"ABC-1234","action":"START_TRIP"}',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  qrPayload: string;
}
