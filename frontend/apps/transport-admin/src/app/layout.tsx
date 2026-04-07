import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' })
const playfair = Playfair_Display({ variable: '--font-newsreader', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Fleet Authority — Transport Admin',
  description: 'Haramaya University Fleet Management — Transport Administration Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} min-h-full antialiased`}>{children}</body>
    </html>
  )
}
