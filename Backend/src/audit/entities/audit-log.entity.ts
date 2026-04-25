import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT',
  CANCEL = 'CANCEL',
  ALLOCATE = 'ALLOCATE',
  START = 'START',
  COMPLETE = 'COMPLETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export enum AuditEntity {
  User = 'User',
  Trip = 'Trip',
  Vehicle = 'Vehicle',
  Driver = 'Driver',
  Maintenance = 'Maintenance',
  College = 'College',
  Department = 'Department',
  Approval = 'Approval',
}

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string | null;

  @Column()
  action: AuditAction;

  @Column()
  entityType: AuditEntity;

  @Column()
  entityId: string;

  @Column({ type: 'simple-json', nullable: true })
  oldValues: any;

  @Column({ type: 'simple-json', nullable: true })
  newValues: any;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
