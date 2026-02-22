# Quick Start Guide - Fleet Management System

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## Installation

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install

# Install global tools
npm install -g @nestjs/cli
```

### 2. Environment Setup

Create `.env` file:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fleet_management
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Web Push (optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@school.edu

# External Services
GPS_PROVIDER_URL=http://gps-service:8080
SCANNER_API_URL=http://scanner-service:8080
```

### 3. Database Setup

```bash
# Using Docker
docker-compose up -d postgres redis

# Or install locally
# PostgreSQL: https://www.postgresql.org/download/
# Redis: https://redis.io/download/

# Create database
createdb fleet_management

# Run migrations
npm run migration:run

# Seed initial data (optional)
npm run seed
```

### 4. Start Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Application will be available at `http://localhost:3000`

API Documentation (Swagger): `http://localhost:3000/api/docs`

## Docker Setup (Recommended)

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: fleet_management
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      REDIS_HOST: redis
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

## Initial Setup

### 1. Create Super Admin

```bash
# Using CLI
npm run cli:create-admin

# Or via API
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.edu",
    "password": "Admin@123",
    "firstName": "System",
    "lastName": "Administrator",
    "phoneNumber": "+1234567890",
    "role": "Developer"
  }'
```

### 2. Login and Get Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.edu",
    "password": "Admin@123"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

### 3. Create Organization Structure

```bash
# Create College
curl -X POST http://localhost:3000/api/v1/colleges \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "College of Engineering",
    "code": "COE"
  }'

# Create Department
curl -X POST http://localhost:3000/api/v1/departments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Science",
    "code": "CS",
    "collegeId": "COLLEGE_UUID"
  }'
```

### 4. Add Vehicles

```bash
curl -X POST http://localhost:3000/api/v1/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "ABC-1234",
    "make": "Toyota",
    "model": "Hiace",
    "year": 2022,
    "capacity": 15,
    "fuelType": "Diesel",
    "currentMileage": 125000
  }'
```

### 5. Add Drivers

```bash
# First create user with Driver role
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@school.edu",
    "password": "Driver@123",
    "firstName": "John",
    "lastName": "Driver",
    "phoneNumber": "+1234567890",
    "role": "Driver"
  }'

# Then create driver profile
curl -X POST http://localhost:3000/api/v1/drivers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID",
    "licenseNumber": "DL-123456",
    "licenseExpiry": "2026-12-31",
    "experienceYears": 10
  }'
```

### 6. Initialize Workflows

```bash
# Workflows are auto-created on first startup
# Or manually create via API
curl -X POST http://localhost:3000/api/v1/admin/workflows \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @workflow-normal.json
```

## Testing the System

### 1. Create Trip Request

```bash
curl -X POST http://localhost:3000/api/v1/trips \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripType": "Normal",
    "purpose": "Academic conference",
    "destination": "City Convention Center",
    "startDateTime": "2024-02-20T09:00:00Z",
    "endDateTime": "2024-02-20T17:00:00Z",
    "passengerCount": 5
  }'
```

### 2. Submit Trip Request

```bash
curl -X POST http://localhost:3000/api/v1/trips/TRIP_ID/submit \
  -H "Authorization: Bearer USER_TOKEN"
```

### 3. Approve Trip (Department Head)

```bash
curl -X POST http://localhost:3000/api/v1/trips/TRIP_ID/approve \
  -H "Authorization: Bearer DEPT_HEAD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "Approved for academic purposes"
  }'
```

### 4. Allocate Vehicle (Deployment Team)

```bash
curl -X POST http://localhost:3000/api/v1/trips/TRIP_ID/allocate \
  -H "Authorization: Bearer DEPLOYMENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "VEHICLE_UUID",
    "driverId": "DRIVER_UUID",
    "estimatedFuelCost": 50.00,
    "estimatedDistance": 45.5
  }'
```

### 5. Start Trip

```bash
curl -X POST http://localhost:3000/api/v1/trips/TRIP_ID/start \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "ABC-1234",
    "scannerValidation": true
  }'
```

### 6. Track Trip (WebSocket)

```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000/tracking', {
  auth: { token: 'DRIVER_TOKEN' }
});

// Send location updates
setInterval(() => {
  socket.emit('location-update', {
    tripId: 'TRIP_UUID',
    latitude: 40.7128,
    longitude: -74.0060,
    speed: 45.5,
    heading: 180,
    accuracy: 10,
    timestamp: new Date().toISOString()
  });
}, 5000);

// Subscribe to trip updates
socket.emit('subscribe-trip', { tripId: 'TRIP_UUID' });

socket.on('location-updated', (data) => {
  console.log('Location updated:', data);
});
```

### 7. Complete Trip

```bash
curl -X POST http://localhost:3000/api/v1/trips/TRIP_ID/complete \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actualDistance": 48.2,
    "actualFuelCost": 52.50,
    "finalMileage": 125480,
    "notes": "Trip completed successfully"
  }'
```

## Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger

# Building
npm run build              # Build for production
npm run start:prod         # Run production build

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run e2e tests

# Database
npm run migration:generate # Generate migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run seed               # Seed database

# Linting
npm run lint               # Run ESLint
npm run format             # Format with Prettier

# Docker
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
```

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Metrics (Prometheus)

```bash
curl http://localhost:3000/metrics
```

### API Documentation

Open browser: `http://localhost:3000/api/docs`

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
psql -h localhost -U postgres -d fleet_management

# Reset database
docker-compose down -v
docker-compose up -d
npm run migration:run
```

### Redis Connection Issues

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001

# Or kill process using port
lsof -ti:3000 | xargs kill -9
```

### Clear Cache

```bash
# Clear Redis cache
redis-cli FLUSHALL

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Configure Web Push notifications
2. Set up GPS provider integration
3. Configure plate scanner integration
4. Set up monitoring (Prometheus + Grafana)
5. Configure error tracking (Sentry)
6. Set up CI/CD pipeline
7. Deploy to production

## Support

- Documentation: `/docs`
- API Reference: `http://localhost:3000/api/docs`
- Issues: GitHub Issues
- Email: support@school.edu

## Security Notes

- Change all default passwords
- Use strong JWT secrets
- Enable HTTPS in production
- Configure CORS properly
- Set up rate limiting
- Enable audit logging
- Regular security updates
