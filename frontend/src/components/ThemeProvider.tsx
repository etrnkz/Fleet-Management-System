'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ThemeContextType = { isDark: boolean; toggle: () => void }
const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggle: () => {} })

export function useTheme() { return useContext(ThemeContext) }

interface ThemeProviderProps {
  children: React.ReactNode
  storageKey?: string // per-role key e.g. 'theme_transport_admin'
}

export function ThemeProvider({ children, storageKey = 'theme' }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      // Remove dark if this role prefers light
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [storageKey])

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem(storageKey, 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem(storageKey, 'light')
      }
      return next
    })
  }

  return <ThemeContext.Provider value={{ isDark, toggle }}>{children}</ThemeContext.Provider>
}
