
### Backend Development Guide - Fleet Management System


**Tech Stack:**
*   **Framework:** NestJS
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** TypeORM
*   **Authentication:** JWT (JSON Web Tokens)
*   **Real-time:** WebSockets (for GPS tracking)
*   **Validation:** Class-validator & Class-transformer

---

### Backend Folder Structure

```
fleet-management-backend/
├── src/
│   ├── auth/                           # Authentication & Authorization Module
│   │   ├── dto/                        # Data Transfer Objects for validation
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
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
```

---

### Team & Workflow

**Developers:**
*   etrnkz
*   Lemi

**Our Workflow:**
1.  **Weekly Sprints:** We work in one-week sprints. Each developer is assigned specific modules to complete.
2.  **Branching:** For each task, create a new feature branch from `develop`. Name it `feature/your-name-description` (e.g., `feature/etrnkz-vehicle-entity`).
3.  **Daily Stand-ups:** Briefly share what you did yesterday, what you'll do today, and any blockers.
4.  **Code Review:** Before merging into `develop`, create a Pull Request. The other team member must review and approve it.
5.  **End of Week:** On Friday, we merge all completed features into `develop` and prepare for the next week's assignments.

---

### Week-by-Week Task Breakdown

#### **Week 1: Foundation & Authentication**

**Goal:** Set up the project and implement the core security and data models.

| Assigned To | Task | Modules/Files to Create | Details |
| :--- | :--- | :--- | :--- |
| **etrnkz** | User & Role Data Models | `src/user/` | Create `User` and `Role` entities. Implement full CRUD controllers and services for managing users and their roles. |
| **Lemi** | Authentication Module | `src/auth/` | Implement JWT strategy, guards (`JwtAuthGuard`, `RolesGuard`), and the `auth.controller`/`service` for login and registration. |

---

#### **Week 2: Core Fleet - Vehicles & Drivers**

**Goal:** Build the APIs for the primary assets of the fleet.

| Assigned To | Task | Modules/Files to Create | Details |
| :--- | :--- | :--- | :--- |
| **etrnkz** | Vehicle Management | `src/fleet/` (Vehicle) | Create the `Vehicle` entity. Implement controller, service, and DTOs for all vehicle CRUD operations. |
| **Lemi** | Driver Management | `src/fleet/` (Driver) | Create the `Driver` entity. Implement controller, service, and DTOs for all driver CRUD operations. |

---

#### **Week 3: Trip Management Logic**

**Goal:** Implement the core business logic for scheduling and managing trips.

| Assigned To | Task | Modules/Files to Create | Details |
| :--- | :--- | :--- | :--- |
| **etrnkz** | Trip Data Model | `src/trip/entities/` | Design and create the `Trip` entity, establishing complex relationships with `User`, `Vehicle`, and `Driver`. |
| **Lemi** | Trip API & Logic | `src/trip/` | Implement the `trip.controller` and `trip.service` to handle creating trips, approving them, and updating their status (e.g., 'Approved', 'In Progress', 'Completed'). |

---

#### **Week 4: Logging & History - Fuel & Maintenance**

**Goal:** Create modules to track operational history and costs.

| Assigned To | Task | Modules/Files to Create | Details |
| :--- | :--- | :--- | :--- |
| **etrnkz** | Fuel Management | `src/fuel/` | Create the `FuelRecord` entity. Implement APIs to log fuel intake and retrieve fuel history for a specific vehicle. |
| **Lemi** | Maintenance Management | `src/maintenance/` | Create the `MaintenanceRecord` entity. Implement APIs to log maintenance services, costs, and retrieve maintenance history. |

---

#### **Week 5: Real-time & Reporting**

**Goal:** Implement the most advanced features: live tracking and data analytics.

| Assigned To | Task | Modules/Files to Create | Details |
| :--- | :--- | :--- | :--- |
| **etrnkz** | Real-time GPS Tracking | `src/gps/` | Implement the `gps.gateway.ts` using NestJS WebSockets. Create an endpoint for the mobile app to send location data and broadcast it to connected clients. |
| **Lemi** | Reporting & Analytics | `src/report/` | Create the `report.controller` and `report.service`. Write complex queries to aggregate data (e.g., fuel efficiency, vehicle utilization) and provide it as structured JSON for the frontend. |

---

#### **Week 6: Final Touches & Polish**

**Goal:** Add remaining features and ensure the system is robust and production-ready.

| Assigned To | Task | Modules/Files to Create | Details |
| :--- | :--- | :--- | :--- |
| **etrnkz** | Document Management | `src/upload/` | Implement the `upload.controller` and `service` to handle file uploads (e.g., for insurance documents), save them to storage, and manage metadata in the database. |
| **Lemi** | Validation & Error Handling | `src/common/`<br>All `dto/` folders | Add comprehensive validation rules to all DTOs. Implement a global exception filter to handle errors gracefully and consistently. Write unit tests for at least 2 critical services. |

---

#### Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd fleet-management-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Copy `.env.example` to `.env`.
    *   Fill in your database credentials, JWT secret, and other configuration values.

4.  **Set up the database:**
    *   Ensure your PostgreSQL server is running.
    *   Run database migrations to create the tables:
        ```bash
        npm run migration:run
        ```

5.  **Run the development server:**
    ```bash
    npm run start:dev
    ```

6.  **Test the API:**
    *   The API will be running at `http://localhost:3000`.
    *   You can use a tool like Postman or Insomnia to test the endpoints.

---

