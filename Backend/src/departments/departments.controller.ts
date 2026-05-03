import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(UserRole.Developer, UserRole.SystemAdmin, UserRole.Dean, UserRole.CollegeHead)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 409, description: 'Department code already exists' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiQuery({
    name: 'collegeId',
    required: false,
    description: 'Filter by college ID',
  })
  @ApiResponse({ status: 200, description: 'List of all departments' })
  findAll(@Query('collegeId') collegeId?: string) {
    if (collegeId) {
      return this.departmentsService.findByCollege(collegeId);
    }
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department details' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Developer, UserRole.SystemAdmin, UserRole.Dean, UserRole.CollegeHead)
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.Developer, UserRole.SystemAdmin)
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.remove(id);
  }
}
