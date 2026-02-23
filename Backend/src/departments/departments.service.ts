import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const existing = await this.departmentRepository.findOne({
      where: { code: createDepartmentDto.code },
    });

    if (existing) {
      throw new ConflictException('Department code already exists');
    }

    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      college: { id: createDepartmentDto.collegeId } as any,
      head: createDepartmentDto.headId ? { id: createDepartmentDto.headId } as any : null,
    });

    return this.departmentRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['college', 'head'],
      order: { name: 'ASC' },
    });
  }

  async findByCollege(collegeId: string): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { college: { id: collegeId } },
      relations: ['head'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['college', 'head'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    if (updateDepartmentDto.code && updateDepartmentDto.code !== department.code) {
      const existing = await this.departmentRepository.findOne({
        where: { code: updateDepartmentDto.code },
      });

      if (existing) {
        throw new ConflictException('Department code already exists');
      }
    }

    Object.assign(department, updateDepartmentDto);

    if (updateDepartmentDto.collegeId) {
      department.college = { id: updateDepartmentDto.collegeId } as any;
    }

    if (updateDepartmentDto.headId) {
      department.head = { id: updateDepartmentDto.headId } as any;
    }

    return this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
  }
}
