import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  User = 'User',
  DepartmentHead = 'DepartmentHead',
  CollegeHead = 'CollegeHead',
  Dean = 'Dean',
  DeploymentTeam = 'DeploymentTeam',
  TransportOffice = 'TransportOffice',
  MaintenanceTeam = 'MaintenanceTeam',
  Driver = 'Driver',
  Developer = 'Developer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  name: string;

  @Column()
  role: UserRole;

  @Column({ nullable: true })
  phoneNumber: string;

  @ManyToOne('Department', { nullable: true })
  department: any;

  @ManyToOne('College', { nullable: true })
  college: any;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
