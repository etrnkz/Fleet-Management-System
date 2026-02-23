# Database Schema Design

## Entity Relationship Overview

```
Users ──┬── TripRequests (requester)
        ├── Approvals (approver)
        ├── MaintenanceRequests (driver)
        ├── Drivers (one-to-one)
        └── AuditLogs

Departments ── Users (head)
            └── Colleges

TripRequests ──┬── Approvals
               ├── Vehicles (allocated)
               ├── Drivers (allocated)
               ├── TripTracking
               └── FuelRecords

Vehicles ──┬── TripRequests
           ├── MaintenanceRequests
           └── FuelRecords

MaintenanceRequests ── Vehicles
```

## TypeORM Entities

### User Entity
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ManyToOne(() => Department, { nullable: true })
  department: Department;

  @ManyToOne(() => College, { nullable: true })
  college: College;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Driver, driver => driver.user)
  driverProfile: Driver;

  @OneToMany(() => TripRequest, trip => trip.requester)
  tripRequests: TripRequest[];
}
```

### Department Entity
```typescript
@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @ManyToOne(() => College, college => college.departments)
  college: College;

  @ManyToOne(() => User)
  head: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### College Entity

```typescript
@Entity('colleges')
export class College {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @ManyToOne(() => User)
  head: User;

  @OneToMany(() => Department, dept => dept.college)
  departments: Department[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Vehicle Entity
```typescript
@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  plateNumber: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  capacity: number;

  @Column({ type: 'enum', enum: FuelType })
  fuelType: FuelType;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.Active })
  status: VehicleStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentMileage: number;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TripRequest, trip => trip.allocatedVehicle)
  trips: TripRequest[];

  @OneToMany(() => MaintenanceRequest, maintenance => maintenance.vehicle)
  maintenanceRequests: MaintenanceRequest[];
}
```

### Driver Entity
```typescript
@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.driverProfile)
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  licenseNumber: string;

  @Column({ type: 'date' })
  licenseExpiry: Date;

  @Column()
  experienceYears: number;

  @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.Available })
  status: DriverStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TripRequest, trip => trip.allocatedDriver)
  trips: TripRequest[];
}
```

### TripRequest Entity
```typescript
@Entity('trip_requests')
export class TripRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  requestNumber: string;

  @ManyToOne(() => User, user => user.tripRequests)
  requester: User;

  @Column({ type: 'enum', enum: TripType })
  tripType: TripType;

  @Column({ type: 'text' })
  purpose: string;

  @Column()
  destination: string;

  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @Column({ type: 'timestamp' })
  endDateTime: Date;

  @Column()
  passengerCount: number;

  @Column({ type: 'enum', enum: TripState, default: TripState.DRAFT })
  state: TripState;

  @Column({ nullable: true })
  currentApprovalLevel: string;

  @ManyToOne(() => Vehicle, { nullable: true })
  allocatedVehicle: Vehicle;

  @ManyToOne(() => Driver, { nullable: true })
  allocatedDriver: Driver;

  @ManyToOne(() => User, { nullable: true })
  deploymentTeamMember: User;

  @ManyToOne(() => User, { nullable: true })
  transportOfficer: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedFuelCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualFuelCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedDistance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDistance: number;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @ManyToOne(() => User, { nullable: true })
  rejectedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Approval, approval => approval.tripRequest, { cascade: true })
  approvals: Approval[];

  @OneToMany(() => TripTracking, tracking => tracking.tripRequest)
  trackingData: TripTracking[];

  @OneToMany(() => FuelRecord, fuel => fuel.tripRequest)
  fuelRecords: FuelRecord[];
}
```

### Approval Entity
```typescript
@Entity('approvals')
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TripRequest, trip => trip.approvals)
  tripRequest: TripRequest;

  @ManyToOne(() => User)
  approver: User;

  @Column({ type: 'enum', enum: ApprovalLevel })
  approvalLevel: ApprovalLevel;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.Pending })
  status: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### TripTracking Entity
```typescript
@Entity('trip_tracking')
export class TripTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TripRequest, trip => trip.trackingData)
  tripRequest: TripRequest;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  speed: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  heading: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  accuracy: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ default: false })
  isOfflineSync: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

### MaintenanceRequest Entity
```typescript
@Entity('maintenance_requests')
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  requestNumber: string;

  @ManyToOne(() => Vehicle, vehicle => vehicle.maintenanceRequests)
  vehicle: Vehicle;

  @ManyToOne(() => User)
  requestedBy: User;

  @Column({ type: 'text' })
  issueDescription: string;

  @Column({ type: 'enum', enum: MaintenancePriority })
  priority: MaintenancePriority;

  @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.Submitted })
  status: MaintenanceStatus;

  @ManyToOne(() => User, { nullable: true })
  inspectedBy: User;

  @Column({ type: 'text', nullable: true })
  inspectionNotes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @ManyToOne(() => User, { nullable: true })
  approvedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### FuelRecord Entity
```typescript
@Entity('fuel_records')
export class FuelRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TripRequest, { nullable: true })
  tripRequest: TripRequest;

  @ManyToOne(() => Vehicle)
  vehicle: Vehicle;

  @Column({ type: 'enum', enum: FuelType })
  fuelType: FuelType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costPerUnit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @ManyToOne(() => User)
  recordedBy: User;

  @Column({ type: 'timestamp' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

### AuditLog Entity
```typescript
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column()
  entityType: string;

  @Column('uuid')
  entityId: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: any;

  @Column({ type: 'jsonb', nullable: true })
  newValue: any;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
```

### WorkflowConfiguration Entity
```typescript
@Entity('workflow_configurations')
export class WorkflowConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: TripType })
  tripType: TripType;

  @Column({ type: 'jsonb' })
  steps: any;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Notification Entity
```typescript
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

## Enums

```typescript
export enum UserRole {
  User = 'User',
  DepartmentHead = 'DepartmentHead',
  CollegeHead = 'CollegeHead',
  Dean = 'Dean',
  DeploymentTeam = 'DeploymentTeam',
  TransportOffice = 'TransportOffice',
  MaintenanceTeam = 'MaintenanceTeam',
  Driver = 'Driver',
  Developer = 'Developer'
}

export enum TripType {
  Normal = 'Normal',
  VIP = 'VIP'
}

export enum TripState {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_DEPARTMENT = 'PENDING_DEPARTMENT',
  PENDING_COLLEGE = 'PENDING_COLLEGE',
  PENDING_DEAN = 'PENDING_DEAN',
  REJECTED = 'REJECTED',
  AUTO_REJECTED_TIMEOUT = 'AUTO_REJECTED_TIMEOUT',
  APPROVED_FOR_ALLOCATION = 'APPROVED_FOR_ALLOCATION',
  CAR_ALLOCATED = 'CAR_ALLOCATED',
  PENDING_TRANSPORT_CONFIRM = 'PENDING_TRANSPORT_CONFIRM',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ApprovalLevel {
  Department = 'Department',
  College = 'College',
  Dean = 'Dean',
  Deployment = 'Deployment',
  Transport = 'Transport'
}

export enum ApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  AutoRejectedTimeout = 'AutoRejectedTimeout'
}

export enum VehicleStatus {
  Active = 'Active',
  UnderMaintenance = 'UnderMaintenance',
  Inactive = 'Inactive'
}

export enum DriverStatus {
  Available = 'Available',
  OnTrip = 'OnTrip',
  OnLeave = 'OnLeave',
  Inactive = 'Inactive'
}

export enum FuelType {
  Petrol = 'Petrol',
  Diesel = 'Diesel',
  Electric = 'Electric'
}

export enum MaintenancePriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum MaintenanceStatus {
  Submitted = 'Submitted',
  UnderInspection = 'UnderInspection',
  EstimateProvided = 'EstimateProvided',
  BudgetApproved = 'BudgetApproved',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Rejected = 'Rejected'
}

export enum AuditAction {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  Approve = 'Approve',
  Reject = 'Reject',
  Allocate = 'Allocate',
  Start = 'Start',
  Complete = 'Complete',
  Cancel = 'Cancel'
}

export enum NotificationType {
  TripSubmitted = 'TripSubmitted',
  TripApproved = 'TripApproved',
  TripRejected = 'TripRejected',
  TripAutoRejected = 'TripAutoRejected',
  TimeoutWarning = 'TimeoutWarning',
  VehicleAllocated = 'VehicleAllocated',
  TripReady = 'TripReady',
  TripStarted = 'TripStarted',
  TripCompleted = 'TripCompleted',
  MaintenanceRequested = 'MaintenanceRequested',
  MaintenanceApproved = 'MaintenanceApproved'
}
```

## Indexes

```typescript
// Users
@Index(['email'])
@Index(['role'])
@Index(['departmentId'])
@Index(['collegeId'])

// TripRequests
@Index(['requestNumber'])
@Index(['requesterId'])
@Index(['state'])
@Index(['startDateTime', 'endDateTime'])
@Index(['allocatedVehicleId'])
@Index(['allocatedDriverId'])

// Vehicles
@Index(['plateNumber'])
@Index(['status'])

// Approvals
@Index(['tripRequestId'])
@Index(['approverId'])
@Index(['status'])
@Index(['dueDate'])

// TripTracking
@Index(['tripRequestId'])
@Index(['timestamp'])

// AuditLogs
@Index(['entityType', 'entityId'])
@Index(['userId'])
@Index(['timestamp'])
```
