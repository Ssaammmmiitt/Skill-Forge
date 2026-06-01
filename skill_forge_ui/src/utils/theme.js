const STORAGE_KEY = 'sf_theme'

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function initTheme() {
  const theme = getStoredTheme()
  applyTheme(theme)
  return theme
}
