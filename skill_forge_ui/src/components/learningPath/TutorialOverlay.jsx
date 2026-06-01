import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ButtonStar from '../ui/ButtonStar'

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: 'Welcome to Your Learning Path',
    description: 'This is your cognitive skill universe. Each skill represents a mastery level that evolves with your progress.',
    highlight: 'overall',
    position: 'center'
  },
  {
    id: 2,
    title: 'Interactive Skill Nodes',
    description: 'Click on any skill node to view detailed information. Hover over nodes to see them glow!',
    highlight: 'constellation',
    position: 'left'
  },
  {
    id: 3,
    title: 'Skill Status Colors',
    description: 'Yellow = Mastered (80%+), Purple = Learning (50%+), Blue = Started, Gray = Locked',
    highlight: 'legend',
    position: 'bottom'
  },
  {
    id: 4,
    title: 'Progress Tracking',
    description: 'Watch the rings around each skill fill up as you improve. Complete quizzes to level up!',
    highlight: 'constellation',
    position: 'right'
  },
  {
    id: 5,
    title: 'Skill Recommendations',
    description: 'Check the recommendations panel to see which skills to focus on next based on your current progress.',
    highlight: 'recommendations',
    position: 'right'
  }
]

const TutorialOverlay = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('sf_learning_path_tutorial')
    if (!hasSeenTutorial) {
      setTimeout(() => setIsVisible(true), 500)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const handleClose = () => {
    localStorage.setItem('sf_learning_path_tutorial', 'true')
    setIsVisible(false)
    if (onComplete) onComplete()
  }

  const currentTutorial = TUTORIAL_STEPS[currentStep]

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-space-deep z-40"
            onClick={handleSkip}
          />

          {/* Tutorial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div
              className="bg-space-surface border-2 border-space-nebula rounded-xl p-8"
              style={{
                boxShadow: '0 0 40px rgba(167, 139, 250, 0.6)'
              }}
            >
              {/* Step indicator */}
              <div className="flex justify-center gap-2 mb-6">
                {TUTORIAL_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? 'w-8 bg-space-star'
                        : idx < currentStep
                        ? 'w-2 bg-space-nebula'
                        : 'w-2 bg-space-overlay'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="font-space text-[20px] text-space-star mb-3">
                  {currentTutorial.title}
                </h3>
                <p className="font-body-space text-space-text text-sm leading-relaxed">
                  {currentTutorial.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkip}
                  className="font-body-space text-space-text-secondary text-sm hover:text-space-nebula transition-colors"
                >
                  Skip Tutorial
                </button>
                <ButtonStar
                  size="md"
                  variant="primary"
                  onClick={handleNext}
                >
                  {currentStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Get Started'}
                </ButtonStar>
              </div>

              {/* Progress text */}
              <div className="text-center mt-4">
                <span className="font-mono text-space-text-secondary text-xs">
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TutorialOverlay
