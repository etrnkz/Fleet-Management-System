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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { DriverStatus } from './entities/driver.entity';

@ApiTags('Drivers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @Roles(UserRole.Developer, UserRole.TransportOffice, UserRole.DeploymentTeam)
  @ApiOperation({ summary: 'Create driver profile' })
  @ApiResponse({ status: 201, description: 'Driver profile created successfully' })
  @ApiResponse({ status: 409, description: 'Driver profile or license already exists' })
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drivers' })
  @ApiQuery({ name: 'status', enum: DriverStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of all drivers' })
  findAll(@Query('status') status?: DriverStatus) {
    if (status) {
      return this.driversService.findByStatus(status);
    }
    return this.driversService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available drivers' })
  @ApiResponse({ status: 200, description: 'List of available drivers' })
  findAvailable() {
    return this.driversService.findAvailable();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get driver statistics' })
  @ApiResponse({ status: 200, description: 'Driver statistics' })
  getStatistics() {
    return this.driversService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiResponse({ status: 200, description: 'Driver details' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Developer, UserRole.TransportOffice, UserRole.DeploymentTeam)
  @ApiOperation({ summary: 'Update driver profile' })
  @ApiResponse({ status: 200, description: 'Driver updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.Developer, UserRole.TransportOffice, UserRole.DeploymentTeam)
  @ApiOperation({ summary: 'Update driver status' })
  @ApiResponse({ status: 200, description: 'Driver status updated' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: DriverStatus,
  ) {
    return this.driversService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.Developer)
  @ApiOperation({ summary: 'Deactivate driver' })
  @ApiResponse({ status: 200, description: 'Driver deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.remove(id);
  }
}
