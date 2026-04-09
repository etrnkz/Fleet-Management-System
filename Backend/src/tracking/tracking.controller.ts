import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Tracking')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  @Get(':tripId/geofence-config')
  @ApiOperation({
    summary: 'Geofence config for allocated vehicle',
    description:
      'Returns VIP restriction zones for the vehicle assigned to this trip (for GPS clients).',
  })
  @ApiResponse({ status: 200, description: 'Geofence configuration' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  getTripGeofenceConfig(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.trackingService.getTripGeofenceConfig(tripId);
  }

  @Post(':tripId/location')
  @ApiOperation({
    summary: 'Update GPS location (REST fallback)',
    description:
      'Update GPS location via REST API. Prefer WebSocket for real-time updates. Response includes engineSimulatedOff when the allocated vehicle is VIP-restricted and inside a forbidden zone.',
  })
  @ApiResponse({
    status: 201,
    description: 'Location saved successfully',
    schema: {
      example: {
        id: 'uuid',
        tripId: 'uuid',
        latitude: 9.032,
        longitude: 38.7469,
        speed: 45.5,
        heading: 180,
        timestamp: '2026-03-01T10:30:00Z',
        engineSimulatedOff: false,
        violationZoneName: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Trip not in progress' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async updateLocation(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    const location = await this.trackingService.saveLocation(
      tripId,
      updateLocationDto,
    );

    // Broadcast via WebSocket
    this.trackingGateway.broadcastLocationUpdate(tripId, location);

    return location;
  }

  @Post(':tripId/locations/bulk')
  @ApiOperation({
    summary: 'Bulk upload offline locations',
    description: 'Upload multiple GPS locations recorded offline',
  })
  @ApiResponse({
    status: 201,
    description: 'Locations saved successfully',
    schema: {
      example: {
        count: 25,
        message: '25 locations saved successfully',
      },
    },
  })
  async bulkUpdateLocations(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() locations: UpdateLocationDto[],
  ) {
    const savedLocations = await this.trackingService.saveBulkLocations(
      tripId,
      locations,
    );

    return {
      count: savedLocations.length,
      message: `${savedLocations.length} locations saved successfully`,
    };
  }

  @Get(':tripId/route')
  @ApiOperation({
    summary: 'Get complete trip route',
    description: 'Get all GPS locations for a trip in chronological order',
  })
  @ApiResponse({
    status: 200,
    description: 'Trip route',
    schema: {
      example: [
        {
          id: 'uuid',
          latitude: 9.032,
          longitude: 38.7469,
          speed: 45.5,
          timestamp: '2026-03-01T10:30:00Z',
        },
      ],
    },
  })
  getTripRoute(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.trackingService.getTripRoute(tripId);
  }

  @Get(':tripId/current')
  @ApiOperation({
    summary: 'Get current location',
    description: 'Get the most recent GPS location for a trip',
  })
  @ApiResponse({
    status: 200,
    description: 'Current location',
    schema: {
      example: {
        id: 'uuid',
        tripId: 'uuid',
        latitude: 9.032,
        longitude: 38.7469,
        speed: 45.5,
        heading: 180,
        timestamp: '2026-03-01T10:30:00Z',
      },
    },
  })
  getCurrentLocation(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.trackingService.getCurrentLocation(tripId);
  }

  @Get(':tripId/recent')
  @ApiOperation({
    summary: 'Get recent locations',
    description: 'Get the most recent GPS locations for a trip',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of locations (default: 50)',
  })
  @ApiResponse({ status: 200, description: 'Recent locations' })
  getRecentLocations(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Query('limit') limit?: number,
  ) {
    return this.trackingService.getRecentLocations(tripId, limit || 50);
  }

  @Get(':tripId/statistics')
  @ApiOperation({
    summary: 'Get tracking statistics',
    description: 'Get comprehensive statistics about trip tracking',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking statistics',
    schema: {
      example: {
        totalPoints: 150,
        distance: 45.5,
        averageSpeed: 42.3,
        maxSpeed: 65.0,
        duration: 65.5,
        startTime: '2026-03-01T09:00:00Z',
        endTime: '2026-03-01T10:05:30Z',
      },
    },
  })
  getStatistics(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.trackingService.getLocationStatistics(tripId);
  }

  @Get(':tripId/viewers')
  @ApiOperation({
    summary: 'Get active viewers count',
    description: 'Get number of users currently watching this trip',
  })
  @ApiResponse({
    status: 200,
    description: 'Active viewers count',
    schema: {
      example: {
        tripId: 'uuid',
        activeViewers: 5,
      },
    },
  })
  getActiveViewers(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return {
      tripId,
      activeViewers: this.trackingGateway.getActiveViewers(tripId),
    };
  }

  @Get('live')
  @ApiOperation({
    summary: 'Get live vehicle locations',
    description: 'Returns latest GPS positions for vehicles on active trips',
  })
  @ApiResponse({ status: 200, description: 'Live vehicle locations' })
  getLiveVehicleLocations() {
    return this.trackingService.getLiveVehicleLocations();
  }
}
