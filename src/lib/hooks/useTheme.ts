'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Read stored theme
    const stored = localStorage.getItem('ihera-theme') as Theme | null
    const initial = stored || 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('ihera-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return { theme, toggleTheme }
}