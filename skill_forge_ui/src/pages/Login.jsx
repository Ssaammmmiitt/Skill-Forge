import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { login, googleLogin } from '../api/auth'
import ButtonRaw from '../components/ui/ButtonRaw'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // SIGN IN'
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError(null)
    try {
      const response = await login({ email, password })
      const { token, user } = response
      setAuth(token, user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setError('Google OAuth setup required: Add your Google Client ID to the backend')
    // In production, you'd load the Google Sign-In SDK here
    // Example: window.google.accounts.id.initialize({ ... })
  }

  return (
    <div className="min-h-screen bg-raw-black flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 border-r-[5px] border-raw-white">
        <div className="max-w-xl">
          <h1 className="font-raw text-raw-white uppercase tracking-[4px] text-[64px] leading-none mb-8">
            SKILL<br/>FORGE
          </h1>
          
          <div className="border-l-[5px] border-raw-white pl-6 mb-8">
            <p className="font-mono text-raw-white text-[16px] leading-relaxed mb-4">
              ADAPTIVE LEARNING PLATFORM
            </p>
            <p className="font-mono text-[#999] text-[14px] leading-relaxed">
              Real-time difficulty adjustment · Behavioral pattern recognition · 
              Machine learning-powered insights · Personalized learning paths
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="font-raw text-raw-white text-[24px] mt-1">↗</div>
              <div>
                <div className="font-raw text-raw-white text-[14px] uppercase tracking-[2px] mb-1">
                  ADAPTIVE ENGINE
                </div>
                <p className="font-mono text-[#666] text-[12px]">
                  Questions adjust based on your performance in real-time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="font-raw text-raw-white text-[24px] mt-1">↗</div>
              <div>
                <div className="font-raw text-raw-white text-[14px] uppercase tracking-[2px] mb-1">
                  COGNITIVE TRACKING
                </div>
                <p className="font-mono text-[#666] text-[12px]">
                  Track INT, WIS, and energy attributes through activities
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="font-raw text-raw-white text-[24px] mt-1">↗</div>
              <div>
                <div className="font-raw text-raw-white text-[14px] uppercase tracking-[2px] mb-1">
                  ML-POWERED INSIGHTS
                </div>
                <p className="font-mono text-[#666] text-[12px]">
                  Pattern detection identifies your learning style automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <h1 className="lg:hidden font-raw text-raw-white uppercase tracking-[4px] text-2xl text-center mb-16">
            SKILL FORGE
          </h1>

          <h2 className="font-raw text-raw-white uppercase tracking-[2px] text-5xl text-center mb-12">
            SIGN IN
          </h2>

          {error && (
            <div className="mb-6 border-[3px] border-raw-error p-4" style={{ borderRadius: '0px' }}>
              <div className="font-raw text-raw-white text-[14px] uppercase">
                // ERROR //
              </div>
              <p className="font-mono text-[#FF6B6B] text-[12px] mt-2">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-white block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-raw-surface border-[3px] border-raw-border font-mono text-[15px] px-3 py-2.5 text-raw-white
                         focus:outline-none focus:border-[5px] placeholder:text-raw-text-tertiary"
                style={{ borderRadius: '0px' }}
                required
              />
            </div>

            <div>
              <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-white block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-raw-surface border-[3px] border-raw-border font-mono text-[15px] px-3 py-2.5 text-raw-white
                         focus:outline-none focus:border-[5px] placeholder:text-raw-text-tertiary"
                style={{ borderRadius: '0px' }}
                required
              />
            </div>

            <ButtonRaw 
              size="lg" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </ButtonRaw>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 border-b border-[#333]" />
              <span className="font-mono text-[#666] text-xs">OR</span>
              <div className="flex-1 border-b border-[#333]" />
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-raw-surface border-[3px] border-raw-border py-3 px-4
                       hover:bg-raw-hover transition-colors duration-150
                       flex items-center justify-center gap-3"
              style={{ borderRadius: '0px' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05"/>
                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.696 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
              </svg>
              <span className="font-mono text-raw-white text-sm">
                Continue with Google
              </span>
            </button>
          </div>

          <div className="mt-8 text-center space-y-3">
            <Link to="/register" className="font-mono text-raw-white text-sm underline block hover:text-[#999]">
              Don't have an account? Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
