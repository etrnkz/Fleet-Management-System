import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  TripSubmitted = 'TripSubmitted',
  TripApproved = 'TripApproved',
  TripRejected = 'TripRejected',
  TripAutoRejected = 'TripAutoRejected',
  TripAllocated = 'TripAllocated',
  TripReady = 'TripReady',
  TripStarted = 'TripStarted',
  TripCompleted = 'TripCompleted',
  TripCompletedEarly = 'TripCompletedEarly',
  TripCancelled = 'TripCancelled',
  ApprovalReminder = 'ApprovalReminder',
  ApprovalTimeout = 'ApprovalTimeout',
  FeedbackSubmitted = 'FeedbackSubmitted',
  NewTripRequest = 'NewTripRequest',
  ApprovalPending = 'ApprovalPending',
  GeofenceWarning = 'GeofenceWarning',
  GeofenceViolation = 'GeofenceViolation',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  recipient: User;

  @Column()
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'simple-json', nullable: true })
  data: any;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  sentAt: Date;
}
