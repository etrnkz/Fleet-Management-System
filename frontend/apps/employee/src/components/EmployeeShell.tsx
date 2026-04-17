'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/api'

const navItems: { href: string; label: string; requestSection?: boolean; icon: (active: boolean) => ReactNode }[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (active) => (
      <svg
        className={`w-5 h-5 shrink-0 ${active ? 'text-[var(--fa-primary)]' : 'text-[var(--fa-secondary)] group-hover:text-[var(--fa-primary)]'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    href: '/trips',
    label: 'My Trips',
    icon: (active) => (
      <svg
        className={`w-5 h-5 shrink-0 ${active ? 'text-[var(--fa-primary)]' : 'text-[var(--fa-secondary)] group-hover:text-[var(--fa-primary)]'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard?section=request',
    label: 'New Request',
    requestSection: true,
    icon: (active) => (
      <svg
        className={`w-5 h-5 shrink-0 ${active ? 'text-[var(--fa-primary)]' : 'text-[var(--fa-secondary)] group-hover:text-[var(--fa-primary)]'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

type EmployeeShellProps = {
  children: React.ReactNode
  title: string
  subtitle?: string
  headerActions?: React.ReactNode
}

function EmployeeShellInner({ children, title, subtitle, headerActions }: EmployeeShellProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      router.push('/login')
      return
    }
    setUser(u as { name?: string; email?: string; role?: string })
  }, [router])

  const handleLogout = () => {
    // Clear authentication tokens and user session
    localStorage.removeItem('accessToken')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // Keep only essential userData (profile settings without images)
    // Profile image will be restored from backend on next login
    
    router.push('/?logout=true')
  }

  const section = searchParams.get('section')

  const isActive = (href: string, label: string, requestSection?: boolean) => {
    if (pathname === '/dashboard') {
      if (label === 'Dashboard') return section !== 'request'
      if (requestSection) return section === 'request'
    }
    if (href.startsWith('/dashboard')) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-[var(--fa-background)] text-[var(--fa-on-surface)] flex flex-row transition-colors duration-300">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 shrink-0 flex flex-col py-8 px-4 bg-[var(--fa-surface)] border-r border-[var(--fa-outline-variant)]/30 transition-all duration-300 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-10 px-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--fa-primary)] flex items-center justify-center text-[var(--fa-on-primary)] shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--fa-primary)] font-serif">Fleet Authority</h1>
            <p className="text-[10px] uppercase tracking-widest text-[var(--fa-secondary)] font-bold">University Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.label, item.requestSection)
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded transition-colors duration-200 ${
                  active
                    ? 'text-[var(--fa-primary)] font-bold bg-[var(--fa-primary-container)]/30 border-l-4 border-[var(--fa-primary)]'
                    : 'text-[var(--fa-secondary)] font-medium hover:text-[var(--fa-primary)] hover:bg-[var(--fa-surface-container)]'
                }`}
              >
                {item.icon(active)}
                <span className="antialiased tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-1 pt-8 border-t border-[var(--fa-outline-variant)]/20">
          <Link
            href="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded text-[var(--fa-secondary)] font-medium hover:text-[var(--fa-primary)] hover:bg-[var(--fa-surface-container)] transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="antialiased tracking-tight">Settings</span>
          </Link>
          <a
            href="mailto:transport@hu.edu.et"
            className="flex items-center gap-3 px-4 py-3 rounded text-[var(--fa-secondary)] font-medium hover:text-[var(--fa-primary)] hover:bg-[var(--fa-surface-container)] transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="antialiased tracking-tight">Support</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded text-[var(--fa-error)] font-medium hover:bg-[var(--fa-error)]/10 transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="antialiased tracking-tight">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full lg:ml-0">
        <header className="sticky top-0 z-30 w-full h-16 flex flex-wrap gap-y-2 justify-between items-center px-4 sm:px-8 bg-[var(--fa-surface)]/95 backdrop-blur-md border-b border-[var(--fa-outline-variant)]/20 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded hover:bg-[var(--fa-surface-container)] text-[var(--fa-secondary)]"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0 hidden sm:block lg:hidden">
              <h1 className="text-base font-bold text-[var(--fa-primary)] font-serif tracking-tight truncate">{title}</h1>
            </div>
          </div>

          <div className="relative w-full max-w-md hidden md:block order-last md:order-none md:flex-1 md:max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fa-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              readOnly
              placeholder="Search trip ID, destination…"
              className="w-full bg-[var(--fa-surface-container)] border-none rounded py-2 pl-10 pr-4 text-sm text-[var(--fa-on-surface)] placeholder:text-[var(--fa-secondary)] focus:ring-1 focus:ring-[var(--fa-primary)] focus:bg-[var(--fa-surface)] transition-all outline-none"
              aria-label="Search trips"
            />
          </div>

          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link
              href="/notifications"
              className="text-[var(--fa-secondary)] hover:text-[var(--fa-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--fa-surface-container)]"
              aria-label="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </Link>
            <a
              href="mailto:transport@hu.edu.et"
              className="text-[var(--fa-secondary)] hover:text-[var(--fa-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--fa-surface-container)] hidden sm:inline-block"
              aria-label="Help"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </a>
            <div className="h-8 w-px bg-[var(--fa-outline-variant)]/30 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[var(--fa-primary)] font-serif leading-tight truncate max-w-[160px]">
                  {user?.name ?? '—'}
                </p>
                <p className="text-[10px] text-[var(--fa-secondary)] uppercase tracking-wider font-semibold">
                  {user?.role ?? 'Employee'}
                </p>
              </div>
              <div className="w-10 h-10 rounded border border-[var(--fa-outline-variant)]/30 bg-[var(--fa-primary)] flex items-center justify-center text-[var(--fa-on-primary)] text-sm font-bold">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-8 pt-4 pb-2 border-b border-[var(--fa-outline-variant)]/15 bg-[var(--fa-background)] hidden lg:block transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fa-primary)] font-serif">{title}</h1>
              {subtitle && <p className="text-[var(--fa-on-surface-variant)] mt-1 font-medium text-sm">{subtitle}</p>}
            </div>
            {headerActions ? <div className="flex items-center gap-2 shrink-0">{headerActions}</div> : null}
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}

export function EmployeeShell(props: EmployeeShellProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--fa-background)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--fa-primary)] border-t-transparent" />
        </div>
      }
    >
      <EmployeeShellInner {...props} />
    </Suspense>
  )
}

