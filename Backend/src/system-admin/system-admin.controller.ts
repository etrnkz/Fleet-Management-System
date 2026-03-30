import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemAdminService } from './system-admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { SystemConfigDto } from './dto/system-config.dto';

@ApiTags('System Administration')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.SystemAdmin, UserRole.Developer)
@Controller('system-admin')
export class SystemAdminController {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  // User Management
  @Get('users')
  @ApiOperation({ 
    summary: 'Get all users with advanced filtering',
    description: 'System admins can view and manage all users in the system'
  })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'college', required: false })
  @ApiResponse({ status: 200, description: 'List of users with detailed information' })
  async getAllUsers(
    @Query('role') role?: string,
    @Query('isActive') isActive?: boolean,
    @Query('department') department?: string,
    @Query('college') college?: string,
  ) {
    return this.systemAdminService.getAllUsers({ role, isActive, department, college });
  }

  @Post('users')
  @ApiOperation({ 
    summary: 'Create system user',
    description: 'Create users with any role including administrative roles'
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createSystemUser(@Body() createUserDto: CreateSystemUserDto) {
    return this.systemAdminService.createSystemUser(createUserDto);
  }

  @Patch('users/:id')
  @ApiOperation({ 
    summary: 'Update any user',
    description: 'System admins can update any user including role changes'
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateSystemUserDto,
  ) {
    return this.systemAdminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @ApiOperation({ 
    summary: 'Delete user',
    description: 'Permanently delete a user (use with caution)'
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemAdminService.deleteUser(id);
  }

  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Activate user account' })
  async activateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemAdminService.toggleUserStatus(id, true);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemAdminService.toggleUserStatus(id, false);
  }

  @Post('users/:id/reset-password')
  @ApiOperation({ 
    summary: 'Reset user password',
    description: 'Generate new password for user and send via email'
  })
  async resetUserPassword(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemAdminService.resetUserPassword(id);
  }

  // System Statistics and Monitoring
  @Get('statistics/overview')
  @ApiOperation({ 
    summary: 'Get comprehensive system statistics',
    description: 'Overview of all system metrics and KPIs'
  })
  @ApiResponse({ status: 200, description: 'System overview statistics' })
  async getSystemOverview() {
    return this.systemAdminService.getSystemOverview();
  }

  @Get('statistics/users')
  @ApiOperation({ summary: 'Get detailed user statistics' })
  async getUserStatistics() {
    return this.systemAdminService.getUserStatistics();
  }

  @Get('statistics/trips')
  @ApiOperation({ summary: 'Get detailed trip statistics' })
  async getTripStatistics() {
    return this.systemAdminService.getTripStatistics();
  }

  @Get('statistics/vehicles')
  @ApiOperation({ summary: 'Get detailed vehicle statistics' })
  async getVehicleStatistics() {
    return this.systemAdminService.getVehicleStatistics();
  }

  @Get('statistics/maintenance')
  @ApiOperation({ summary: 'Get detailed maintenance statistics' })
  async getMaintenanceStatistics() {
    return this.systemAdminService.getMaintenanceStatistics();
  }

  // System Configuration
  @Get('config')
  @ApiOperation({ 
    summary: 'Get system configuration',
    description: 'Retrieve current system settings and configuration'
  })
  async getSystemConfig() {
    return this.systemAdminService.getSystemConfig();
  }

  @Patch('config')
  @ApiOperation({ 
    summary: 'Update system configuration',
    description: 'Update system-wide settings and parameters'
  })
  async updateSystemConfig(@Body() configDto: SystemConfigDto) {
    return this.systemAdminService.updateSystemConfig(configDto);
  }

  // Audit and Logs
  @Get('audit-logs')
  @ApiOperation({ 
    summary: 'Get system audit logs',
    description: 'Retrieve comprehensive audit trail of system activities'
  })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: number,
  ) {
    return this.systemAdminService.getAuditLogs({
      startDate,
      endDate,
      userId,
      action,
      limit: limit || 100,
    });
  }

  @Get('system-health')
  @ApiOperation({ 
    summary: 'Get system health status',
    description: 'Check system health, database connectivity, and service status'
  })
  async getSystemHealth() {
    return this.systemAdminService.getSystemHealth();
  }

  // Data Management
  @Post('backup')
  @ApiOperation({ 
    summary: 'Create system backup',
    description: 'Generate backup of system data'
  })
  async createBackup() {
    return this.systemAdminService.createBackup();
  }

  @Get('backups')
  @ApiOperation({ summary: 'List available backups' })
  async listBackups() {
    return this.systemAdminService.listBackups();
  }

  @Post('maintenance-mode')
  @ApiOperation({ 
    summary: 'Enable maintenance mode',
    description: 'Put system in maintenance mode for updates'
  })
  async enableMaintenanceMode(@Body() body: { reason: string; estimatedDuration?: number }) {
    return this.systemAdminService.setMaintenanceMode(true, body.reason, body.estimatedDuration);
  }

  @Delete('maintenance-mode')
  @ApiOperation({ summary: 'Disable maintenance mode' })
  async disableMaintenanceMode() {
    return this.systemAdminService.setMaintenanceMode(false);
  }

  // Bulk Operations
  @Post('bulk/users/import')
  @ApiOperation({ 
    summary: 'Bulk import users',
    description: 'Import multiple users from CSV or JSON data'
  })
  async bulkImportUsers(@Body() data: { users: CreateSystemUserDto[] }) {
    return this.systemAdminService.bulkImportUsers(data.users);
  }

  @Post('bulk/users/export')
  @ApiOperation({ 
    summary: 'Export users data',
    description: 'Export user data in various formats'
  })
  async exportUsers(@Body() options: { format: 'csv' | 'json'; filters?: any }) {
    return this.systemAdminService.exportUsers(options);
  }

  // System Notifications
  @Post('notifications/broadcast')
  @ApiOperation({ 
    summary: 'Send system-wide notification',
    description: 'Send notification to all users or specific user groups'
  })
  async broadcastNotification(@Body() notification: {
    title: string;
    message: string;
    type: string;
    targetRoles?: string[];
    targetUsers?: string[];
  }) {
    return this.systemAdminService.broadcastNotification(notification);
  }
}