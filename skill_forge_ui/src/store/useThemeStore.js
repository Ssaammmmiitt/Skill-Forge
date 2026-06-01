import { create } from 'zustand'
import { applyTheme, getStoredTheme } from '../utils/theme'

export const useThemeStore = create((set) => ({
  theme: getStoredTheme(),

  setTheme: (newTheme) => {
    localStorage.setItem('sf_theme', newTheme)
    applyTheme(newTheme)
    set({ theme: newTheme })
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('sf_theme', newTheme)
      applyTheme(newTheme)
      return { theme: newTheme }
    })
  },
}))
