import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { PushNotificationPrompt } from '../components/PushNotificationPrompt'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' })
const playfair = Playfair_Display({ variable: '--font-newsreader', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'HUFMS — System Admin',
  description: 'Haramaya University Fleet Management — System Administration',
  icons: {
    icon: '/hulogo.png',
    shortcut: '/hulogo.png',
    apple: '/hulogo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <PushNotificationPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}
