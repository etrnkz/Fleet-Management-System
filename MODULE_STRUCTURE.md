# NestJS Module Structure

## Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── app.controller.ts                # Health check endpoint
├── app.service.ts                   # App-level services
│
├── auth/                            # Authentication & Authorization
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── refresh-token.dto.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permissions.guard.ts
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   ├── permissions.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   └── interfaces/
│       └── jwt-payload.interface.ts
│
├── users/                           # User Management
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user-response.dto.ts
│   └── enums/
│       └── user-role.enum.ts
│
├── departments/                     # Department Management
│   ├── departments.module.ts
│   ├── departments.controller.ts
│   ├── departments.service.ts
│   ├── entities/
│   │   └── department.entity.ts
│   └── dto/
│       ├── create-department.dto.ts
│       └── update-department.dto.ts
│
├── colleges/                        # College Management
│   ├── colleges.module.ts
│   ├── colleges.controller.ts
│   ├── colleges.service.ts
│   ├── entities/
│   │   └── college.entity.ts
│   └── dto/
│       ├── create-college.dto.ts
│       └── update-college.dto.ts
│
├── vehicles/                        # Vehicle Management
│   ├── vehicles.module.ts
│   ├── vehicles.controller.ts
│   ├── vehicles.service.ts
│   ├── entities/
│   │   └── vehicle.entity.ts
│   ├── dto/
│   │   ├── create-vehicle.dto.ts
│   │   ├── update-vehicle.dto.ts
│   │   └── vehicle-availability.dto.ts
│   └── enums/
│       ├── vehicle-status.enum.ts
│       └── fuel-type.enum.ts
│
├── drivers/                         # Driver Management
│   ├── drivers.module.ts
│   ├── drivers.controller.ts
│   ├── drivers.service.ts
│   ├── entities/
│   │   └── driver.entity.ts
│   ├── dto/
│   │   ├── create-driver.dto.ts
│   │   └── update-driver.dto.ts
│   └── enums/
│       └── driver-status.enum.ts
│
├── trips/                           # Trip Request Management
│   ├── trips.module.ts
│   ├── trips.controller.ts
│   ├── trips.service.ts
│   ├── entities/
│   │   ├── trip-request.entity.ts
│   │   └── approval.entity.ts
│   ├── dto/
│   │   ├── create-trip.dto.ts
│   │   ├── update-trip.dto.ts
│   │   ├── submit-trip.dto.ts
│   │   ├── approve-trip.dto.ts
│   │   ├── reject-trip.dto.ts
│   │   ├── allocate-trip.dto.ts
│   │   ├── start-trip.dto.ts
│   │   └── complete-trip.dto.ts
│   └── enums/
│       ├── trip-state.enum.ts
│       ├── trip-type.enum.ts
│       ├── approval-level.enum.ts
│       └── approval-status.enum.ts
│
├── workflow/                        # Workflow Engine
│   ├── workflow.module.ts
│   ├── workflow.service.ts
│   ├── workflow.processor.ts
│   ├── entities/
│   │   └── workflow-configuration.entity.ts
│   ├── dto/
│   │   ├── create-workflow.dto.ts
│   │   └── update-workflow.dto.ts
│   ├── interfaces/
│   │   ├── workflow-step.interface.ts
│   │   ├── workflow-action.interface.ts
│   │   └── workflow-condition.interface.ts
│   ├── validators/
│   │   └── state-transition.validator.ts
│   └── listeners/
│       └── trip-event.listener.ts
│
├── deployment/                      # Vehicle & Driver Allocation
│   ├── deployment.module.ts
│   ├── deployment.controller.ts
│   ├── deployment.service.ts
│   └── dto/
│       └── allocate-resources.dto.ts
│
├── transport/                       # Transport Office Operations
│   ├── transport.module.ts
│   ├── transport.controller.ts
│   ├── transport.service.ts
│   └── dto/
│       └── confirm-transport.dto.ts
│
├── maintenance/                     # Maintenance Management
│   ├── maintenance.module.ts
│   ├── maintenance.controller.ts
│   ├── maintenance.service.ts
│   ├── entities/
│   │   └── maintenance-request.entity.ts
│   ├── dto/
│   │   ├── create-maintenance.dto.ts
│   │   ├── inspect-maintenance.dto.ts
│   │   ├── approve-budget.dto.ts
│   │   └── complete-maintenance.dto.ts
│   └── enums/
│       ├── maintenance-status.enum.ts
│       └── maintenance-priority.enum.ts
│
├── fuel/                            # Fuel Management
│   ├── fuel.module.ts
│   ├── fuel.controller.ts
│   ├── fuel.service.ts
│   ├── entities/
│   │   └── fuel-record.entity.ts
│   └── dto/
│       └── create-fuel-record.dto.ts
│
├── tracking/                        # GPS Tracking
│   ├── tracking.module.ts
│   ├── tracking.gateway.ts
│   ├── tracking.service.ts
│   ├── tracking.controller.ts
│   ├── entities/
│   │   └── trip-tracking.entity.ts
│   └── dto/
│       ├── location-update.dto.ts
│       └── sync-offline.dto.ts
│
├── notifications/                   # Notification System
│   ├── notifications.module.ts
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   ├── entities/
│   │   └── notification.entity.ts
│   ├── dto/
│   │   └── create-notification.dto.ts
│   ├── templates/
│   │   ├── trip-approved.template.ts
│   │   ├── trip-rejected.template.ts
│   │   └── timeout-warning.template.ts
│   └── enums/
│       └── notification-type.enum.ts
│
├── reports/                         # Reporting & Analytics
│   ├── reports.module.ts
│   ├── reports.controller.ts
│   ├── reports.service.ts
│   ├── dto/
│   │   ├── fuel-report.dto.ts
│   │   ├── trip-report.dto.ts
│   │   ├── maintenance-report.dto.ts
│   │   └── driver-performance.dto.ts
│   └── generators/
│       ├── pdf.generator.ts
│       └── csv.generator.ts
│
├── audit/                           # Audit Logging
│   ├── audit.module.ts
│   ├── audit.service.ts
│   ├── audit.controller.ts
│   ├── entities/
│   │   └── audit-log.entity.ts
│   ├── interceptors/
│   │   └── audit.interceptor.ts
│   └── enums/
│       └── audit-action.enum.ts
│
├── scheduler/                       # Scheduled Jobs
│   ├── scheduler.module.ts
│   ├── processors/
│   │   ├── timeout.processor.ts
│   │   └── maintenance-reminder.processor.ts
│   └── services/
│       └── queue.service.ts
│
├── integrations/                    # External Integrations
│   ├── integrations.module.ts
│   ├── gps/
│   │   ├── gps.service.ts
│   │   └── gps.interface.ts
│   └── scanner/
│       ├── scanner.service.ts
│       └── scanner.interface.ts
│
├── config/                          # Configuration
│   ├── configuration.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── validation.schema.ts
│
├── common/                          # Shared Utilities
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   ├── logging.interceptor.ts
│   │   └── timeout.interceptor.ts
│   ├── pipes/
│   │   ├── validation.pipe.ts
│   │   └── parse-uuid.pipe.ts
│   ├── decorators/
│   │   ├── api-paginated-response.decorator.ts
│   │   └── is-before-date.decorator.ts
│   ├── guards/
│   │   └── throttle.guard.ts
│   ├── middleware/
│   │   ├── logger.middleware.ts
│   │   └── correlation-id.middleware.ts
│   ├── dto/
│   │   ├── pagination.dto.ts
│   │   └── response.dto.ts
│   ├── interfaces/
│   │   ├── paginated-result.interface.ts
│   │   └── response.interface.ts
│   └── utils/
│       ├── date.util.ts
│       ├── string.util.ts
│       └── number.util.ts
│
└── database/                        # Database
    ├── migrations/
    ├── seeds/
    └── data-source.ts
```

## Module Dependencies

```typescript
// app.module.ts
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validationSchema,
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('database.synchronize'),
        logging: config.get('database.logging'),
      }),
      inject: [ConfigService],
    }),
    
    // Redis & Queue
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    
    // Event Emitter
    EventEmitterModule.forRoot(),
    
    // Throttling
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    
    // Feature Modules
    AuthModule,
    UsersModule,
    DepartmentsModule,
    CollegesModule,
    VehiclesModule,
    DriversModule,
    TripsModule,
    WorkflowModule,
    DeploymentModule,
    TransportModule,
    MaintenanceModule,
    FuelModule,
    TrackingModule,
    NotificationsModule,
    ReportsModule,
    AuditModule,
    SchedulerModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
```

## Module Relationships

### Core Dependencies
- **Auth** → Users
- **Users** → Departments, Colleges
- **Trips** → Users, Vehicles, Drivers, Workflow
- **Workflow** → Trips, Notifications
- **Deployment** → Trips, Vehicles, Drivers
- **Transport** → Trips, Fuel
- **Maintenance** → Vehicles, Users
- **Tracking** → Trips
- **Reports** → Trips, Vehicles, Drivers, Fuel, Maintenance
- **Audit** → All modules (via interceptor)

### Shared Modules
- **Config**: Global configuration
- **Common**: Shared utilities, filters, interceptors
- **Notifications**: Used by Workflow, Trips, Maintenance

## Key Design Patterns

### 1. Repository Pattern
```typescript
@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(TripRequest)
    private readonly tripRepo: Repository<TripRequest>,
  ) {}
}
```

### 2. Service Layer Pattern
```typescript
// Separation of concerns
- Controller: HTTP handling, validation
- Service: Business logic
- Repository: Data access
```

### 3. Event-Driven Pattern
```typescript
// Emit events
this.eventEmitter.emit('trip.approved', payload);

// Listen to events
@OnEvent('trip.approved')
async handleTripApproved(payload) {}
```

### 4. Strategy Pattern
```typescript
// Different workflows for Normal and VIP trips
interface WorkflowStrategy {
  execute(trip: TripRequest): Promise<void>;
}
```

### 5. Factory Pattern
```typescript
// Create different notification types
class NotificationFactory {
  create(type: NotificationType): Notification {}
}
```

## Testing Structure

```
test/
├── unit/
│   ├── auth/
│   ├── trips/
│   ├── workflow/
│   └── ...
├── integration/
│   ├── trips.integration.spec.ts
│   ├── workflow.integration.spec.ts
│   └── ...
├── e2e/
│   ├── trip-lifecycle.e2e-spec.ts
│   ├── approval-flow.e2e-spec.ts
│   └── ...
└── fixtures/
    ├── users.fixture.ts
    ├── trips.fixture.ts
    └── ...
```

## Environment Configuration

```
.env.development
.env.production
.env.test
```

## Build & Deployment

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Docker
docker-compose up -d

# Kubernetes
kubectl apply -f k8s/
```
