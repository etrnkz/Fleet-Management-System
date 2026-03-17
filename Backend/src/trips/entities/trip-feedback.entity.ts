import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TripRequest } from './trip-request.entity';
import { User } from '../../users/entities/user.entity';

export enum FeedbackRating {
  EXCELLENT = 5,
  GOOD = 4,
  AVERAGE = 3,
  POOR = 2,
  TERRIBLE = 1,
}

@Entity('trip_feedback')
export class TripFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => TripRequest)
  @JoinColumn()
  tripRequest: TripRequest;

  @ManyToOne(() => User)
  submittedBy: User;

  @Column({ type: 'int' })
  overallRating: FeedbackRating;

  @Column({ type: 'int', nullable: true })
  driverRating: FeedbackRating;

  @Column({ type: 'int', nullable: true })
  vehicleRating: FeedbackRating;

  @Column({ type: 'int', nullable: true })
  punctualityRating: FeedbackRating;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'text', nullable: true })
  suggestions: string;

  @Column({ default: false })
  wouldRecommend: boolean;

  @Column({ type: 'json', nullable: true })
  issues: string[]; // Array of issues like "Vehicle breakdown", "Late arrival", etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}