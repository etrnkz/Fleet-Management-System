import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegesService } from './colleges.service';
import { CollegesController } from './colleges.controller';
import { College } from './entities/college.entity';

@Module({
  imports: [TypeOrmModule.forFeature([College])],
  controllers: [CollegesController],
  providers: [CollegesService],
  exports: [CollegesService, TypeOrmModule],
})
export class CollegesModule {}
