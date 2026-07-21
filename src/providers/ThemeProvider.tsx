import { type ReactNode, useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react'

import { STORAGE_KEYS } from '@/constants'
import { ThemeContext } from '@/contexts/theme-context'
import { isTheme } from '@/lib/utils'
import { useAppDispatch } from '@/store/hooks'
import { setTheme as setThemeAction } from '@/store/slices/uiSlice'
import type { Theme } from '@/types'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredTheme(fallback: Theme): Theme {
  if (typeof window === 'undefined') return fallback
  const stored = localStorage.getItem(STORAGE_KEYS.theme)
  return isTheme(stored) ? stored : fallback
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const dispatch = useAppDispatch()
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme(defaultTheme))
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme())

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  const applyTheme = useEffectEvent((resolved: 'light' | 'dark') => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved
  })

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    dispatch(setThemeAction(theme))
  }, [dispatch, theme])

  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemTheme(getSystemTheme())
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEYS.theme, next)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
