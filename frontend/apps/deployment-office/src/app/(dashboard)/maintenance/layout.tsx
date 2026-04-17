'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const subNav = [
  { href: '/maintenance/overview', label: 'Overview' },
  { href: '/maintenance/requests', label: 'Requests' },
  { href: '/maintenance/schedule', label: 'Schedule' },
  { href: '/maintenance/costs', label: 'Costs' },
  { href: '/maintenance/reports', label: 'Reports' },
]

export default function MaintenanceSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <p className="text-sm text-gray-500 mb-3">
          Fleet maintenance — deployment office and maintenance team workflows in one place.
        </p>
        <nav className="flex flex-wrap gap-2">
          {subNav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#1B3D2F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      {children}
    </div>
  )
}
