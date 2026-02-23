export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'fleet_management',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
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
});