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
import { Department } from '../../departments/entities/department.entity';
import { College } from '../../colleges/entities/college.entity';

export enum UserRole {
  User = 'User',
  DepartmentHead = 'DepartmentHead',
  CollegeHead = 'CollegeHead',
  Dean = 'Dean',
  President = 'President',
  DeploymentTeam = 'DeploymentTeam',
  TransportOffice = 'TransportOffice',
  MaintenanceTeam = 'MaintenanceTeam',
  Driver = 'Driver',
  Developer = 'Developer',
  SystemAdmin = 'SystemAdmin',
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

  @ManyToOne(() => Department, { nullable: true })
  department: Department | null;

  @ManyToOne(() => College, { nullable: true })
  college: College | null;

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
