import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import PublicHeader from '../components/layout/PublicHeader'
import ButtonOffset from '../components/ui/ButtonOffset'
import StaggerSection, { StaggerItem } from '../components/motion/StaggerSection'

const Landing = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [difficultyLevel, setDifficultyLevel] = useState(7)
  const [learningStyle, setLearningStyle] = useState('fast_learner')
  const [performance, setPerformance] = useState(85)

  useEffect(() => {
    document.title = 'SKILL FORGE // Adaptive Learning Platform'
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const learningStyles = [
    { id: 'fast_learner', label: 'FAST LEARNER', color: 'raw-success' },
    { id: 'slow_learner', label: 'METHODICAL', color: 'raw-warning' },
    { id: 'conceptual', label: 'CONCEPTUAL', color: 'space-nebula' },
    { id: 'memorization', label: 'MEMORIZER', color: 'arcade-primary' }
  ]

  const handleDifficultyClick = (level) => {
    setDifficultyLevel(level + 1)
    // Simulate performance change based on difficulty
    const newPerformance = Math.max(50, Math.min(95, 85 - (level * 3)))
    setPerformance(newPerformance)
  }

  const features = [
    {
      code: 'ADP',
      title: 'ADAPTIVE DIFFICULTY',
      description: 'Questions automatically adjust based on your performance in real-time'
    },
    {
      code: 'COG',
      title: 'COGNITIVE TRACKING',
      description: 'Track INT, WIS, and energy attributes through your learning activities'
    },
    {
      code: 'ML',
      title: 'ML-POWERED INSIGHTS',
      description: 'Machine learning identifies your unique learning style and patterns'
    },
    {
      code: 'ANL',
      title: 'REAL-TIME ANALYTICS',
      description: 'Comprehensive analytics dashboard with performance visualization'
    },
    {
      code: 'PTH',
      title: 'PERSONALIZED PATHS',
      description: 'Custom learning recommendations based on your progress and goals'
    },
    {
      code: 'XP',
      title: 'GAMIFIED PROGRESS',
      description: 'Earn XP, level up, maintain streaks, and compete on leaderboards'
    }
  ]

  return (
    <motion.div
      className="min-h-screen bg-raw-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <PublicHeader />
      {/* Hero Section */}
      <div className="relative border-b-[5px] border-raw-border">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div>
              <div className="font-raw text-raw-border text-[14px] uppercase tracking-[3px] mb-6">
                ADAPTIVE LEARNING PLATFORM
              </div>
              
              <h1 className="font-raw text-raw-text uppercase tracking-[4px] text-[56px] lg:text-[72px] leading-none mb-8">
                SKILL<br/>FORGE
              </h1>

              <p className="font-mono text-raw-text-secondary text-[18px] leading-relaxed mb-12 max-w-xl">
                An intelligent learning platform that adapts to you. Train smarter with real-time difficulty 
                adjustment, behavioral pattern recognition, and machine learning-powered insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <ButtonOffset size="lg" onClick={() => navigate('/register')}>
                  Start learning
                </ButtonOffset>
                <ButtonOffset size="lg" onClick={() => navigate('/login')}>
                  Sign in
                </ButtonOffset>
              </div>
            </div>

            {/* Right: Interactive Hero Visual */}
            <div className="hidden lg:block">
              <div className="border-[5px] border-raw-border p-8 bg-raw-surface">
                <div className="space-y-6">
                  {/* Performance Indicator */}
                  <div className="border-l-[5px] border-raw-border pl-4">
                    <div className="font-mono text-raw-text-tertiary text-[12px] mb-2">
                      CURRENT PERFORMANCE
                    </div>
                    <div className="font-mono text-raw-text text-[24px]">
                      {performance}%
                    </div>
                    <div className="w-full bg-raw-bg border-[2px] border-raw-border h-2 mt-2" style={{ borderRadius: '0px' }}>
                      <div 
                        className="bg-raw-success h-full transition-all duration-300" 
                        style={{ width: `${performance}%`, borderRadius: '0px' }}
                      />
                    </div>
                  </div>

                  {/* Interactive Difficulty Selector */}
                  <div className="border-l-[5px] border-raw-border pl-4">
                    <div className="font-mono text-raw-text-tertiary text-[12px] mb-2">
                      DIFFICULTY LEVEL: {difficultyLevel}/10
                    </div>
                    <div className="flex gap-2">
                      {[...Array(10)].map((_, i) => {
                        const filled = i < difficultyLevel
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleDifficultyClick(i)}
                            className={`w-8 h-8 border-[2px] transition-all duration-200 cursor-pointer
                              ${filled
                                ? 'bg-[var(--difficulty-filled-bg)] border-[var(--difficulty-filled-border)]'
                                : 'bg-[var(--difficulty-empty-bg)] border-[var(--difficulty-empty-border)] hover:opacity-80'
                              }`}
                            style={{ borderRadius: '0px' }}
                            aria-label={`Difficulty level ${i + 1}${filled ? ', active' : ''}`}
                            aria-pressed={filled}
                          />
                        )
                      })}
                    </div>
                    <p className="font-mono text-raw-text-tertiary text-[10px] mt-2">
                      Click to adjust difficulty
                    </p>
                  </div>

                  {/* Learning Style Selector */}
                  <div className="border-l-[5px] border-raw-border pl-4">
                    <div className="font-mono text-raw-text-tertiary text-[12px] mb-3">
                      LEARNING STYLE
                    </div>
                    <div className="space-y-2">
                      {learningStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setLearningStyle(style.id)}
                          className={`w-full text-left px-3 py-2 border-[2px] transition-all duration-200
                            ${learningStyle === style.id 
                              ? 'bg-raw-border border-raw-border' 
                              : 'border-raw-border hover:bg-raw-hover'
                            }`}
                          style={{ borderRadius: '0px' }}
                        >
                          <span className={`font-raw text-[12px] uppercase tracking-[1px] ${
                            learningStyle === style.id ? 'text-raw-bg' : 'text-raw-text'
                          }`}>
                            {style.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-raw text-raw-text uppercase tracking-[3px] text-[36px] mb-4">
            FEATURES
          </h2>
          <p className="font-mono text-raw-text-secondary text-[16px] max-w-2xl mx-auto">
            Powered by machine learning and adaptive algorithms for personalized learning experiences
          </p>
        </div>

        <StaggerSection className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
            <div
              className="border-[3px] border-raw-border p-6 bg-raw-surface 
                       hover:border-[5px] transition-all duration-150"
              style={{ borderRadius: '0px' }}
            >
              <div
                className="border-[3px] border-raw-border w-14 h-14 flex items-center justify-center mb-4 bg-raw-bg"
                style={{ borderRadius: '0px' }}
              >
                <span className="font-raw text-raw-text text-[13px] tracking-[2px]">
                  {feature.code}
                </span>
              </div>
              <h3 className="font-raw text-raw-text text-[16px] uppercase tracking-[2px] mb-3">
                {feature.title}
              </h3>
              <p className="font-mono text-raw-text-secondary text-[14px] leading-relaxed">
                {feature.description}
              </p>
            </div>
            </StaggerItem>
          ))}
        </StaggerSection>
      </div>

      {/* How It Works */}
      <div className="border-t-[5px] border-raw-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="font-raw text-raw-text uppercase tracking-[3px] text-[36px] mb-4">
              HOW IT WORKS
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="border-[5px] border-raw-border w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <span className="font-raw text-raw-text text-[32px]">1</span>
              </div>
              <h3 className="font-raw text-raw-text text-[18px] uppercase tracking-[2px] mb-3">
                CREATE ACCOUNT
              </h3>
              <p className="font-mono text-raw-text-secondary text-[14px]">
                Sign up for free and set your learning goals
              </p>
            </div>

            <div className="text-center">
              <div className="border-[5px] border-raw-border w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <span className="font-raw text-raw-text text-[32px]">2</span>
              </div>
              <h3 className="font-raw text-raw-text text-[18px] uppercase tracking-[2px] mb-3">
                START LEARNING
              </h3>
              <p className="font-mono text-raw-text-secondary text-[14px]">
                Take quizzes that adapt to your skill level in real-time
              </p>
            </div>

            <div className="text-center">
              <div className="border-[5px] border-raw-border w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <span className="font-raw text-raw-text text-[32px]">3</span>
              </div>
              <h3 className="font-raw text-raw-text text-[18px] uppercase tracking-[2px] mb-3">
                TRACK PROGRESS
              </h3>
              <p className="font-mono text-raw-text-secondary text-[14px]">
                Monitor your growth with detailed analytics and insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-t-[5px] border-raw-border bg-raw-surface">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-raw text-raw-text text-[48px] mb-2">∞</div>
              <div className="font-mono text-raw-text-secondary text-[14px] uppercase tracking-[1px]">
                QUESTIONS
              </div>
            </div>
            <div>
              <div className="font-raw text-raw-text text-[48px] mb-2">10</div>
              <div className="font-mono text-raw-text-secondary text-[14px] uppercase tracking-[1px]">
                DIFFICULTY LEVELS
              </div>
            </div>
            <div>
              <div className="font-raw text-raw-text text-[48px] mb-2">4</div>
              <div className="font-mono text-raw-text-secondary text-[14px] uppercase tracking-[1px]">
                LEARNING STYLES
              </div>
            </div>
            <div>
              <div className="font-raw text-raw-text text-[48px] mb-2">24/7</div>
              <div className="font-mono text-raw-text-secondary text-[14px] uppercase tracking-[1px]">
                AVAILABLE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t-[5px] border-raw-border">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="font-raw text-raw-text uppercase tracking-[3px] text-[42px] mb-6">
            READY TO BEGIN?
          </h2>
          <p className="font-mono text-raw-text-secondary text-[18px] mb-12 max-w-2xl mx-auto">
            Join the adaptive learning revolution. Create your free account and start your journey today.
          </p>
          <ButtonOffset size="lg" onClick={() => navigate('/register')}>
            Get started free
          </ButtonOffset>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-[5px] border-raw-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-mono text-raw-text-tertiary text-[12px]">
              © 2026 SKILL FORGE. ALL RIGHTS RESERVED.
            </div>
            <div className="flex gap-6">
              <Link
                to="/login"
                className="font-mono text-raw-text-secondary text-[12px] uppercase tracking-[1px] hover:text-raw-text"
              >
                SIGN IN
              </Link>
              <Link
                to="/register"
                className="font-mono text-raw-text-secondary text-[12px] uppercase tracking-[1px] hover:text-raw-text"
              >
                REGISTER
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Landing
