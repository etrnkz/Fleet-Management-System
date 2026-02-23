import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditAction, AuditEntity } from './entities/audit-log.entity';

@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get audit logs',
    description: 'Get paginated audit logs with optional filtering by user, action, entity type, and date range'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction, description: 'Filter by action type' })
  @ApiQuery({ name: 'entityType', required: false, enum: AuditEntity, description: 'Filter by entity type' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO 8601)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of audit logs',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            action: 'APPROVE',
            entityType: 'Trip',
            entityId: 'uuid',
            userId: 'uuid',
            userName: 'John Doe',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            oldValues: { state: 'PENDING_DEPARTMENT' },
            newValues: { state: 'PENDING_COLLEGE' },
            timestamp: '2024-01-15T10:00:00Z'
          }
        ],
        total: 1250,
        page: 1,
        limit: 50,
        totalPages: 25
      }
    }
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: AuditEntity,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findAll(
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 50,
      {
        userId,
        action,
        entityType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    );
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Get audit statistics',
    description: 'Get comprehensive statistics about audit logs and system activity'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO 8601)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit statistics',
    schema: {
      example: {
        totalActions: 1250,
        byAction: {
          CREATE: 350,
          UPDATE: 420,
          DELETE: 80,
          APPROVE: 150,
          REJECT: 45,
          SUBMIT: 120,
          ALLOCATE: 85
        },
        byEntity: {
          Trip: 450,
          Vehicle: 200,
          Driver: 180,
          User: 150,
          Maintenance: 120,
          College: 50,
          Department: 100
        },
        topUsers: [
          { userId: 'uuid', name: 'Admin User', actionCount: 245 },
          { userId: 'uuid', name: 'Transport Manager', actionCount: 189 }
        ]
      }
    }
  })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get audit logs for specific entity' })
  @ApiResponse({ status: 200, description: 'Entity audit trail' })
  findByEntity(
    @Param('entityType') entityType: AuditEntity,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entityType, entityId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs for specific user' })
  @ApiResponse({ status: 200, description: 'User audit trail' })
  findByUser(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }
}
