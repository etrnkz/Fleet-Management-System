import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Role → dashboard path mapping
const ROLE_PATHS: Record<string, string> = {
  Dean: '/college-dean/dashboard',
  CollegeHead: '/college-dean/dashboard',
  DepartmentHead: '/department/dashboard',
  DeploymentOffice: '/deployment-office/dashboard',
  DeploymentTeam: '/deployment-office/dashboard',
  Driver: '/driver/dashboard',
  Employee: '/employee/dashboard',
  User: '/employee/dashboard',
  President: '/president/dashboard',
  SystemAdmin: '/system-admin/dashboard',
  Developer: '/system-admin/dashboard',
  TransportOffice: '/transport-admin/dashboard',
}

// Role → allowed path prefix
const ROLE_PREFIX: Record<string, string> = {
  Dean: '/college-dean',
  CollegeHead: '/college-dean',
  DepartmentHead: '/department',
  DeploymentOffice: '/deployment-office',
  DeploymentTeam: '/deployment-office',
  Driver: '/driver',
  Employee: '/employee',
  User: '/employee',
  President: '/president',
  SystemAdmin: '/system-admin',
  Developer: '/system-admin',
  TransportOffice: '/transport-admin',
}

const PUBLIC_PATHS = ['/', '/login', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '?')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get token from cookies (set at login)
  const token = request.cookies.get('accessToken')?.value
  const userCookie = request.cookies.get('user')?.value

  if (!token || !userCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie))
    const role = user?.role
    const allowedPrefix = ROLE_PREFIX[role]

    // If role has no mapping, send to login
    if (!allowedPrefix) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If accessing /dashboard, redirect to role-specific dashboard
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(ROLE_PATHS[role], request.url))
    }

    // If accessing a path not belonging to their role, redirect to their dashboard
    if (!pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(ROLE_PATHS[role], request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
