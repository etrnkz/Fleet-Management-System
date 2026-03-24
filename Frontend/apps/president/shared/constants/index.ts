// Shared constants across all apps

export const APP_PORTS = {
  employee: 3000,
  admin: 3001,
  maintenance: 3002,
  'college-dean': 3003,
  president: 3004,
  'deployment-office': 3005,
  driver: 3006,
} as const;

export const ROLES = {
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
  MAINTENANCE: 'maintenance',
  COLLEGE_DEAN: 'college-dean',
  PRESIDENT: 'president',
  DEPLOYMENT_OFFICE: 'deployment-office',
  DRIVER: 'driver',
} as const;

export const TRIP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in-use',
  MAINTENANCE: 'maintenance',
  OUT_OF_SERVICE: 'out-of-service',
} as const;
