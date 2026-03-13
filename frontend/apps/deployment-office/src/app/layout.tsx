import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Deployment Office Portal - HUFMS',
  description: 'Haramaya University Fleet Management System - Deployment Office Portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
