import { create } from 'zustand'

export const useThemeStore = create((set) => {
  // Check localStorage for saved theme preference
  const savedTheme = localStorage.getItem('sf_theme') || 'dark'
  
  // Apply theme to document root on init
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', savedTheme)
  }

  return {
    theme: savedTheme,
    setTheme: (newTheme) => {
      localStorage.setItem('sf_theme', newTheme)
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newTheme)
      }
      set({ theme: newTheme })
    },
    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark'
        localStorage.setItem('sf_theme', newTheme)
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', newTheme)
        }
        return { theme: newTheme }
      })
    }
  }
})
