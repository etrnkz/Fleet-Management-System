import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { College } from './entities/college.entity';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';

@Injectable()
export class CollegesService {
  constructor(
    @InjectRepository(College)
    private readonly collegeRepository: Repository<College>,
  ) {}

  async create(createCollegeDto: CreateCollegeDto): Promise<College> {
    const existing = await this.collegeRepository.findOne({
      where: { code: createCollegeDto.code },
    });

    if (existing) {
      throw new ConflictException('College code already exists');
    }

    const college = this.collegeRepository.create({
      ...createCollegeDto,
      head: createCollegeDto.headId ? { id: createCollegeDto.headId } as any : null,
    });

    return this.collegeRepository.save(college);
  }

  async findAll(): Promise<College[]> {
    return this.collegeRepository.find({
      relations: ['head', 'departments'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<College> {
    const college = await this.collegeRepository.findOne({
      where: { id },
      relations: ['head', 'departments'],
    });

    if (!college) {
      throw new NotFoundException('College not found');
    }

    return college;
  }

  async update(id: string, updateCollegeDto: UpdateCollegeDto): Promise<College> {
    const college = await this.findOne(id);

    if (updateCollegeDto.code && updateCollegeDto.code !== college.code) {
      const existing = await this.collegeRepository.findOne({
        where: { code: updateCollegeDto.code },
      });

      if (existing) {
        throw new ConflictException('College code already exists');
      }
    }

    Object.assign(college, updateCollegeDto);

    if (updateCollegeDto.headId) {
      college.head = { id: updateCollegeDto.headId } as any;
    }

    return this.collegeRepository.save(college);
  }

  async remove(id: string): Promise<void> {
    const college = await this.findOne(id);
    await this.collegeRepository.remove(college);
  }
}
