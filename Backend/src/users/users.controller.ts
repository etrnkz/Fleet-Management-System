import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.Developer, UserRole.Dean)
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Create a new user account. Only Developer and Dean roles can create users.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'John Doe',
        email: 'john.doe@school.edu',
        role: 'Driver',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const { password, ...userData } = createUserDto;

    return this.usersService.create({
      ...userData,
      password: hashedPassword,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'John Doe',
          email: 'john.doe@school.edu',
          role: 'Driver',
          isActive: true,
          departmentId: 'uuid',
          collegeId: 'uuid',
          createdAt: '2024-01-15T10:00:00Z',
        },
      ],
    },
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      example: {
        id: 'uuid',
        name: 'John Doe',
        email: 'john.doe@school.edu',
        role: 'Driver',
        isActive: true,
        department: {
          id: 'uuid',
          name: 'Computer Science',
          code: 'CS',
        },
        college: {
          id: 'uuid',
          name: 'College of Engineering',
          code: 'COE',
        },
        createdAt: '2024-01-15T10:00:00Z',
      },
    },
  })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Update the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'John Doe Updated',
        email: 'john.doe@school.edu',
        phoneNumber: '+251912345678',
        role: 'Driver',
        isActive: true,
        updatedAt: '2024-01-16T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    // Users can only update their own name, email, and phone
    const allowedFields = {
      name: updateUserDto.name,
      phoneNumber: updateUserDto.phoneNumber,
    };
    return this.usersService.update(req.user.id, allowedFields);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
  })
  @ApiResponse({
    status: 200,
    description: 'User details',
    schema: {
      example: {
        id: 'uuid',
        name: 'John Doe',
        email: 'john.doe@school.edu',
        role: 'Driver',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.Developer, UserRole.Dean)
  @ApiOperation({
    summary: 'Update user',
    description:
      'Update user information. Only Developer and Dean roles can update users.',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'John Doe Updated',
        email: 'john.doe@school.edu',
        role: 'Driver',
        isActive: true,
        updatedAt: '2024-01-16T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.Developer, UserRole.Dean)
  @ApiOperation({
    summary: 'Deactivate user',
    description: 'Deactivate a user account (soft delete)',
  })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.update(id, { isActive: false });
    return { message: 'User deactivated successfully' };
  }

  @Patch(':id/activate')
  @Roles(UserRole.Developer, UserRole.Dean)
  @ApiOperation({
    summary: 'Activate user',
    description: 'Reactivate a deactivated user account',
  })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.update(id, { isActive: true });
    return { message: 'User activated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.Developer)
  @ApiOperation({
    summary: 'Delete user',
    description:
      'Permanently delete a user. Only Developer role can delete users.',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  @Get('statistics/overview')
  @Roles(UserRole.Developer, UserRole.Dean, UserRole.TransportOffice)
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Get comprehensive statistics about users in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics',
    schema: {
      example: {
        total: 150,
        active: 142,
        inactive: 8,
        byRole: {
          User: 80,
          DepartmentHead: 15,
          CollegeHead: 8,
          Dean: 3,
          DeploymentTeam: 5,
          TransportOffice: 4,
          MaintenanceTeam: 10,
          Driver: 20,
          Developer: 5,
        },
      },
    },
  })
  async getStatistics() {
    const users = await this.usersService.findAll();

    const stats = {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      byRole: {} as Record<string, number>,
    };

    // Count by role
    users.forEach((user) => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
    });

    return stats;
  }
}
