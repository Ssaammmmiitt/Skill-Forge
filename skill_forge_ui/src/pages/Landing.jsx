import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

const Landing = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    document.title = 'SKILL FORGE // Adaptive Learning Platform'
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const features = [
    {
      icon: '⚡',
      title: 'ADAPTIVE DIFFICULTY',
      description: 'Questions automatically adjust based on your performance in real-time'
    },
    {
      icon: '🧠',
      title: 'COGNITIVE TRACKING',
      description: 'Track INT, WIS, and energy attributes through your learning activities'
    },
    {
      icon: '🤖',
      title: 'ML-POWERED INSIGHTS',
      description: 'Machine learning identifies your unique learning style and patterns'
    },
    {
      icon: '📊',
      title: 'REAL-TIME ANALYTICS',
      description: 'Comprehensive analytics dashboard with performance visualization'
    },
    {
      icon: '🎯',
      title: 'PERSONALIZED PATHS',
      description: 'Custom learning recommendations based on your progress and goals'
    },
    {
      icon: '🏆',
      title: 'GAMIFIED PROGRESS',
      description: 'Earn XP, level up, maintain streaks, and compete on leaderboards'
    }
  ]

  return (
    <div className="min-h-screen bg-raw-bg">
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
                <Link
                  to="/register"
                  className="border-[5px] border-raw-border bg-raw-border text-raw-bg 
                           font-raw text-[16px] uppercase tracking-[2px] px-8 py-4
                           hover:bg-raw-hover hover:text-raw-text transition-colors duration-150
                           text-center"
                  style={{ borderRadius: '0px' }}
                >
                  START LEARNING
                </Link>
                <Link
                  to="/login"
                  className="border-[5px] border-raw-border bg-raw-bg text-raw-text 
                           font-raw text-[16px] uppercase tracking-[2px] px-8 py-4
                           hover:bg-raw-hover transition-colors duration-150
                           text-center"
                  style={{ borderRadius: '0px' }}
                >
                  SIGN IN
                </Link>
              </div>
            </div>

            {/* Right: Hero Visual */}
            <div className="hidden lg:block">
              <div className="border-[5px] border-raw-border p-8 bg-raw-surface">
                <div className="space-y-6">
                  <div className="border-l-[5px] border-raw-border pl-4">
                    <div className="font-mono text-raw-text-tertiary text-[12px] mb-2">
                      SESSION_001
                    </div>
                    <div className="font-mono text-raw-text text-[16px]">
                      Performance: <span className="text-raw-success">+15%</span>
                    </div>
                  </div>

                  <div className="border-l-[5px] border-raw-border pl-4">
                    <div className="font-mono text-raw-text-tertiary text-[12px] mb-2">
                      DIFFICULTY
                    </div>
                    <div className="flex gap-2">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 border-[2px] ${
                            i < 7 ? 'bg-raw-border border-raw-border' : 'border-raw-border'
                          }`}
                          style={{ borderRadius: '0px' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-l-[5px] border-raw-border pl-4">
                    <div className="font-mono text-raw-text-tertiary text-[12px] mb-2">
                      LEARNING_STYLE
                    </div>
                    <div className="font-raw text-raw-text text-[20px] uppercase tracking-[2px]">
                      FAST LEARNER
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border-[3px] border-raw-border p-6 bg-raw-surface 
                       hover:border-[5px] transition-all duration-150"
              style={{ borderRadius: '0px' }}
            >
              <div className="text-[48px] mb-4">{feature.icon}</div>
              <h3 className="font-raw text-raw-text text-[16px] uppercase tracking-[2px] mb-3">
                {feature.title}
              </h3>
              <p className="font-mono text-raw-text-secondary text-[14px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
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
          <Link
            to="/register"
            className="inline-block border-[5px] border-raw-border bg-raw-border text-raw-bg 
                     font-raw text-[18px] uppercase tracking-[2px] px-12 py-5
                     hover:bg-raw-hover hover:text-raw-text transition-colors duration-150"
            style={{ borderRadius: '0px' }}
          >
            GET STARTED FREE
          </Link>
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
    </div>
  )
}

export default Landing
