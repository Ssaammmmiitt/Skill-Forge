export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Calculate level from total XP
export const calculateLevel = (totalXP, xpPerLevel = 500) => {
  return Math.floor(totalXP / xpPerLevel) + 1
}

// Calculate XP within current level (e.g., 350 out of 500)
export const calculateCurrentLevelXP = (totalXP, xpPerLevel = 500) => {
  return totalXP % xpPerLevel
}

// Calculate XP needed for next level
export const calculateXPForNextLevel = (xpPerLevel = 500) => {
  return xpPerLevel
}

// Calculate progress percentage within current level
export const calculateLevelProgress = (totalXP, xpPerLevel = 500) => {
  const currentLevelXP = calculateCurrentLevelXP(totalXP, xpPerLevel)
  return (currentLevelXP / xpPerLevel) * 100
}

// Get full level info object
export const getLevelInfo = (totalXP, xpPerLevel = 500) => {
  const currentLevel = calculateLevel(totalXP, xpPerLevel)
  const currentLevelXP = calculateCurrentLevelXP(totalXP, xpPerLevel)
  const xpForNextLevel = xpPerLevel
  const progress = calculateLevelProgress(totalXP, xpPerLevel)
  
  return {
    currentLevel,
    currentLevelXP,
    xpForNextLevel,
    progress,
    totalXP
  }
}
