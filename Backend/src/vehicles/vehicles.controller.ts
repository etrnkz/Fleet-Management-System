import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { VehicleStatus } from './entities/vehicle.entity';

@ApiTags('Vehicles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(UserRole.Developer, UserRole.TransportOffice, UserRole.DeploymentTeam)
  @ApiOperation({ summary: 'Add a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully' })
  @ApiResponse({ status: 409, description: 'Plate number already exists' })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiQuery({ name: 'status', enum: VehicleStatus, required: false })
  @ApiQuery({ name: 'availableOnly', type: Boolean, required: false, description: 'If true, exclude vehicles currently allocated to active trips' })
  @ApiResponse({ status: 200, description: 'List of all vehicles' })
  findAll(
    @Query('status') status?: VehicleStatus,
    @Query('availableOnly') availableOnly?: string,
  ) {
    // If status=Active and availableOnly=true (or just status=Active from employee dashboard),
    // exclude vehicles currently on active trips
    if (status === VehicleStatus.Active || availableOnly === 'true') {
      return this.vehiclesService.findAvailable();
    }
    if (status) {
      return this.vehiclesService.findByStatus(status);
    }
    return this.vehiclesService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available vehicles' })
  @ApiQuery({
    name: 'startDateTime',
    required: false,
    description: 'Start date/time for availability check',
  })
  @ApiQuery({
    name: 'endDateTime',
    required: false,
    description: 'End date/time for availability check',
  })
  @ApiResponse({ status: 200, description: 'List of available vehicles' })
  findAvailable(
    @Query('startDateTime') startDateTime?: string,
    @Query('endDateTime') endDateTime?: string,
  ) {
    const start = startDateTime ? new Date(startDateTime) : undefined;
    const end = endDateTime ? new Date(endDateTime) : undefined;
    return this.vehiclesService.findAvailable(start, end);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get vehicle statistics' })
  @ApiResponse({ status: 200, description: 'Vehicle statistics' })
  getStatistics() {
    return this.vehiclesService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle details' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Developer, UserRole.TransportOffice, UserRole.DeploymentTeam)
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Patch(':id/maintenance')
  @Roles(UserRole.Developer, UserRole.TransportOffice, UserRole.MaintenanceTeam)
  @ApiOperation({ summary: 'Set vehicle maintenance status' })
  @ApiResponse({ status: 200, description: 'Maintenance status updated' })
  setMaintenanceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('underMaintenance') underMaintenance: boolean,
  ) {
    return this.vehiclesService.setMaintenanceStatus(id, underMaintenance);
  }

  @Delete(':id')
  @Roles(UserRole.Developer)
  @ApiOperation({ summary: 'Deactivate vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.remove(id);
  }

  // ── Geofence / Perimeter Management ──────────────────────────────────────

  @Get(':id/geofence')
  @ApiOperation({ summary: 'Get geofence config for a vehicle' })
  @ApiResponse({ status: 200, description: 'Geofence configuration' })
  getGeofence(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.getGeofenceConfig(id);
  }

  @Patch(':id/geofence')
  @Roles(UserRole.Developer, UserRole.TransportOffice, UserRole.President)
  @ApiOperation({
    summary: 'Set geofence perimeters for a vehicle',
    description:
      'Enable/disable VIP geo-restriction and set restricted circular zones. When a vehicle enters a zone it receives a warning first, then engine shutdown.',
  })
  @ApiResponse({ status: 200, description: 'Geofence updated' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  updateGeofence(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      vipGeoRestrictionEnabled: boolean;
      restrictedZones: {
        name?: string;
        latitude: number;
        longitude: number;
        radiusMeters: number;
      }[];
    },
  ) {
    return this.vehiclesService.updateGeofenceConfig(
      id,
      body.vipGeoRestrictionEnabled,
      body.restrictedZones,
    );
  }

  @Delete(':id/geofence')
  @Roles(UserRole.Developer, UserRole.TransportOffice, UserRole.President)
  @ApiOperation({ summary: 'Clear all geofence zones for a vehicle' })
  @ApiResponse({ status: 200, description: 'Geofence cleared' })
  clearGeofence(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.updateGeofenceConfig(id, false, []);
  }
}
