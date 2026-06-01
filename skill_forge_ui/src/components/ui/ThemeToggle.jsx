import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../store/useThemeStore'

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 shrink-0 rounded-lg bg-raw-surface animate-pulse ${className}`}
        aria-hidden
      />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all text-raw-text
        ${isDark ? 'bg-raw-surface hover:bg-raw-hover' : 'bg-raw-hover hover:bg-raw-surface'}
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -30 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun size={20} strokeWidth={2} aria-hidden />
          ) : (
            <Moon size={20} strokeWidth={2} aria-hidden />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}

export default ThemeToggle
