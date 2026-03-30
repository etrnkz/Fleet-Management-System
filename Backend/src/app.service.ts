import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getApiInfo() {
    return {
      service: 'Fleet Management System API',
      description:
        'Backend service for managing fleet vehicles, trips, drivers, and maintenance',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        docs: '/api/docs',
        health: '/health',
        status: '/status',
        auth: '/auth',
      },
    };
  }

  getHealthStatus() {
    const memoryUsage = process.memoryUsage();

    return {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected', // You can add actual DB checks later
      memoryUsage: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      },
      nodeVersion: process.version,
      platform: process.platform,
    };
  }

  getSystemStatus() {
    return {
      service: 'Fleet Management API',
      status: 'operational',
      timestamp: new Date().toISOString(),
      metrics: {
        uptime: `${Math.floor(process.uptime() / 60)} minutes`,
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB used`,
        cpu: process.cpuUsage(),
      },
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
    };
  }

  getVersionInfo() {
    return {
      version: process.env.npm_package_version || '1.0.0',
      build: process.env.BUILD_NUMBER || 'local',
      commit: process.env.COMMIT_HASH || 'development',
      buildDate: process.env.BUILD_DATE || new Date().toISOString(),
      node: process.version,
    };
  }
}
