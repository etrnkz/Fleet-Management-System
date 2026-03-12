import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
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
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
