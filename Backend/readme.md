# Fleet Management Backend Structure

```text
fleet-management-backend/
├── src/
│   ├── auth/                          # Authentication & Authorization Module
│   │   ├── dto/                       # Data Transfer Objects for validation
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── guards/                    # Route protection (JWT, Roles)
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/                # Passport strategies (e.g., JWT)
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts         # Handles HTTP requests for login/register
│   │   ├── auth.module.ts             # Registers auth-related providers
│   │   └── auth.service.ts            # Business logic for auth (e.g., password hashing)
│   │
│   ├── common/                        # Shared utilities across modules
│   │   ├── decorators/                # Custom decorators (e.g., @Roles)
│   │   ├── filters/                   # Exception filters (global error handling)
│   │   ├── interceptors/              # Interceptors (logging, transformation)
│   │   └── pipes/                     # Custom pipes (validation)
│   │
│   ├── config/                        # Configuration management
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   │
│   ├── database/                      # Database related files
│   │   ├── migrations/                # TypeORM migrations
│   │   └── seeds/                     # Database seeders
│   │
│   ├── fleet/                         # Fleet Management Module
│   │   ├── controllers/
│   │   │   ├── driver.controller.ts
│   │   │   └── vehicle.controller.ts
│   │   ├── dto/
│   │   │   ├── create-driver.dto.ts
│   │   │   ├── create-vehicle.dto.ts
│   │   │   └── update-vehicle.dto.ts
│   │   ├── entities/
│   │   │   ├── driver.entity.ts
│   │   │   └── vehicle.entity.ts
│   │   ├── interfaces/
│   │   ├── fleet.module.ts
│   │   └── services/
│   │       ├── driver.service.ts
│   │       └── vehicle.service.ts
│   │
│   ├── fuel/                          # Fuel Management Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── fuel-record.entity.ts
│   │   ├── fuel.module.ts
│   │   └── services/
│   │
│   ├── gps/                           # GPS Tracking Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── gps-location.entity.ts
│   │   ├── gps.gateway.ts             # WebSocket gateway
│   │   ├── gps.module.ts
│   │   └── services/
│   │
│   ├── maintenance/                   # Maintenance Management Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── maintenance-record.entity.ts
│   │   ├── maintenance.module.ts
│   │   └── services/
│   │
│   ├── notification/                  # Notification Module
│   │   ├── controllers/
│   │   ├── notification.module.ts
│   │   └── services/
│   │
│   ├── report/                        # Reporting & Analytics Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── report.module.ts
│   │   └── services/
│   │
│   ├── trip/                          # Trip Management Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── trip.entity.ts
│   │   │   └── trip-approval.entity.ts
│   │   ├── trip.module.ts
│   │   └── services/
│   │
│   ├── upload/                        # File Upload Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── document.entity.ts
│   │   ├── upload.module.ts
│   │   └── services/
│   │
│   ├── user/                          # User Management Module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── role.entity.ts
│   │   ├── user.module.ts
│   │   └── services/
│   │
│   ├── app.controller.ts              # Root controller
│   ├── app.module.ts                  # Root module
│   └── main.ts                        # Application entry point
│
├── test/                              # E2E & integration tests
├── .env.example                       # Environment variables example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.build.json
├── tsconfig.json
└── README.md
```
