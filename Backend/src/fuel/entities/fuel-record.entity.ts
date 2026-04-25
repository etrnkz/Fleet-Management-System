import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { User } from '../../users/entities/user.entity';
import { TripRequest } from '../../trips/entities/trip-request.entity';

export enum FuelRecordType {
  Refuel = 'Refuel',
  TripConsumption = 'TripConsumption',
  Adjustment = 'Adjustment',
}

@Entity('fuel_records')
@Index(['vehicleId', 'createdAt'])
@Index(['type'])
export class FuelRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'uuid', nullable: true })
  tripId: string;

  @ManyToOne(() => TripRequest, { nullable: true })
  @JoinColumn({ name: 'tripId' })
  trip: TripRequest;

  @Column({ type: 'uuid' })
  recordedById: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'recordedById' })
  recordedBy: User;

  @Column({
    type: 'varchar',
    enum: FuelRecordType,
  })
  type: FuelRecordType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number; // in liters

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerLiter: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'int', nullable: true })
  mileageAtRefuel: number;

  @Column({ type: 'varchar', nullable: true })
  station: string;

  @Column({ type: 'varchar', nullable: true })
  receiptNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
