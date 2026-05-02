import { envString } from './env.util';

export default () => ({
  app: {
    port: parseInt(envString('PORT', '3000'), 10),
    environment: envString('NODE_ENV', 'development'),
    frontendUrl: envString('FRONTEND_URL', 'http://localhost:3001'),
  },
  database: {
    host: envString('DB_HOST', 'localhost'),
    port: parseInt(envString('DB_PORT', '5432'), 10),
    username: envString('DB_USERNAME', 'postgres'),
    password: envString('DB_PASSWORD', 'postgres'),
    name: envString('DB_NAME', 'fleet_management'),
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    runMigrations: process.env.DB_RUN_MIGRATIONS === 'true',
  },
  jwt: {
    secret: envString('JWT_SECRET', 'hufms-fallback-secret-change-in-production'),
    expiration: envString('JWT_EXPIRATION', '7h'),
    refreshSecret: envString('JWT_REFRESH_SECRET', 'hufms-fallback-refresh-secret-change-in-production'),
    refreshExpiration: envString('JWT_REFRESH_EXPIRATION', '7d'),
    // Remember Me expiration (keepMeSignedIn=true)
    rememberMeExpiration: '45d',
  },
  throttler: {
    ttl: parseInt(envString('THROTTLE_TTL', '60000'), 10),
    limit: parseInt(envString('THROTTLE_LIMIT', '100'), 10),
  },
  redis: {
    host: envString('REDIS_HOST', 'localhost'),
    port: parseInt(envString('REDIS_PORT', '6379'), 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  email: {
    host: envString('EMAIL_HOST', 'smtp.gmail.com'),
    port: parseInt(envString('EMAIL_PORT', '587'), 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER?.trim(),
    password: process.env.EMAIL_PASSWORD?.replace(/\s/g, ''),
    from: envString('EMAIL_FROM', 'Fleet Management <noreply@fleet.school.edu>'),
  },
  sms: {
    brevoApiKey: process.env.BREVO_API_KEY || '',
    senderName: envString('SMS_SENDER_NAME', 'FleetMgmt'),
  },
  logging: {
    level: envString('LOG_LEVEL', 'warn'),
  },
});
