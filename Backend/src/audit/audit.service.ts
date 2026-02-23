import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction, AuditEntity } from './entities/audit-log.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(
    user: User | null,
    action: AuditAction,
    entityType: AuditEntity,
    entityId: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
    description?: string,
  ): Promise<AuditLog> {
    const audit = this.auditRepository.create({
      user: user || undefined,
      userId: user?.id || null,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
    });

    return this.auditRepository.save(audit);
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: string;
      action?: AuditAction;
      entityType?: AuditEntity;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ data: AuditLog[]; total: number; page: number; totalPages: number }> {
    const query = this.auditRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC');

    if (filters?.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters?.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters?.entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByEntity(entityType: AuditEntity, entityId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStatistics(startDate?: Date, endDate?: Date) {
    const query = this.auditRepository.createQueryBuilder('audit');

    if (startDate && endDate) {
      query.where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const total = await query.getCount();

    const byAction = await query
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    const byEntity = await query
      .select('audit.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.entityType')
      .getRawMany();

    const topUsers = await query
      .select('audit.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('audit.user', 'user')
      .addSelect('user.name', 'userName')
      .groupBy('audit.userId')
      .addGroupBy('user.name')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      byAction,
      byEntity,
      topUsers,
    };
  }
}
