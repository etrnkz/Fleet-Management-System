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
      .select('vehicle.vehicleType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('vehicle.vehicleType IS NOT NULL')
      .groupBy('vehicle.vehicleType')
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
      .orderBy('audit.createdAt', 'DESC')
      .take(filters.limit);

    if (filters.startDate) {
      query.andWhere('audit.createdAt >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      query.andWhere('audit.createdAt <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      query.andWhere('LOWER(audit.action) LIKE LOWER(:action)', {
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
  private readonly backupDir = path.join(process.cwd(), 'backups');

  private ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    this.ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    // Get DB connection details from DataSource
    const opts = this.dataSource.options as any;
    const host     = opts.host     || process.env.DB_HOST     || 'localhost';
    const port     = opts.port     || process.env.DB_PORT     || '5432';
    const username = opts.username || process.env.DB_USERNAME || 'postgres';
    const password = opts.password || process.env.DB_PASSWORD || 'postgres';
    const database = opts.database || process.env.DB_NAME     || 'fleet_management';

    return new Promise<any>((resolve, reject) => {
      const { exec } = require('child_process');
      const env = { ...process.env, PGPASSWORD: String(password) };
      const cmd = `pg_dump -h ${host} -p ${port} -U ${username} -F p -f "${filepath}" ${database}`;

      exec(cmd, { env }, (error: any) => {
        if (error) {
          // pg_dump not available — fall back to JSON export
          this.createJsonBackup(filepath.replace('.sql', '.json'), database)
            .then(jsonFile => {
              const stat = fs.statSync(jsonFile);
              resolve({
                message: 'Backup created (JSON format — pg_dump not available)',
                filename: path.basename(jsonFile),
                size: `${Math.round(stat.size / 1024)} KB`,
                createdAt: new Date().toISOString(),
                format: 'json',
              });
            })
            .catch(reject);
          return;
        }

        const stat = fs.statSync(filepath);
        resolve({
          message: 'Backup created successfully',
          filename,
          size: `${Math.round(stat.size / 1024)} KB`,
          createdAt: new Date().toISOString(),
          format: 'sql',
        });
      });
    });
  }

  private async createJsonBackup(filepath: string, _database: string): Promise<string> {
    // Export key tables as JSON
    const [users, vehicles, trips, drivers] = await Promise.all([
      this.userRepository.find({ select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt'] }),
      this.vehicleRepository.find(),
      this.tripRepository.find({ take: 1000, order: { createdAt: 'DESC' } }),
      this.dataSource.query('SELECT id, "licenseNumber", status, "userId" FROM drivers'),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      tables: {
        users: { count: users.length, data: users },
        vehicles: { count: vehicles.length, data: vehicles },
        trips: { count: trips.length, data: trips },
        drivers: { count: drivers.length, data: drivers },
      },
    };

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    return filepath;
  }

  async listBackups() {
    this.ensureBackupDir();
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(f => f.startsWith('backup-') && (f.endsWith('.sql') || f.endsWith('.json')))
        .map(f => {
          const filepath = path.join(this.backupDir, f);
          const stat = fs.statSync(filepath);
          return {
            name: f,
            filename: f,
            size: `${Math.round(stat.size / 1024)} KB`,
            createdAt: stat.birthtime.toISOString(),
            format: f.endsWith('.sql') ? 'sql' : 'json',
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return files;
    } catch {
      return [];
    }
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
