import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DriverStatus {
  Available = 'Available',
  OnTrip = 'OnTrip',
  OnLeave = 'OnLeave',
  Inactive = 'Inactive',
}

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  licenseNumber: string;

  @Column({ type: 'date' })
  licenseExpiry: Date;

  @Column()
  experienceYears: number;

  @Column({ default: DriverStatus.Available })
  status: DriverStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  specializations: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 0 })
  totalTrips: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDistance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
