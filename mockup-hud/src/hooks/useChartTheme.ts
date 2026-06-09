import { useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export function useChartTheme() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return useMemo(() => ({
    isDark,
    tooltip: { bg: isDark ? '#0a0c12' : '#ffffff', border: isDark ? '#1a2030' : '#e2e8f0', text: isDark ? '#e2e8f0' : '#1e293b' },
    axis: { label: isDark ? '#4b5563' : '#64748b', line: isDark ? '#1a2030' : '#e2e8f0', split: isDark ? '#1a2030' : '#f1f5f9' },
    legend: { text: isDark ? '#6b7280' : '#64748b' },
    brand: isDark ? '#2563eb' : '#1d4ed8',
    ok: isDark ? '#22c55e' : '#16a34a',
    warn: isDark ? '#f59e0b' : '#d97706',
    crit: isDark ? '#ef4444' : '#dc2626',
    info: isDark ? '#06b6d4' : '#0891b2',
    key: theme, // use as React key to force re-render
  }), [isDark, theme])
}
