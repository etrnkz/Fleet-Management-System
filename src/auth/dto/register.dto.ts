import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, Matches } from 'class-validator';

export enum UserRole {
  SYSTEM_ADMIN = 'system-admin',
  TRANSPORT_ADMIN = 'transport-admin',
  DRIVER = 'driver',
  DEPLOYMENT_OFFICE = 'deployment-office',
  EMPLOYEE = 'employee',  
  ADMIN_OFFICE = 'admin-office',  
  COLLEGE_DEAN = 'college-dean',
  PRESIDENT = 'president',
  MAINTENANCE = 'maintenance'
}

export class RegisterDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Matches(/^[a-zA-Z\s]{2,50}$/, {
    message: 'Name must be 2-50 characters, letters and spaces only'
  })
  name: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })  // Increased from 6
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character'
  })
  password: string;

  @IsEnum(UserRole, { 
    message: `Role must be one of: ${Object.values(UserRole).join(', ')}` 
  })
  role: UserRole;

  // Optional but recommended fields
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(/^[0-9+\-\s]{10,15}$/, {
    message: 'Phone number must be 10-15 digits and can include +, -, or spaces'
  })
  phone?: string;

  @IsString({ message: 'Department must be a string' })
  @IsNotEmpty({ message: 'Department is required' })
  department?: string;
}