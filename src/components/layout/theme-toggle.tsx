'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { IconButton } from '@/components/ui/button'

interface ThemeToggleProps {
  className?: string
}

/** Utilidade global do PageHeader: `moon` no tema claro, `sun` no escuro. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <IconButton
      icon={isDark ? 'sun' : 'moon'}
      label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
      className={className}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    />
  )
}
