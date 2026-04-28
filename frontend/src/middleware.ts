import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

const PUBLIC_PATHS = ['/', '/forgot-password', '/reset-password', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow Next.js internals and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('accessToken')?.value
  const userCookie = request.cookies.get('user')?.value

  // If already logged in and trying to access login page → redirect to their dashboard
  if (pathname === '/login' && token && userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie))
      const dest = ROLE_PATHS[user?.role]
      if (dest) return NextResponse.redirect(new URL(dest, request.url))
    } catch {}
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '?')) || pathname === '/login') {
    return NextResponse.next()
  }

  // Protected routes — let through if cookie exists OR no cookie (client-side handles it)
  if (token && userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie))
      const role = user?.role
      const allowedPrefix = ROLE_PREFIX[role]

      if (!allowedPrefix) return NextResponse.redirect(new URL('/login', request.url))
      if (pathname === '/dashboard') return NextResponse.redirect(new URL(ROLE_PATHS[role], request.url))
      // Wrong role trying to access another role's path
      if (!pathname.startsWith(allowedPrefix)) return NextResponse.redirect(new URL(ROLE_PATHS[role], request.url))
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
