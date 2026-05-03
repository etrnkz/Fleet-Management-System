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

@ApiTags('Tracking')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  // ── Static / non-parameterised routes ────────────────────────────────────

  @Get('live')
  @ApiOperation({ summary: 'Get live vehicle locations' })
  @ApiResponse({ status: 200, description: 'Live vehicle locations' })
  getLiveVehicleLocations() {
    return this.trackingService.getLiveVehicleLocations();
  }

  // ── Service vehicle routes (must be before :tripId to avoid UUID mismatch) ─

  @Get('service-vehicles/live')
  @ApiOperation({ summary: 'Get live locations for all service vehicles' })
  @ApiResponse({ status: 200, description: 'Live service vehicle locations' })
  getServiceVehicleLiveLocations() {
    return this.trackingService.getServiceVehicleLiveLocations();
  }

  @Get('service-vehicle/:userId/driver-vehicle')
  @ApiOperation({ summary: 'Get service vehicle assigned to a driver user' })
  @ApiResponse({ status: 200, description: 'Service vehicle info or null' })
  getDriverServiceVehicle(@Param('userId') userId: string) {
    return this.trackingService.getDriverServiceVehicle(userId);
  }

  @Post('service-vehicle/:vehicleId/location')
  @ApiOperation({ summary: 'Update GPS location for a service vehicle' })
  @ApiResponse({ status: 201, description: 'Location saved and broadcast' })
  async updateServiceVehicleLocation(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    const location = await this.trackingService.saveServiceVehicleLocation(vehicleId, dto);
    this.trackingGateway.broadcastServiceVehicleLocation(vehicleId, location);
    return location;
  }

  @Post('service-vehicle/:vehicleId/locations/bulk')
  @ApiOperation({ summary: 'Bulk upload offline locations for a service vehicle' })
  @ApiResponse({ status: 201, description: 'Locations processed' })
  async bulkUpdateServiceVehicleLocations(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() body: { locations: UpdateLocationDto[] },
  ) {
    const locations = Array.isArray(body) ? body : (body.locations ?? []);
    let lastLocation: any = null;
    for (const dto of locations) {
      try {
        lastLocation = await this.trackingService.saveServiceVehicleLocation(vehicleId, dto);
      } catch (_) {}
    }
    if (lastLocation) {
      this.trackingGateway.broadcastServiceVehicleLocation(vehicleId, lastLocation);
    }
    return { count: locations.length, message: `${locations.length} locations processed` };
  }

  // ── Trip-based routes (generic :tripId — must come LAST) ──────────────────

  @Get(':tripId/geofence-config')
  @ApiOperation({ summary: 'Geofence config for allocated vehicle' })
  @ApiResponse({ status: 200, description: 'Geofence configuration' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  getTripGeofenceConfig(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.trackingService.getTripGeofenceConfig(tripId);
  }

  @Post(':tripId/location')
  @ApiOperation({ summary: 'Update GPS location (REST fallback)' })
  @ApiResponse({ status: 201, description: 'Location saved and broadcast' })
  async updateLocation(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    const location = await this.trackingService.saveLocation(tripId, updateLocationDto);
    const enriched = await this.trackingService.enrichLocationForBroadcast(tripId, location);
    this.trackingGateway.broadcastLocationUpdate(tripId, enriched);
    return location;
  }

  @Post(':tripId/locations/bulk')
  @ApiOperation({ summary: 'Bulk upload offline locations' })
  @ApiResponse({ status: 201, description: 'Locations saved successfully' })
  async bulkUpdateLocations(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() locations: UpdateLocationDto[],
  ) {
    const savedLocations = await this.trackingService.saveBulkLocations(tripId, locations);
    return {
      count: savedLocations.length,
      message: `${savedLocations.length} locations saved successfully`,
    };
  }

  @Get(':tripId/route')
  @ApiOperation({ summary: 'Get complete trip route' })
  @ApiResponse({ status: 200, description: 'Trip route with stats' })
  async getTripRoute(@Param('tripId', ParseUUIDPipe) tripId: string) {
    const route = await this.trackingService.getTripRoute(tripId);
    const stats = await this.trackingService.getLocationStatistics(tripId);
    return { route, stats };
  }

  @Get(':tripId/current')
  @ApiOperation({ summary: 'Get current location' })
  @ApiResponse({ status: 200, description: 'Current location' })
  getCurrentLocation(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.trackingService.getCurrentLocation(tripId);
  }

  @Get(':tripId/recent')
  @ApiOperation({ summary: 'Get recent locations' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent locations' })
  getRecentLocations(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Query('limit') limit?: number,
  ) {
    return this.trackingService.getRecentLocations(tripId, limit || 50);
  }

  @Get(':tripId/statistics')
  @ApiOperation({ summary: 'Get tracking statistics' })
  @ApiResponse({ status: 200, description: 'Tracking statistics' })
  getStatistics(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.trackingService.getLocationStatistics(tripId);
  }

  @Get(':tripId/viewers')
  @ApiOperation({ summary: 'Get active viewers count' })
  @ApiResponse({ status: 200, description: 'Active viewers count' })
  getActiveViewers(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return {
      tripId,
      activeViewers: this.trackingGateway.getActiveViewers(tripId),
    };
  }
}
