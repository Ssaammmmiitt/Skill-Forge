// Helper to get current theme colors for components that can't use CSS variables directly
export const getThemeColors = () => {
  if (typeof window === 'undefined') return getDefaultDarkColors()
  
  const theme = document.documentElement.getAttribute('data-theme') || 'dark'
  
  if (theme === 'light') {
    return {
      // StarChart Light
      spaceBg: '#F0EDFF',
      spaceSurface: '#FFFFFF',
      spaceOverlay: '#D4C5FF',
      spaceNebula: '#7C3AED',
      spaceStar: '#CA8A04',
      spaceText: '#1E1B4B',
      
      // Arcade Light
      arcadePrimary: '#D97706',
      
      // Raw Light
      rawBg: '#FFFFFF',
      rawText: '#000000',
    }
  }
  
  return getDefaultDarkColors()
}

const getDefaultDarkColors = () => ({
  // StarChart Dark
  spaceBg: '#1E1B4B',
  spaceSurface: '#2E2A6E',
  spaceOverlay: '#3D3890',
  spaceNebula: '#A78BFA',
  spaceStar: '#FDE047',
  spaceText: '#E2DFFF',
  
  // Arcade Dark
  arcadePrimary: '#FDE047',
  
  // Raw Dark
  rawBg: '#000000',
  rawText: '#FFFFFF',
})
