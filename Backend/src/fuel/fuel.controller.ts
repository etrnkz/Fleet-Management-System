import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FuelService } from './fuel.service';
import { CreateFuelRecordDto } from './dto/create-fuel-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { FuelRecordType } from './entities/fuel-record.entity';

@ApiTags('Fuel')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('fuel')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Post()
  @Roles(UserRole.TransportOffice, UserRole.Driver, UserRole.Developer)
  @ApiOperation({ 
    summary: 'Record fuel transaction',
    description: 'Record a fuel refuel, trip consumption, or adjustment'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Fuel record created',
    schema: {
      example: {
        id: 'uuid',
        vehicleId: 'uuid',
        type: 'Refuel',
        quantity: 50.5,
        pricePerLiter: 65.50,
        totalCost: 3307.75,
        mileageAtRefuel: 125000,
        station: 'Total Gas Station',
        receiptNumber: 'RCP-12345',
        createdAt: '2026-02-24T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  create(@Body() createFuelRecordDto: CreateFuelRecordDto, @Request() req) {
    return this.fuelService.create(createFuelRecordDto, req.user.id);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all fuel records',
    description: 'Retrieve fuel records with optional filtering'
  })
  @ApiQuery({ name: 'vehicleId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: FuelRecordType })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'List of fuel records',
    schema: {
      example: [
        {
          id: 'uuid',
          vehicle: {
            plateNumber: 'ABC-1234',
            make: 'Toyota',
            model: 'Hiace'
          },
          type: 'Refuel',
          quantity: 50.5,
          totalCost: 3307.75,
          mileageAtRefuel: 125000,
          createdAt: '2026-02-24T10:00:00Z'
        }
      ]
    }
  })
  findAll(
    @Query('vehicleId') vehicleId?: string,
    @Query('type') type?: FuelRecordType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.fuelService.findAll(
      vehicleId,
      type,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('statistics')
  @Roles(UserRole.TransportOffice, UserRole.Dean, UserRole.Developer)
  @ApiOperation({ 
    summary: 'Get fuel statistics',
    description: 'Get comprehensive fuel consumption and cost statistics'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Fuel statistics',
    schema: {
      example: {
        totalRecords: 150,
        totalCost: 495000,
        totalQuantity: 7550,
        averagePricePerLiter: 65.56,
        byType: {
          Refuel: 120,
          TripConsumption: 25,
          Adjustment: 5
        },
        byVehicle: {
          'ABC-1234': {
            count: 45,
            totalCost: 148500,
            totalQuantity: 2265
          }
        }
      }
    }
  })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.fuelService.getStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('cost-analysis')
  @Roles(UserRole.TransportOffice, UserRole.Dean, UserRole.Developer)
  @ApiOperation({ 
    summary: 'Get fuel cost analysis',
    description: 'Detailed cost analysis with monthly breakdown'
  })
  @ApiQuery({ name: 'vehicleId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Cost analysis',
    schema: {
      example: {
        totalCost: 495000,
        totalQuantity: 7550,
        recordCount: 150,
        monthlyBreakdown: [
          {
            month: '2026-02',
            cost: 82500,
            quantity: 1260,
            count: 25,
            averageCostPerRefuel: 3300
          }
        ],
        vehicleId: 'uuid'
      }
    }
  })
  getCostAnalysis(
    @Query('vehicleId') vehicleId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.fuelService.getCostAnalysis(
      vehicleId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('vehicle/:vehicleId/history')
  @ApiOperation({ 
    summary: 'Get vehicle fuel history',
    description: 'Get complete fuel history for a specific vehicle'
  })
  @ApiResponse({ status: 200, description: 'Vehicle fuel history' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  getVehicleHistory(@Param('vehicleId', ParseUUIDPipe) vehicleId: string) {
    return this.fuelService.getVehicleFuelHistory(vehicleId);
  }

  @Get('vehicle/:vehicleId/efficiency')
  @ApiOperation({ 
    summary: 'Calculate fuel efficiency',
    description: 'Calculate fuel efficiency (km/liter) for a vehicle based on refuel records'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Fuel efficiency data',
    schema: {
      example: {
        vehicleId: 'uuid',
        averageEfficiency: 8.5,
        totalDistance: 12750,
        totalFuel: 1500,
        recordCount: 25,
        efficiencyData: [
          {
            date: '2026-02-24T10:00:00Z',
            distance: 510,
            fuel: 60,
            efficiency: 8.5,
            mileage: 125510
          }
        ]
      }
    }
  })
  calculateEfficiency(@Param('vehicleId', ParseUUIDPipe) vehicleId: string) {
    return this.fuelService.calculateFuelEfficiency(vehicleId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get fuel record by ID',
    description: 'Retrieve a specific fuel record'
  })
  @ApiResponse({ status: 200, description: 'Fuel record details' })
  @ApiResponse({ status: 404, description: 'Fuel record not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fuelService.findOne(id);
  }
}
