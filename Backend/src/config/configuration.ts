import { envString } from './env.util';

export default () => ({
  app: {
    port: parseInt(envString('PORT', '3000'), 10),
    environment: envString('NODE_ENV', 'development'),
  },
  database: {
    host: envString('DB_HOST', 'localhost'),
    port: parseInt(envString('DB_PORT', '5432'), 10),
    username: envString('DB_USERNAME', 'postgres'),
    password: envString('DB_PASSWORD', 'postgres'),
    name: envString('DB_NAME', 'fleet_management'),
    // Effective sync default: see src/database/typeorm.factory.ts (Postgres default off; SQLite default on)
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true' || false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'SECRET_KEY',
    expiration: process.env.JWT_EXPIRATION || '15m',
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // milliseconds
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
  redis: {
    host: envString('REDIS_HOST', 'localhost'),
    port: parseInt(envString('REDIS_PORT', '6379'), 10),
  },
  email: {
    host: envString('EMAIL_HOST', 'smtp.gmail.com'),
    port: parseInt(envString('EMAIL_PORT', '587'), 10),
    secure: process.env.EMAIL_SECURE === 'true' || false,
    user: process.env.EMAIL_USER?.trim(),
    password: process.env.EMAIL_PASSWORD?.replace(/\s/g, ''),
    from: envString(
      'EMAIL_FROM',
      'Fleet Management <noreply@fleet.school.edu>',
    ),
  },
});
