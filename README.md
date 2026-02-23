# Fleet Management System

A production-grade Fleet Management System for school transportation with strict RBAC, workflow automation, real-time GPS tracking, and comprehensive audit trails.

## 🚀 Features

- **Role-Based Access Control (RBAC)**: 9 distinct roles with granular permissions
- **Configurable Workflow Engine**: Automated approval flows for Normal and VIP trips
- **48-Hour Timeout System**: Auto-rejection with scheduled jobs and warning notifications
- **Real-time GPS Tracking**: WebSocket-based tracking with offline buffering
- **Plate Scanner Integration**: Vehicle validation before gate opens
- **Maintenance Management**: Complete workflow from request to completion
- **Comprehensive Reporting**: Fuel consumption, trip statistics, driver performance, VIP usage
- **Web Push Notifications**: Real-time updates for all stakeholders
- **Full Audit Trail**: Complete logging of all system operations
- **Event-Driven Architecture**: Scalable and maintainable design

## 📋 Documentation

- [Architecture Overview](./ARCHITECTURE.md) - System design and technical architecture
- [Database Schema](./DATABASE_SCHEMA.md) - Complete database design with TypeORM entities
- [API Contracts](./API_CONTRACTS.md) - REST and WebSocket API documentation
- [Workflow Engine](./WORKFLOW_ENGINE.md) - Workflow system design and implementation
- [Module Structure](./MODULE_STRUCTURE.md) - NestJS project organization
- [Implementation Plan](./plan.md) - 16-week development roadmap
- [Quick Start Guide](./QUICKSTART.md) - Setup and installation instructions

## 🛠️ Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15.x
- **ORM**: TypeORM 0.3.x
- **Cache/Queue**: Redis 7.x + Bull
- **WebSocket**: Socket.io 4.x
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI

## 🚦 Quick Start

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

For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md).

## 👥 User Roles

1. **User** - Submit trip requests
2. **Department Head** - Approve department-level requests
3. **College Head** - Approve college-level requests
4. **Dean** - Final approval, initiate VIP requests
5. **Deployment Team** - Allocate vehicles and drivers
6. **Transport Office** - Manage fuel and final confirmation
7. **Maintenance Team** - Handle vehicle maintenance
8. **Driver** - Execute trips, submit maintenance requests
9. **Developer** - Super-admin with full system access

## 🔄 Workflow

### Normal Trip Flow
```
User Request → Department Approval (48h) → College Approval (48h) → 
Dean Approval (48h) → Vehicle Allocation → Transport Confirmation → 
Trip Execution → Completion
```

### VIP Trip Flow
```
President Request → Dean Approval (48h) → Vehicle Allocation → 
Transport Confirmation → Trip Execution → Completion
```

## 📊 Key Business Rules

- Minimum 48-hour advance booking required
- 48-hour timeout per approval level with auto-reject
- Only available vehicles can be allocated (no conflicts, not under maintenance)
- Plate validation required before trip start
- Real-time GPS tracking during trip
- Complete fuel and cost tracking
- Full audit trail for all operations

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Docker deployment
docker-compose up -d

# Kubernetes deployment
kubectl apply -f k8s/
```

## 🔐 Security

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting
- HTTPS only in production
- Audit logging for all operations
- Password hashing with bcrypt

## 📈 Monitoring

- Health check endpoint: `/health`
- Metrics endpoint: `/metrics`
- Prometheus + Grafana integration
- Error tracking with Sentry
- Comprehensive logging with Winston

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For support and questions, please contact:
- Email: support@school.edu
- Documentation: [/docs](./docs)
- Issues: GitHub Issues

## 🗺️ Roadmap

See [plan.md](./plan.md) for the complete 16-week implementation roadmap.

### Phase 1: Foundation (Week 1-2)
- ✅ Project setup and configuration
- ✅ Authentication and authorization
- ✅ User and organization management

### Phase 2: Core Business Logic (Week 3-5)
- 🔄 Vehicle and driver management
- 🔄 Workflow engine implementation
- 🔄 Trip request system

### Phase 3-9: Advanced Features
- Approval and allocation system
- Real-time tracking
- Maintenance and fuel management
- Reporting and analytics
- Testing and deployment

---

**Built with ❤️ for efficient school transportation management**
