import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Approval } from './approval.entity';

export enum TripType {
  Normal = 'Normal',
  VIP = 'VIP',
}

export enum TripState {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_DEPARTMENT = 'PENDING_DEPARTMENT',
  PENDING_COLLEGE = 'PENDING_COLLEGE',
  PENDING_DEAN = 'PENDING_DEAN',
  PENDING_PRESIDENT = 'PENDING_PRESIDENT',
  REJECTED = 'REJECTED',
  AUTO_REJECTED_TIMEOUT = 'AUTO_REJECTED_TIMEOUT',
  APPROVED_FOR_ALLOCATION = 'APPROVED_FOR_ALLOCATION',
  CAR_ALLOCATED = 'CAR_ALLOCATED',
  PENDING_TRANSPORT_CONFIRM = 'PENDING_TRANSPORT_CONFIRM',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('trip_requests')
export class TripRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  requestNumber: string;

  @ManyToOne(() => User)
  requester: User;

  @Column()
  tripType: TripType;

  @Column({ type: 'text' })
  purpose: string;

  @Column()
  destination: string;

  @Column({ type: 'datetime' })
  startDateTime: Date;

  @Column({ type: 'datetime' })
  endDateTime: Date;

  @Column()
  passengerCount: number;

  @Column({ default: TripState.DRAFT })
  state: TripState;

  @Column({ type: 'varchar', nullable: true })
  currentApprovalLevel: string | null;

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

  @Column({ type: 'datetime', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @OneToMany(() => Approval, (approval) => approval.tripRequest, {
    cascade: true,
  })
  approvals: Approval[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
