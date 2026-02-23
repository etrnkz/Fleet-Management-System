import { IsUUID, IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenancePriority } from '../entities/maintenance-request.entity';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ example: 'Engine making unusual noise' })
  @IsString()
  @IsNotEmpty()
  issueDescription: string;

  @ApiProperty({ enum: MaintenancePriority, example: MaintenancePriority.High })
  @IsEnum(MaintenancePriority)
  priority: MaintenancePriority;
}
