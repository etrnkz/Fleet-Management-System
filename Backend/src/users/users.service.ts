import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { College } from '../colleges/entities/college.entity';
import { Driver, DriverStatus } from '../drivers/entities/driver.entity';
import { BulkInviteUsersDto } from './dto/bulk-invite-users.dto';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(College)
    private readonly collegeRepository: Repository<College>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async create(
    userData: Partial<User> & { departmentId?: string; collegeId?: string },
  ): Promise<User> {
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

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { resetToken: token },
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
        isActive: true,
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
        isActive: true,
      },
      relations: ['department', 'college'],
    });
  }

  async update(
    id: string,
    userData: Partial<User> & { departmentId?: string; collegeId?: string },
  ): Promise<User> {
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

  /**
   * Generate a secure random password
   */
  private generatePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Extract name from email address
   */
  private extractNameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    // Convert dots and underscores to spaces, then title case
    return localPart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Returns the roles that a given inviter role is allowed to assign.
   * Hierarchy: SystemAdmin/Developer > President > Dean > DepartmentHead > User
   *            TransportOffice can assign operational roles (Driver, MaintenanceTeam, Gate)
   */
  private getAllowedRolesForInviter(inviterRole: UserRole): UserRole[] {
    switch (inviterRole) {
      case UserRole.SystemAdmin:
      case UserRole.Developer:
        return Object.values(UserRole);
      case UserRole.President:
        return [
          UserRole.DepartmentHead,
          UserRole.CollegeHead,
          UserRole.User,
        ];
      case UserRole.Dean:
        return [UserRole.DepartmentHead, UserRole.User];
      case UserRole.DepartmentHead:
        return [UserRole.User];
      case UserRole.TransportOffice:
        return [UserRole.Driver, UserRole.MaintenanceTeam, UserRole.Gate, UserRole.DeploymentTeam, UserRole.DepartmentHead, UserRole.CollegeHead, UserRole.Dean, UserRole.User];
      default:
        return [UserRole.User];
    }
  }

  /**
   * Bulk invite users via email addresses
   */
  async bulkInviteUsers(inviter: User, bulkInviteDto: BulkInviteUsersDto) {
    const { emails, departmentId, collegeId, welcomeMessage } = bulkInviteDto;
    const invited: string[] = [];
    const failed: { email: string; reason: string }[] = [];

    // Validate and resolve the role to assign
    const allowedRoles = this.getAllowedRolesForInviter(inviter.role);
    const assignedRole = bulkInviteDto.role ?? UserRole.User;

    if (!allowedRoles.includes(assignedRole)) {
      throw new ForbiddenException(
        `Your role (${inviter.role}) is not allowed to invite users with role (${assignedRole}). ` +
        `Allowed roles: ${allowedRoles.join(', ')}`,
      );
    }


    // Get department and college if specified
    let department: Department | null = null;
    let college: College | null = null;

    if (departmentId) {
      department = await this.departmentRepository.findOne({
        where: { id: departmentId },
        relations: ['college'],
      });
      if (!department) {
        throw new BadRequestException('Department not found');
      }
    }

    if (collegeId) {
      college = await this.collegeRepository.findOne({
        where: { id: collegeId },
      });
      if (!college) {
        throw new BadRequestException('College not found');
      }
    }

    for (const email of emails) {
      try {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
          where: { email: email.toLowerCase().trim() },
        });

        if (existingUser) {
          failed.push({ email, reason: 'User already exists' });
          continue;
        }

        // Generate password and create user
        const password = this.generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        const name = this.extractNameFromEmail(email);

        const user = this.userRepository.create({
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name,
          role: assignedRole,
          department,
          college: department?.college || college,
          isActive: true,
        });

        await this.userRepository.save(user);

        // Send invitation email
        await this.emailService.sendInvitationEmail({
          to: email,
          name,
          password,
          inviterName: inviter.name,
          inviterRole: inviter.role,
          department: department?.name,
          college: department?.college?.name || college?.name,
          welcomeMessage,
        });

        // Send SMS if user has a phone number (phone may be set later, skip for now)
        // SMS is sent when phone is available on the user record after profile completion

        invited.push(email);
      } catch (error) {
        console.error(`Failed to invite ${email}:`, error);
        failed.push({ email, reason: error.message || 'Unknown error' });
      }
    }

    return {
      success: true,
      invited,
      failed,
      message: `${invited.length} invitations sent successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
    };
  }

  /**
   * Parse CSV content and extract email addresses
   */
  private parseCsvEmails(csvContent: string): string[] {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const emailColumnIndex = headers.findIndex(h => 
      h.includes('email') || h.includes('e-mail') || h.includes('mail')
    );

    if (emailColumnIndex === -1) {
      throw new BadRequestException('CSV must contain an "email" column');
    }

    const emails: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(c => c.trim());
      if (columns[emailColumnIndex]) {
        const email = columns[emailColumnIndex].replace(/['"]/g, ''); // Remove quotes
        if (email && email.includes('@')) {
          emails.push(email);
        }
      }
    }

    if (emails.length === 0) {
      throw new BadRequestException('No valid email addresses found in CSV');
    }

    return emails;
  }

  /**
   * Bulk invite users from CSV file
   */
  async bulkInviteUsersFromCsv(
    inviter: User,
    file: any,
    options: { departmentId?: string; collegeId?: string; welcomeMessage?: string; role?: UserRole },
  ) {
    try {
      const csvContent = file.buffer.toString('utf-8');
      const emails = this.parseCsvEmails(csvContent);

      const bulkInviteDto: BulkInviteUsersDto = {
        emails,
        role: options.role,
        departmentId: options.departmentId,
        collegeId: options.collegeId,
        welcomeMessage: options.welcomeMessage,
      };

      return await this.bulkInviteUsers(inviter, bulkInviteDto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to process CSV file: ${error.message}`);
    }
  }

  /**
   * Send a welcome email to a newly created user with their credentials.
   */
  async sendWelcomeEmail(user: User, password: string): Promise<void> {
    await this.emailService.sendInvitationEmail({
      to: user.email,
      name: user.name,
      password,
      inviterName: 'System Administrator',
      inviterRole: 'Admin',
      welcomeMessage: `Your account has been created with role: ${user.role}. Please log in and change your password immediately.`,
    });
  }

  async getDriverProfile(userId: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!driver) throw new NotFoundException('No driver profile found for this user');
    return driver;
  }

  /**
   * Create or update the Driver profile for a user with Driver role.
   * Called when a driver fills in their license details from the driver app.
   */
  async upsertDriverProfile(
    userId: string,
    data: { licenseNumber: string; licenseExpiry: string; experienceYears?: number; specializations?: string; notes?: string },
  ): Promise<Driver> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== UserRole.Driver) {
      throw new BadRequestException('Only users with Driver role can have a driver profile');
    }

    let driver = await this.driverRepository.findOne({ where: { user: { id: userId } } });

    if (driver) {
      // Update existing
      driver.licenseNumber = data.licenseNumber;
      driver.licenseExpiry = new Date(data.licenseExpiry);
      if (data.experienceYears !== undefined) driver.experienceYears = data.experienceYears;
      if (data.specializations !== undefined) driver.specializations = data.specializations;
      if (data.notes !== undefined) driver.notes = data.notes;
    } else {
      // Create new
      driver = this.driverRepository.create({
        user,
        licenseNumber: data.licenseNumber,
        licenseExpiry: new Date(data.licenseExpiry),
        experienceYears: data.experienceYears ?? 0,
        specializations: data.specializations,
        notes: data.notes,
        status: DriverStatus.Available,
      });
    }

    return this.driverRepository.save(driver);
  }
}
