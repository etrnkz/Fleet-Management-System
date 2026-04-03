import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { GateScanStartDto } from './dto/gate-scan-start.dto';
import { TripsService } from './trips.service';

@ApiTags('Trips')
@ApiBearerAuth('JWT-auth')
@Controller('trips/gate')
export class GateScanController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('start-from-scan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Gate, UserRole.TransportOffice, UserRole.Developer)
  @ApiOperation({
    summary: 'Start trip from gate QR scan',
    description:
      'Same JSON as the driver app QR (or bare trip UUID). Trip must be READY. Requires Gate, TransportOffice, or Developer.',
  })
  @ApiResponse({ status: 200, description: 'Trip started; state is IN_PROGRESS' })
  @ApiResponse({ status: 400, description: 'Invalid QR or trip not READY' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Wrong role' })
  startTripFromGateScan(@Body() dto: GateScanStartDto) {
    return this.tripsService.startTripFromGateScan(dto.qrPayload);
  }
}
