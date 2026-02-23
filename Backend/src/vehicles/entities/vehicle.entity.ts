import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VehicleStatus {
  Active = 'Active',
  UnderMaintenance = 'UnderMaintenance',
  Inactive = 'Inactive',
}

export enum FuelType {
  Petrol = 'Petrol',
  Diesel = 'Diesel',
  Electric = 'Electric',
  Hybrid = 'Hybrid',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  plateNumber: string;

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

  @Column({ default: VehicleStatus.Active })
  status: VehicleStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentMileage: number;

  @Column({ type: 'datetime', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'datetime', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  vinNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
