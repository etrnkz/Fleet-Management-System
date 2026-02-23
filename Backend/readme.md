# Fleet Management System - Backend

Production-grade NestJS backend for the Fleet Management System with RBAC, workflow automation, and real-time tracking.

## 📋 Documentation

- [Architecture Overview](./ARCHITECTURE.md) - System design and technical architecture
- [Database Schema](./DATABASE_SCHEMA.md) - Complete database design with TypeORM entities
- [API Contracts](./API_CONTRACTS.md) - REST and WebSocket API documentation
- [Workflow Engine](./WORKFLOW_ENGINE.md) - Workflow system design and implementation
- [Module Structure](./MODULE_STRUCTURE.md) - NestJS project organization
- [Implementation Plan](./plan.md) - 16-week development roadmap
- [Quick Start Guide](./QUICKSTART.md) - Setup and installation instructions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start database services (Docker)
docker-compose up -d postgres redis

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

Visit `http://localhost:3000/api/docs` for API documentation.

## 📂 Project Structure

```
Backend/
├── src/
│   ├── auth/                    # Authentication & authorization
│   ├── users/                   # User management
│   ├── departments/             # Department management
│   ├── colleges/                # College management
│   ├── vehicles/                # Vehicle management
│   ├── drivers/                 # Driver management
│   ├── trips/                   # Trip request management
│   ├── workflow/                # Workflow engine
│   ├── deployment/              # Vehicle allocation
│   ├── transport/               # Transport office operations
│   ├── maintenance/             # Maintenance management
│   ├── fuel/                    # Fuel management
│   ├── tracking/                # GPS tracking
│   ├── notifications/           # Notification system
│   ├── reports/                 # Reporting & analytics
│   ├── audit/                   # Audit logging
│   ├── scheduler/               # Scheduled jobs
│   ├── integrations/            # External integrations
│   ├── config/                  # Configuration
│   ├── common/                  # Shared utilities
│   └── main.ts                  # Application entry point
├── test/                        # E2E tests
├── scripts/                     # Utility scripts
└── package.json
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 🔧 Development

```bash
# Development mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build

# Production mode
npm run start:prod
```

## 📦 Database

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Seed database
npm run seed
```

## 🔍 Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 🐳 Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

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

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Web Push
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@school.edu
```

## 📊 API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## 🔄 Workflow States

### Trip States
- DRAFT → SUBMITTED → PENDING_DEPARTMENT → PENDING_COLLEGE → PENDING_DEAN
- → APPROVED_FOR_ALLOCATION → CAR_ALLOCATED → PENDING_TRANSPORT_CONFIRM
- → READY → IN_PROGRESS → COMPLETED

### Rejection States
- REJECTED (manual rejection)
- AUTO_REJECTED_TIMEOUT (48-hour timeout)
- CANCELLED (user cancellation)

## 🎯 Key Features

- ✅ JWT Authentication with refresh tokens
- ✅ Role-based access control (9 roles)
- ✅ Configurable workflow engine
- ✅ 48-hour timeout with auto-rejection
- ✅ Real-time GPS tracking (WebSocket)
- ✅ Web Push notifications
- ✅ Complete audit trail
- ✅ Comprehensive reporting
- ✅ Event-driven architecture

## 📈 Monitoring

- Health check: `GET /health`
- Metrics: `GET /metrics`
- Prometheus integration
- Grafana dashboards
- Sentry error tracking

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

MIT License

## 📧 Support

For support and questions:
- Documentation: [/docs](./docs)
- Email: support@school.edu
- Issues: GitHub Issues

---

**Built with NestJS and TypeScript**
