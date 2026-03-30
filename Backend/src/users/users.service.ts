import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { College } from '../colleges/entities/college.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(College)
    private readonly collegeRepository: Repository<College>,
  ) {}

  async create(userData: Partial<User> & { departmentId?: string; collegeId?: string }): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create(userData);
    
    // Set department if departmentId is provided
    if (userData.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: userData.departmentId },
      });
      if (department) {
        user.department = department;
      }
    }
    
    // Set college if collegeId is provided
    if (userData.collegeId) {
      const college = await this.collegeRepository.findOne({
        where: { id: userData.collegeId },
      });
      if (college) {
        user.college = college;
      }
    }
    
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      relations: ['department', 'college'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { id },
      relations: ['department', 'college'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['department', 'college'],
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userRepository.find({
      where: { role: role as any, isActive: true },
      relations: ['department', 'college'],
    });
  }

  async findByDepartment(departmentId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { department: { id: departmentId }, isActive: true },
      relations: ['department', 'college'],
    });
  }

  async findByCollege(collegeId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { college: { id: collegeId }, isActive: true },
      relations: ['department', 'college'],
    });
  }

  async findDepartmentHead(departmentId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { 
        department: { id: departmentId },
        role: UserRole.DepartmentHead,
        isActive: true 
      },
      relations: ['department', 'college'],
    });
  }

  async findCollegeHead(collegeId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        college: { id: collegeId },
        role: UserRole.Dean,
        isActive: true,
      },
      relations: ['department', 'college'],
    });
  }

  async findPresident(): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        role: UserRole.President,
        isActive: true 
      },
      relations: ['department', 'college'],
    });
  }

  async update(id: string, userData: Partial<User> & { departmentId?: string; collegeId?: string }): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Handle department update
    if (userData.departmentId !== undefined) {
      if (userData.departmentId) {
        const department = await this.departmentRepository.findOne({
          where: { id: userData.departmentId },
        });
        if (department) {
          user.department = department;
        }
      } else {
        user.department = null as any;
      }
      delete userData.departmentId; // Remove from userData to avoid TypeORM issues
    }

    // Handle college update
    if (userData.collegeId !== undefined) {
      if (userData.collegeId) {
        const college = await this.collegeRepository.findOne({
          where: { id: userData.collegeId },
        });
        if (college) {
          user.college = college;
        }
      } else {
        user.college = null as any;
      }
      delete userData.collegeId; // Remove from userData to avoid TypeORM issues
    }

    // Update other fields
    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }
}
