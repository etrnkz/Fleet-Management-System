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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CollegesService } from './colleges.service';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Colleges')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('colleges')
export class CollegesController {
  constructor(private readonly collegesService: CollegesService) {}

  @Post()
  @Roles(UserRole.Developer, UserRole.Dean)
  @ApiOperation({ summary: 'Create a new college' })
  @ApiResponse({ status: 201, description: 'College created successfully' })
  @ApiResponse({ status: 409, description: 'College code already exists' })
  create(@Body() createCollegeDto: CreateCollegeDto) {
    return this.collegesService.create(createCollegeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all colleges' })
  @ApiResponse({ status: 200, description: 'List of all colleges' })
  findAll() {
    return this.collegesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get college by ID' })
  @ApiResponse({ status: 200, description: 'College details' })
  @ApiResponse({ status: 404, description: 'College not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.collegesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Developer, UserRole.Dean)
  @ApiOperation({ summary: 'Update college' })
  @ApiResponse({ status: 200, description: 'College updated successfully' })
  @ApiResponse({ status: 404, description: 'College not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCollegeDto: UpdateCollegeDto,
  ) {
    return this.collegesService.update(id, updateCollegeDto);
  }

  @Delete(':id')
  @Roles(UserRole.Developer)
  @ApiOperation({ summary: 'Delete college' })
  @ApiResponse({ status: 200, description: 'College deleted successfully' })
  @ApiResponse({ status: 404, description: 'College not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.collegesService.remove(id);
  }
}
