import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TripType } from '../../trips/entities/trip-request.entity';

@Entity('workflow_configurations')
export class WorkflowConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  tripType: TripType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb' })
  steps: WorkflowStep[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface WorkflowStep {
  name: string;
  order: number;
  role: string;
  state: string;
  timeoutHours: number;
  nextStateOnApprove: string;
  nextStateOnReject: string;
  nextStateOnTimeout: string;
  actions: WorkflowAction[];
}

export interface WorkflowAction {
  type: 'notification' | 'email' | 'webhook';
  trigger: 'onEnter' | 'onApprove' | 'onReject' | 'onTimeout' | 'onWarning';
  config: {
    template?: string;
    recipients?: string[];
    hoursBeforeTimeout?: number;
    [key: string]: any;
  };
}
