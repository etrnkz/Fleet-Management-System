import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Inter, Newsreader } from 'next/font/google'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' })
const newsreader = Newsreader({ variable: '--font-newsreader', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'HUFMS — Haramaya University Fleet Management',
  description: 'Unified Fleet Management System for Haramaya University',
  icons: { icon: '/hulogo.png', shortcut: '/hulogo.png', apple: '/hulogo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${newsreader.variable} min-h-full antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
