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

/** Category for special always-on vehicles that don't go through the trip workflow */
export enum ServiceVehicleType {
  /** Shuttle that takes workers to/from campus on a fixed schedule */
  Shuttle = 'Shuttle',
  /** Security/patrol vehicle that operates continuously */
  Security = 'Security',
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

  @Column({ type: 'simple-json', nullable: true })
  restrictedZones: VehicleRestrictedZone[] | null;

  /** True for shuttle and security vehicles — they are always active, never go through trip workflow */
  @Column({ default: false })
  isServiceVehicle: boolean;

  /** Type of service vehicle (only relevant when isServiceVehicle = true) */
  @Column({ type: 'varchar', nullable: true })
  serviceVehicleType: ServiceVehicleType | null;

  /**
   * Schedule / operational notes for service vehicles.
   * e.g. "Morning: 06:30 depart campus → town. Evening: 17:00 depart town → campus"
   */
  @Column({ type: 'text', nullable: true })
  serviceSchedule: string | null;

  /** Route description for service vehicles */
  @Column({ type: 'text', nullable: true })
  serviceRoute: string | null;

  @ManyToOne(() => Driver, { nullable: true, eager: true })
  @JoinColumn({ name: 'assignedDriverId' })
  assignedDriver: Driver | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
