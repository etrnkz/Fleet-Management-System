import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';

export enum VehicleStatus {
  Active = 'Active',
  Maintenance = 'Maintenance',
  Inactive = 'Inactive',
}

export enum FuelType {
  Gasoline = 'Gasoline',
  Diesel = 'Diesel',
  Electric = 'Electric',
  Hybrid = 'Hybrid',
}

/** Forbidden circular zones: if a VIP-restricted vehicle enters, engine-off is simulated. */
export type VehicleRestrictedZone = {
  name?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  vehicleId: string;

  @Column({ unique: true })
  plateNumber: string;

  @Column({ nullable: true })
  vehicleType: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  capacity: number;

  @Column()
  fuelType: FuelType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fuelCapacity: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: 'Fuel efficiency in km per liter' })
  fuelEfficiency: number;

  @Column({ default: VehicleStatus.Active })
  status: VehicleStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentMileage: number;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'date', nullable: true })
  insuranceExpiryDate: Date;

  @Column({ type: 'date', nullable: true })
  nextServiceDate: Date;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  vinNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  vipGeoRestrictionEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  restrictedZones: VehicleRestrictedZone[] | null;

  @ManyToOne(() => Driver, { nullable: true, eager: true })
  @JoinColumn({ name: 'assignedDriverId' })
  assignedDriver: Driver | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
