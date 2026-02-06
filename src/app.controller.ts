import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'API Root', 
    description: 'Returns basic API information' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API information',
    schema: {
      example: {
        service: 'Fleet Management API',
        description: 'Backend service for fleet operations',
        version: '1.0.0',
        environment: 'development',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  getRoot() {
    return this.appService.getApiInfo();
  }

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Health Check', 
    description: 'Check API health and uptime' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API is healthy',
    schema: {
      example: {
        status: 'OK',
        uptime: 12345.67,
        timestamp: '2024-01-01T00:00:00.000Z',
        database: 'connected',
        memoryUsage: {
          heapUsed: '45.2 MB',
          heapTotal: '78.4 MB'
        }
      }
    }
  })
  getHealth() {
    return this.appService.getHealthStatus();
  }

  @Public()
  @Get('status')
  @ApiOperation({ 
    summary: 'System Status', 
    description: 'Detailed system status and metrics' 
  })
  getStatus() {
    return this.appService.getSystemStatus();
  }

  @Public()
  @Get('version')
  @ApiOperation({ 
    summary: 'API Version', 
    description: 'Get current API version information' 
  })
  getVersion() {
    return this.appService.getVersionInfo();
  }
}