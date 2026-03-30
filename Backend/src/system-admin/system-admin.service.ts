import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { TripRequest, TripState } from '../trips/entities/trip-request.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import {
  MaintenanceRequest,
  MaintenanceStatus,
} from '../maintenance/entities/maintenance-request.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { SystemConfigDto } from './dto/system-config.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SystemAdminService {
  private systemConfig = {
    maintenanceMode: false,
    maintenanceReason: '',
    estimatedDuration: 0,
    maxTripAdvanceDays: 30,
    minTripAdvanceHours: 48,
    autoApprovalThreshold: 1000,
    emailNotifications: true,
    smsNotifications: false,
  };

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TripRequest)
    private readonly tripRepository: Repository<TripRequest>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(MaintenanceRequest)
    private readonly maintenanceRepository: Repository<MaintenanceRequest>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // User Management
  async getAllUsers(filters: {
    role?: string;
    isActive?: boolean;
    department?: string;
    college?: string;
  }) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.college', 'college');

    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.department) {
      query.andWhere('department.id = :departmentId', {
        departmentId: filters.department,
      });
    }

    if (filters.college) {
      query.andWhere('college.id = :collegeId', { collegeId: filters.college });
    }

    const users = await query.getMany();

    // Remove password from response
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async createSystemUser(createUserDto: CreateSystemUserDto) {
    return this.usersService.create(createUserDto);
  }

  async updateUser(id: string, updateUserDto: UpdateSystemUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  async deleteUser(id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has active trips or maintenance requests
    const activeTrips = await this.tripRepository.count({
      where: { requester: { id } },
    });

    if (activeTrips > 0) {
      throw new BadRequestException('Cannot delete user with active trips');
    }

    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = isActive;
    await this.userRepository.save(user);

    return {
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: { ...user, password: undefined },
    };
  }

  async resetUserPassword(id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new password
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await this.userRepository.save(user);

    // In a real system, you would send this via email
    return {
      message: 'Password reset successfully',
      temporaryPassword: newPassword,
      note: 'In production, this would be sent via email',
    };
  }

  // System Statistics
  async getSystemOverview() {
    const [
      totalUsers,
      activeUsers,
      totalTrips,
      pendingTrips,
      totalVehicles,
      availableVehicles,
      totalMaintenance,
      pendingMaintenance,
      totalNotifications,
      unreadNotifications,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.tripRepository.count(),
      this.tripRepository.count({
        where: { state: TripState.PENDING_DEPARTMENT },
      }),
      this.vehicleRepository.count(),
      this.vehicleRepository.count({ where: { status: VehicleStatus.Active } }),
      this.maintenanceRepository.count(),
      this.maintenanceRepository.count({
        where: { status: MaintenanceStatus.Submitted },
      }),
      this.notificationRepository.count(),
      this.notificationRepository.count({ where: { isRead: false } }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      trips: { total: totalTrips, pending: pendingTrips },
      vehicles: { total: totalVehicles, available: availableVehicles },
      maintenance: { total: totalMaintenance, pending: pendingMaintenance },
      notifications: { total: totalNotifications, unread: unreadNotifications },
      systemHealth: await this.getSystemHealth(),
    };
  }

  async getUserStatistics() {
    const roleStats = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const activeStats = await this.userRepository
      .createQueryBuilder('user')
      .select('user.isActive', 'isActive')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.isActive')
      .getRawMany();

    return {
      byRole: roleStats,
      byStatus: activeStats,
      total: await this.userRepository.count(),
    };
  }

  async getTripStatistics() {
    const stateStats = await this.tripRepository
      .createQueryBuilder('trip')
      .select('trip.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .groupBy('trip.state')
      .getRawMany();

    const typeStats = await this.tripRepository
      .createQueryBuilder('trip')
      .select('trip.tripType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('trip.tripType')
      .getRawMany();

    return {
      byState: stateStats,
      byType: typeStats,
      total: await this.tripRepository.count(),
    };
  }

  async getVehicleStatistics() {
    const statusStats = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('vehicle.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('vehicle.status')
      .getRawMany();

    const typeStats = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('vehicle.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('vehicle.type')
      .getRawMany();

    return {
      byStatus: statusStats,
      byType: typeStats,
      total: await this.vehicleRepository.count(),
    };
  }

  async getMaintenanceStatistics() {
    const statusStats = await this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .select('maintenance.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('maintenance.status')
      .getRawMany();

    const costStats = await this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .select('SUM(maintenance.actualCost)', 'totalCost')
      .addSelect('AVG(maintenance.actualCost)', 'averageCost')
      .where('maintenance.actualCost IS NOT NULL')
      .getRawOne();

    return {
      byStatus: statusStats,
      costs: {
        total: parseFloat(costStats?.totalCost || '0'),
        average: parseFloat(costStats?.averageCost || '0'),
      },
      total: await this.maintenanceRepository.count(),
    };
  }

  // System Configuration
  async getSystemConfig() {
    return this.systemConfig;
  }

  async updateSystemConfig(configDto: SystemConfigDto) {
    this.systemConfig = { ...this.systemConfig, ...configDto };
    return {
      message: 'System configuration updated successfully',
      config: this.systemConfig,
    };
  }

  // Audit Logs
  async getAuditLogs(filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    limit: number;
  }) {
    const query = this.auditRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.timestamp', 'DESC')
      .limit(filters.limit);

    if (filters.startDate) {
      query.andWhere('audit.timestamp >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      query.andWhere('audit.timestamp <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    if (filters.userId) {
      query.andWhere('audit.user.id = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      query.andWhere('audit.action ILIKE :action', {
        action: `%${filters.action}%`,
      });
    }

    return query.getMany();
  }

  // System Health
  async getSystemHealth() {
    try {
      // Check database connectivity
      await this.dataSource.query('SELECT 1');

      // Check system resources (simplified)
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      return {
        status: 'healthy',
        database: 'connected',
        uptime: Math.floor(uptime),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  // Backup Management
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;

    // In a real system, you would create actual database backup
    return {
      message: 'Backup created successfully',
      backupName,
      timestamp: new Date(),
      note: 'In production, this would create actual database backup',
    };
  }

  async listBackups() {
    // In a real system, you would list actual backup files
    return {
      backups: [
        {
          name: 'backup-2024-01-15T10-30-00',
          size: '125MB',
          created: '2024-01-15T10:30:00Z',
        },
        {
          name: 'backup-2024-01-14T10-30-00',
          size: '123MB',
          created: '2024-01-14T10:30:00Z',
        },
      ],
      note: 'In production, this would list actual backup files',
    };
  }

  // Maintenance Mode
  async setMaintenanceMode(
    enabled: boolean,
    reason?: string,
    estimatedDuration?: number,
  ) {
    this.systemConfig.maintenanceMode = enabled;

    if (enabled) {
      this.systemConfig.maintenanceReason = reason || 'System maintenance';
      this.systemConfig.estimatedDuration = estimatedDuration || 60;
    } else {
      this.systemConfig.maintenanceReason = '';
      this.systemConfig.estimatedDuration = 0;
    }

    return {
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      maintenanceMode: enabled,
      reason: this.systemConfig.maintenanceReason,
      estimatedDuration: this.systemConfig.estimatedDuration,
    };
  }

  // Bulk Operations
  async bulkImportUsers(users: CreateSystemUserDto[]) {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const userData of users) {
      try {
        await this.createSystemUser(userData);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${userData.email}: ${error.message}`);
      }
    }

    return results;
  }

  async exportUsers(options: { format: 'csv' | 'json'; filters?: any }) {
    const users = await this.getAllUsers(options.filters || {});

    if (options.format === 'json') {
      return {
        format: 'json',
        data: users,
        count: users.length,
      };
    } else {
      // CSV format
      const csvHeaders =
        'ID,Name,Email,Role,Department,College,Active,Created\n';
      const csvData = users
        .map(
          (user) =>
            `${user.id},${user.name},${user.email},${user.role},${user.department?.name || ''},${user.college?.name || ''},${user.isActive},${user.createdAt}`,
        )
        .join('\n');

      return {
        format: 'csv',
        data: csvHeaders + csvData,
        count: users.length,
      };
    }
  }

  // System Notifications
  async broadcastNotification(notification: {
    title: string;
    message: string;
    type: string;
    targetRoles?: string[];
    targetUsers?: string[];
  }) {
    let recipients: User[] = [];

    if (notification.targetUsers && notification.targetUsers.length > 0) {
      // Send to specific users
      recipients = await this.userRepository.findByIds(
        notification.targetUsers,
      );
    } else if (
      notification.targetRoles &&
      notification.targetRoles.length > 0
    ) {
      // Send to users with specific roles
      recipients = await this.userRepository.find({
        where: {
          role: In(notification.targetRoles as UserRole[]),
          isActive: true,
        },
      });
    } else {
      // Send to all active users
      recipients = await this.userRepository.find({
        where: { isActive: true },
      });
    }

    if (recipients.length > 0) {
      await this.notificationsService.createBulkNotifications(
        recipients,
        notification.type as any,
        notification.title,
        notification.message,
      );
    }

    return {
      message: 'Notification sent successfully',
      recipientCount: recipients.length,
    };
  }
}
