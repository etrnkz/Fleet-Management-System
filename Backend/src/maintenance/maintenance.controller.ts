import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { InspectMaintenanceDto } from './dto/inspect-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceStatus } from './entities/maintenance-request.entity';

@ApiTags('Maintenance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Submit maintenance request',
    description: 'Driver submits a maintenance request for a vehicle. Vehicle status is automatically set to UnderMaintenance.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Maintenance request created',
    schema: {
      example: {
        id: 'uuid',
        vehicleId: 'uuid',
        issueDescription: 'Engine making unusual noise',
        priority: 'High',
        status: 'Submitted',
        submittedBy: 'John Driver',
        submittedAt: '2024-01-15T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  create(@Body() createMaintenanceDto: CreateMaintenanceDto, @Request() req) {
    return this.maintenanceService.create(createMaintenanceDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all maintenance requests' })
  @ApiQuery({ name: 'status', required: false, enum: MaintenanceStatus })
  @ApiResponse({ status: 200, description: 'List of maintenance requests' })
  findAll(@Query('status') status?: MaintenanceStatus) {
    if (status) {
      return this.maintenanceService.findByStatus(status);
    }
    return this.maintenanceService.findAll();
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Get maintenance statistics',
    description: 'Get comprehensive statistics about maintenance requests'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Maintenance statistics',
    schema: {
      example: {
        total: 45,
        byStatus: {
          Submitted: 5,
          UnderInspection: 3,
          EstimateProvided: 2,
          BudgetApproved: 1,
          InProgress: 4,
          Completed: 30
        },
        totalEstimatedCost: 125000,
        totalActualCost: 118500,
        averageCost: 3950,
        completionRate: 66.7
      }
    }
  })
  getStatistics() {
    return this.maintenanceService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance request details' })
  @ApiResponse({ status: 200, description: 'Maintenance request details' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post(':id/inspect')
  @ApiOperation({ summary: 'Inspect and provide estimate' })
  @ApiResponse({ status: 200, description: 'Inspection completed' })
  inspect(
    @Param('id') id: string,
    @Body() inspectDto: InspectMaintenanceDto,
    @Request() req,
  ) {
    return this.maintenanceService.inspect(id, inspectDto, req.user);
  }

  @Post(':id/approve-budget')
  @ApiOperation({ summary: 'Approve maintenance budget' })
  @ApiResponse({ status: 200, description: 'Budget approved' })
  approveBudget(@Param('id') id: string, @Request() req) {
    return this.maintenanceService.approveBudget(id, req.user);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start maintenance work' })
  @ApiResponse({ status: 200, description: 'Maintenance started' })
  startMaintenance(@Param('id') id: string, @Request() req) {
    return this.maintenanceService.startMaintenance(id, req.user);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete maintenance' })
  @ApiResponse({ status: 200, description: 'Maintenance completed' })
  complete(
    @Param('id') id: string,
    @Body() completeDto: CompleteMaintenanceDto,
    @Request() req,
  ) {
    return this.maintenanceService.complete(id, completeDto, req.user);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject maintenance request' })
  @ApiResponse({ status: 200, description: 'Maintenance rejected' })
  reject(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.maintenanceService.reject(id, body.reason, req.user);
  }
}
