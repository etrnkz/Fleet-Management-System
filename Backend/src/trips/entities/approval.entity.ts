import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TripRequest } from './trip-request.entity';
import { User } from '../../users/entities/user.entity';

export enum ApprovalLevel {
  Department = 'Department',
  College = 'College',
  Dean = 'Dean',
  Deployment = 'Deployment',
  Transport = 'Transport',
}

export enum ApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  AutoRejectedTimeout = 'AutoRejectedTimeout',
}

@Entity('approvals')
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TripRequest, tripRequest => tripRequest.approvals)
  tripRequest: TripRequest;

  @Column()
  approvalLevel: ApprovalLevel;

  @Column({ default: ApprovalStatus.Pending })
  status: ApprovalStatus;

  @ManyToOne(() => User, { nullable: true })
  approver: User;

  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @Column({ type: 'datetime' })
  dueDate: Date;

  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
