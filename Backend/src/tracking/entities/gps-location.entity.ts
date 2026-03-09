import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TripRequest } from '../../trips/entities/trip-request.entity';

@Entity('gps_locations')
@Index(['tripId', 'timestamp'])
export class GpsLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tripId: string;

  @ManyToOne(() => TripRequest, { onDelete: 'CASCADE' })
  trip: TripRequest;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  speed: number; // km/h

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  heading: number; // degrees (0-360)

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  altitude: number; // meters

  @Column('decimal', { precision: 4, scale: 2, nullable: true })
  accuracy: number; // meters

  @Column({ default: false })
  isOffline: boolean; // Was this location recorded offline?

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'text', nullable: true })
  metadata?: string; // JSON string for SQLite compatibility
}
