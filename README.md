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

## 📋 API documentation

With the Backend running locally, open **Swagger** at `http://localhost:3000/api/docs` (path may differ if `PORT` or global prefix is customized in your `.env`).

## 🛠️ Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15.x
- **ORM**: TypeORM 0.3.x
- **Cache/Queue**: Redis 7.x + Bull
- **WebSocket**: Socket.io 4.x
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI

## 📁 Project structure

```
Fleet-Management-System/
├── Backend/                 # NestJS API
├── Frontend/apps/           # Role-based Next.js apps (see app `package.json` for ports)
│   ├── transport-admin/     # Transport office / fleet administration (default :3001)
│   ├── college-dean/        # College dean approvals (default :3002)
│   ├── department/          # Department head (:3003)
│   ├── driver/              # Driver (:3004)
│   ├── deployment-office/   # Deployment team (:3005)
│   ├── president/           # President (:3006)
│   ├── system-admin/        # System administration (:3007)
│   └── employee/            # Staff / trip requesters (:3008)
├── .gitignore
└── README.md
```

## 🚦 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

```bash
# Navigate to backend directory
cd Backend

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

Visit `http://localhost:3000/api/docs` for interactive API documentation.

## 👥 Roles and portals

1. **User (Employee)** — Submit trip requests (`employee` app)
2. **Department Head** — Department-level approvals (`department` app)
3. **Dean (College Dean)** — College-level approvals; maps to API role `Dean` (`college-dean` app)
4. **President** — Executive approvals and oversight (`president` app)
5. **Deployment Team** — Vehicle and driver allocation (`deployment-office` app)
6. **Transport Office** — Fleet operations, fuel, transport confirmation (`transport-admin` app)
7. **Maintenance Team** — Vehicle maintenance workflows
8. **Driver** — Trip execution and field updates (`driver` app)
9. **Developer** — Technical full-access seed role for API administration
10. **System Admin** — Institution-wide users and configuration (`system-admin` app; separate from transport admin)

## 🔄 Workflow

### Normal trip flow
```
Trip request → Department head (48h) → College dean (48h) →
Deployment allocation → Transport office confirmation → Trip execution → Completion
```
(Timing and gates follow your workflow configuration.)

### VIP trip flow (illustrative)
```
Trip request → College dean (48h) → Deployment allocation →
Transport office confirmation → Trip execution → Completion
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
- Issues: GitHub Issues

---

**Built with ❤️ for efficient school transportation management**
