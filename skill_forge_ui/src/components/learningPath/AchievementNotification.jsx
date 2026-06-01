import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const ACHIEVEMENTS = {
  started: {
    title: 'First Steps!',
    description: 'You\'ve begun your journey in {skill}',
    icon: '🎯',
    color: '#60A5FA'
  },
  learning: {
    title: 'Making Progress!',
    description: '{skill} reached 50% mastery',
    icon: '📈',
    color: '#A78BFA'
  },
  mastered: {
    title: 'Skill Mastered!',
    description: '{skill} achieved 80% mastery',
    icon: '⭐',
    color: '#FDE047'
  },
  allMastered: {
    title: 'Legendary Achievement!',
    description: 'All skills mastered. You\'re a cognitive master!',
    icon: '👑',
    color: '#FDE047'
  }
}

const AchievementNotification = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!achievement) return null

  const achievementData = ACHIEVEMENTS[achievement.type]
  if (!achievementData) return null

  const description = achievementData.description.replace('{skill}', achievement.skillName || '')

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 15 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
        >
          <div
            className="bg-space-surface border-2 rounded-xl p-6 shadow-2xl"
            style={{
              borderColor: achievementData.color,
              boxShadow: `0 0 30px ${achievementData.color}80`
            }}
          >
            <div className="flex items-start gap-4">
              {/* Icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                className="text-[48px]"
              >
                {achievementData.icon}
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-space text-[18px] mb-1"
                  style={{ color: achievementData.color }}
                >
                  {achievementData.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-body-space text-space-text text-sm"
                >
                  {description}
                </motion.p>

                {/* Progress indicator */}
                {achievement.mastery && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-3 h-1.5 bg-space-deep rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${achievement.mastery}%`,
                        backgroundColor: achievementData.color
                      }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="text-space-text-secondary hover:text-space-text transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Sparkle effects */}
            {achievement.type === 'mastered' && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: [0, (Math.random() - 0.5) * 100],
                      y: [0, (Math.random() - 0.5) * 100]
                    }}
                    transition={{
                      delay: 0.6 + i * 0.1,
                      duration: 1,
                      ease: 'easeOut'
                    }}
                    className="absolute text-[20px]"
                    style={{
                      left: '50%',
                      top: '50%',
                      pointerEvents: 'none'
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to track achievements
export const useAchievements = (allSkills, getSkillMastery, getSkillStatus) => {
  const [achievements, setAchievements] = useState([])
  const [previousMasteries, setPreviousMasteries] = useState({})

  useEffect(() => {
    if (!allSkills || allSkills.length === 0) return

    const currentMasteries = {}
    const newAchievements = []

    allSkills.forEach(skill => {
      const currentMastery = getSkillMastery(skill.id)
      const previousMastery = previousMasteries[skill.id] || 0
      const currentStatus = getSkillStatus(skill.id)
      const previousStatus = previousMastery >= 80 ? 'mastered' : previousMastery >= 50 ? 'learning' : previousMastery > 0 ? 'started' : 'locked'

      currentMasteries[skill.id] = currentMastery

      // Check for milestone achievements
      if (currentStatus !== previousStatus) {
        if (currentStatus === 'started' && previousStatus === 'locked') {
          newAchievements.push({
            type: 'started',
            skillName: skill.name,
            mastery: currentMastery
          })
        } else if (currentStatus === 'learning' && previousStatus === 'started') {
          newAchievements.push({
            type: 'learning',
            skillName: skill.name,
            mastery: currentMastery
          })
        } else if (currentStatus === 'mastered' && previousStatus === 'learning') {
          newAchievements.push({
            type: 'mastered',
            skillName: skill.name,
            mastery: currentMastery
          })
        }
      }
    })

    // Check if all skills are mastered
    const allMastered = allSkills.every(skill => getSkillMastery(skill.id) >= 80)
    const previousAllMastered = Object.values(previousMasteries).every(m => m >= 80)
    
    if (allMastered && !previousAllMastered && Object.keys(previousMasteries).length > 0) {
      newAchievements.push({
        type: 'allMastered'
      })
    }

    if (newAchievements.length > 0) {
      setPreviousMasteries(currentMasteries)
      setAchievements(prev => [...prev, ...newAchievements])
    }
  }, [allSkills, getSkillMastery, getSkillStatus])

  const removeAchievement = (index) => {
    setAchievements(prev => prev.filter((_, i) => i !== index))
  }

  return { achievements, removeAchievement }
}

export default AchievementNotification
