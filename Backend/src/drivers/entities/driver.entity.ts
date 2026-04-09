import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

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

  /**
   * Pre-assigned vehicle — strict 1-to-1.
   * A vehicle can only be assigned to one driver at a time (enforced by unique index + service layer).
   */
  @Index({ unique: true, where: '"assignedVehicleId" IS NOT NULL' })
  @ManyToOne(() => Vehicle, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedVehicleId' })
  assignedVehicle: Vehicle | null;

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
