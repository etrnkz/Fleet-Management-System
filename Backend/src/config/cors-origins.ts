/**
 * CORS: allow specific origins including Vercel deployments
 */
export function getCorsOrigin(): string[] | boolean {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://hu-fm-system.vercel.app',
    'https://fms-transport-admin.vercel.app',
    'https://fms-deployment-office.vercel.app',
    'https://fms-employee.vercel.app',
    'https://fms-driver.vercel.app',
    'https://fms-system-admin.vercel.app',
    'https://fms-president.vercel.app',
    'https://fms-college-dean.vercel.app',
    'https://fms-department.vercel.app',
  ];
  
  // In development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return allowedOrigins;
}

