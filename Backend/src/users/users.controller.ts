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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkInviteUsersDto } from './dto/bulk-invite-users.dto';
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
    // Auto-generate password if not provided
    const rawPassword = createUserDto.password || this.generateTempPassword()
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const { password, ...userData } = createUserDto;

    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });

    // Send welcome email with credentials
    try {
      await this.usersService.sendWelcomeEmail(user, rawPassword);
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

    return user;
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!'
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
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
    // Users can update their own profile fields including department/college assignment
    const allowedFields: any = {
      name: updateUserDto.name,
      phoneNumber: updateUserDto.phoneNumber,
    };
    // Allow users to set their own department and college (needed for trip routing)
    if (updateUserDto.departmentId !== undefined) allowedFields.departmentId = updateUserDto.departmentId;
    if (updateUserDto.collegeId !== undefined) allowedFields.collegeId = updateUserDto.collegeId;
    return this.usersService.update(req.user.id, allowedFields);
  }

  @Patch('me/driver-profile')
  @ApiOperation({
    summary: 'Create or update driver profile for current user',
    description: 'Allows a user with Driver role to set their license details. Auto-creates the driver record if it does not exist.',
  })
  @ApiResponse({ status: 200, description: 'Driver profile updated' })
  @ApiResponse({ status: 400, description: 'User is not a Driver' })
  updateDriverProfile(
    @Request() req,
    @Body() body: { licenseNumber: string; licenseExpiry: string; experienceYears?: number; specializations?: string; notes?: string },
  ) {
    return this.usersService.upsertDriverProfile(req.user.id, body);
  }

  @Patch('me/password')
  @ApiOperation({
    summary: 'Change current user password',
    description: 'Update password after verifying the current password',
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isValid = await user.validatePassword(body.currentPassword);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(body.newPassword, 10);
    await this.usersService.update(req.user.id, { password: hashed } as any);
    return { message: 'Password updated successfully' };
  }

  @Post('me/profile-image')
  @UseInterceptors(FileInterceptor('profileImage', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload profile image',
    description: 'Upload a profile image for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile image uploaded successfully',
    schema: {
      example: {
        profileImageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
        message: 'Profile image updated successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  async uploadProfileImage(
    @Request() req,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Convert file to base64 for storage
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    
    // Update user with profile image
    await this.usersService.update(req.user.id, { profileImage: base64Image });
    
    return {
      profileImageUrl: base64Image,
      message: 'Profile image updated successfully',
    };
  }

  @Delete('me/profile-image')
  @ApiOperation({
    summary: 'Remove profile image',
    description: 'Remove the profile image for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile image removed successfully',
  })
  async removeProfileImage(@Request() req) {
    await this.usersService.update(req.user.id, { profileImage: null });
    return { message: 'Profile image removed successfully' };
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

  @Post('bulk-invite')
  @Roles(UserRole.Developer, UserRole.Dean, UserRole.DepartmentHead, UserRole.President, UserRole.TransportOffice)
  @ApiOperation({
    summary: 'Bulk invite users via email addresses',
    description: 'Send invitation emails to multiple users with auto-generated passwords. Only authorized roles can invite users.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invitations sent successfully',
    schema: {
      example: {
        success: true,
        invited: ['john.doe@university.edu', 'jane.smith@university.edu'],
        failed: [],
        message: '2 invitations sent successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async bulkInviteUsers(@Request() req, @Body() bulkInviteDto: BulkInviteUsersDto) {
    return this.usersService.bulkInviteUsers(req.user, bulkInviteDto);
  }

  @Post('bulk-invite-csv')
  @Roles(UserRole.Developer, UserRole.Dean, UserRole.DepartmentHead, UserRole.President, UserRole.TransportOffice)
  @UseInterceptors(FileInterceptor('csvFile', {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
        return callback(new BadRequestException('Only CSV files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Bulk invite users via CSV file upload',
    description: 'Upload a CSV file with email addresses to send bulk invitations. CSV should have "email" column.',
  })
  @ApiResponse({
    status: 201,
    description: 'CSV processed and invitations sent',
    schema: {
      example: {
        success: true,
        invited: ['john.doe@university.edu', 'jane.smith@university.edu'],
        failed: ['invalid-email'],
        message: '2 invitations sent successfully, 1 failed',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid CSV file or format' })
  async bulkInviteUsersFromCsv(
    @Request() req,
    @UploadedFile() file: any,
    @Body() body: { departmentId?: string; collegeId?: string; welcomeMessage?: string; role?: UserRole },
  ) {
    if (!file) {
      throw new BadRequestException('No CSV file uploaded');
    }

    return this.usersService.bulkInviteUsersFromCsv(req.user, file, body);
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
