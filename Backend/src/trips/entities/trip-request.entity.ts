import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Approval } from './approval.entity';

export enum TripType {
  Normal = 'Normal',
  VIP = 'VIP',
}

export enum TripCategory {
  STANDARD = 'STANDARD',
  VIP = 'VIP',
  SERVICE = 'SERVICE',
}

export enum TripState {
  DRAFT = 'DRAFT',
  PENDING_DEPARTMENT = 'PENDING_DEPARTMENT',
  PENDING_COLLEGE = 'PENDING_COLLEGE',
  PENDING_PRESIDENT = 'PENDING_PRESIDENT',
  REJECTED = 'REJECTED',
  AUTO_REJECTED_TIMEOUT = 'AUTO_REJECTED_TIMEOUT',
  APPROVED_FOR_ALLOCATION = 'APPROVED_FOR_ALLOCATION',
  CAR_ALLOCATED = 'CAR_ALLOCATED',
  PENDING_TRANSPORT_CONFIRM = 'PENDING_TRANSPORT_CONFIRM',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_RETURN = 'PENDING_RETURN',  // Employee marked complete, waiting for gate scan on return
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/** Trips in these states still hold allocatedVehicle / allocatedDriver (not released). */
export const TRIP_STATES_HOLDING_ALLOCATION: TripState[] = [
  TripState.CAR_ALLOCATED,
  TripState.PENDING_TRANSPORT_CONFIRM,
  TripState.READY,
  TripState.IN_PROGRESS,
  TripState.PENDING_RETURN,
];

@Entity('trip_requests')
@Index(['state'])
@Index(['createdAt'])
export class TripRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  requestNumber: string;

  @ManyToOne(() => User)
  requester: User;

  @Column()
  tripType: TripType;

  @Column({ type: 'varchar', default: TripCategory.STANDARD })
  tripCategory: TripCategory;

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

  @Column({ default: TripState.DRAFT })
  state: TripState;

  @Column({ type: 'varchar', nullable: true })
  currentApprovalLevel: string | null;

  @ManyToOne(() => Vehicle, { nullable: true })
  allocatedVehicle: Vehicle | null;

  @ManyToOne(() => Driver, { nullable: true })
  allocatedDriver: Driver | null;

  @ManyToOne(() => User, { nullable: true })
  deploymentTeamMember: User | null;

  @ManyToOne(() => User, { nullable: true })
  transportOfficer: User | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedFuelCost: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualFuelCost: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedDistance: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDistance: number | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @ManyToOne(() => User, { nullable: true })
  rejectedBy: User | null;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => Approval, (approval) => approval.tripRequest, {
    cascade: true,
  })
  approvals: Approval[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
