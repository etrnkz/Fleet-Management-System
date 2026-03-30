import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Maintenance | HUFMS',
  description: 'Fleet Maintenance Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
