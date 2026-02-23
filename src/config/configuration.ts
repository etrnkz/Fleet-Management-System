export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'SECRET_KEY',
    expiration: process.env.JWT_EXPIRATION || '3600s', // Use '3600s' for 1 hour
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // milliseconds
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
});