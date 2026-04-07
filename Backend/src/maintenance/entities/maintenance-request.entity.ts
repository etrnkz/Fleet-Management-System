import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { User } from '../../users/entities/user.entity';

export enum MaintenanceStatus {
  Submitted = 'Submitted',
  UnderInspection = 'UnderInspection',
  EstimateProvided = 'EstimateProvided',
  BudgetApproved = 'BudgetApproved',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Rejected = 'Rejected',
}

export enum MaintenancePriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

@Entity('maintenance_requests')
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  requestNumber: string;

  @ManyToOne(() => Vehicle)
  vehicle: Vehicle;

  @ManyToOne(() => User)
  submittedBy: User;

  @Column({ type: 'text' })
  issueDescription: string;

  @Column({ default: MaintenancePriority.Medium })
  priority: MaintenancePriority;

  @Column({ default: MaintenanceStatus.Submitted })
  status: MaintenanceStatus;

  @Column({ type: 'text', nullable: true })
  inspectionNotes: string;

  @ManyToOne(() => User, { nullable: true })
  inspectedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  inspectedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @ManyToOne(() => User, { nullable: true })
  approvedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  completionNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
