fleet-management-backend/
├── src/
│   ├── auth/                           # Authentication & Authorization Module
│   │   ├── dto/                        # Data Transfer Objects for validation
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── guards/                     # Route protection (JWT, Roles)
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/                 # Passport strategies (e.g., JWT)
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts          # Handles HTTP requests for login/register
│   │   ├── auth.module.ts              # Registers auth-related providers
│   │   └── auth.service.ts             # Business logic for auth (e.g., password hashing)
│   │
│   ├── common/                         # Shared utilities across modules
│   │   ├── decorators/                 # Custom decorators (e.g., @Roles)
│   │   ├── filters/                    # Exception filters (e.g., for global error handling)
│   │   ├── interceptors/               # Interceptors (e.g., for logging, data transformation)
│   │   └── pipes/                      # Custom pipes (e.g., for validation)
│   │
│   ├── config/                         # Configuration management
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   │
│   ├── database/                       # Database related files
│   │   ├── migrations/                 # TypeORM migration files
│   │   └── seeds/                      # Database seeders (for initial data)
│   │
│   ├── fleet/                          # Fleet Management Module (Vehicles, Drivers)
│   │   ├── controllers/
│   │   │   ├── driver.controller.ts
│   │   │   └── vehicle.controller.ts
│   │   ├── dto/
│   │   │   ├── create-driver.dto.ts
│   │   │   ├── create-vehicle.dto.ts
│   │   │   └── update-vehicle.dto.ts
│   │   ├── entities/                   # TypeORM database entities
│   │   │   ├── driver.entity.ts
│   │   │   └── vehicle.entity.ts
│   │   ├── interfaces/                 # TypeScript interfaces
│   │   ├── fleet.module.ts
│   │   └── services/
│   │       ├── driver.service.ts
│   │       └── vehicle.service.ts
│   │
│   ├── fuel/                           # Fuel Management Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── fuel-record.entity.ts
│   │   ├── fuel.module.ts
│   │   └── services/
│   │
│   ├── gps/                            # GPS Tracking Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── gps-location.entity.ts
│   │   ├── gps.gateway.ts              # WebSocket gateway for real-time tracking
│   │   ├── gps.module.ts
│   │   └── services/
│   │
│   ├── maintenance/                    # Maintenance Management Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── maintenance-record.entity.ts
│   │   ├── maintenance.module.ts
│   │   └── services/
│   │
│   ├── notification/                   # Notification Module (Email, SMS, Push)
│   │   ├── controllers/
│   │   ├── notification.module.ts
│   │   └── services/
│   │
│   ├── report/                         # Reporting & Analytics Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── report.module.ts
│   │   └── services/
│   │
│   ├── trip/                           # Trip Management Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── trip.entity.ts
│   │   │   └── trip-approval.entity.ts
│   │   ├── trip.module.ts
│   │   └── services/
│   │
│   ├── upload/                         # File Upload Module (for documents)
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── document.entity.ts
│   │   ├── upload.module.ts
│   │   └── services/
│   │
│   ├── user/                           # User Management Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── role.entity.ts
│   │   ├── user.module.ts
│   │   └── services/
│   │
│   ├── app.controller.ts               # Root controller (e.g., for health check)
│   ├── app.module.ts                   # Root application module
│   └── main.ts                         # Application entry point
│
├── test/                               # End-to-end and integration tests
│
├── .env.example                        # Example environment variables
├── .gitignore
├── nest-cli.json                       # NestJS CLI configuration
├── package.json
├── tsconfig.build.json
├── tsconfig.json
└── README.md
