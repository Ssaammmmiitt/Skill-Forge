import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { register } from '../api/auth'
import { useGoogleSignIn } from '../hooks/useGoogleSignIn'
import ButtonOffset from '../components/ui/ButtonOffset'
import PasswordInput from '../components/ui/PasswordInput'
import UsernamePicker from '../components/auth/UsernamePicker'
import PublicHeader from '../components/layout/PublicHeader'

const Register = () => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const { renderGoogleButton, loading: googleLoading, error: googleError, isConfigured: isGoogleConfigured, isSdkLoaded } = useGoogleSignIn()

  // Extract first name for username suggestions
  const firstName = name.split(' ')[0] || ''

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // CREATE ACCOUNT'
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Render Google Button when SDK is ready
  useEffect(() => {
    if (isSdkLoaded && isGoogleConfigured) {
      renderGoogleButton('google-register-button', 'signup')
    }
  }, [isSdkLoaded, isGoogleConfigured])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!name.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await register({ name, username, email, password })
      const { token, user } = response
      setAuth(token, user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegisterFallback = () => {
    if (!isGoogleConfigured) {
      setError('Google Sign-In not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.')
      return
    }
    
    setError('Google Sign-In SDK is blocked by your browser extensions (e.g. adblocker) or network. Please disable them or allow accounts.google.com to sign up with Google, or use the email form above.')
  }

  const handleUsernameSelect = (selectedUsername) => {
    setUsername(selectedUsername)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-raw-bg flex flex-col">
      <PublicHeader showAuthLinks={false} />
      <div className="flex flex-1 flex-col lg:flex-row">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 border-r-[5px] border-raw-border">
        <div className="max-w-xl">
          <h1 className="font-raw text-raw-white uppercase tracking-[4px] text-[64px] leading-none mb-8">
            START<br/>LEARNING
          </h1>
          
          <div className="border-l-[5px] border-raw-white pl-6 mb-8">
            <p className="font-mono text-raw-white text-[16px] leading-relaxed mb-4">
              JOIN SKILL FORGE TODAY
            </p>
            <p className="font-mono text-[#999] text-[14px] leading-relaxed">
              Create your account and unlock personalized adaptive learning. 
              Track your progress, earn XP, level up, and discover your unique learning style.
            </p>
          </div>

          <div className="space-y-3 font-mono text-[#666] text-[12px]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-raw-white" style={{ borderRadius: '0px' }} />
              <span>Free account with unlimited quizzes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-raw-white" style={{ borderRadius: '0px' }} />
              <span>Real-time analytics and insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-raw-white" style={{ borderRadius: '0px' }} />
              <span>Personalized learning recommendations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-raw-white" style={{ borderRadius: '0px' }} />
              <span>Track your cognitive attributes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <h1 className="lg:hidden font-raw text-raw-white uppercase tracking-[4px] text-2xl text-center mb-12">
            SKILL FORGE
          </h1>

          <h2 className="font-raw text-raw-white uppercase tracking-[2px] text-4xl text-center mb-10">
            CREATE ACCOUNT
          </h2>

          {(error || googleError) && (
            <div className="mb-6 border-[3px] border-raw-error p-4" style={{ borderRadius: '0px' }}>
              <div className="font-raw text-raw-white text-[14px] uppercase">
                // ERROR //
              </div>
              <p className="font-mono text-[#FF6B6B] text-[12px] mt-2">
                {error || googleError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-white block mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-raw-surface border-[3px] border-raw-border font-mono text-[15px] px-3 py-2.5 text-raw-white
                         focus:outline-none focus:border-[5px] placeholder:text-raw-text-tertiary"
                style={{ borderRadius: '0px' }}
                required
              />
            </div>

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

            {/* Username Picker */}
            {firstName && (
              <UsernamePicker
                firstName={firstName}
                selectedUsername={username}
                onSelect={handleUsernameSelect}
                error={null}
              />
            )}

            <div>
              <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-white block mb-2">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-white block mb-2">
                Confirm Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <ButtonOffset
              size="lg"
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </ButtonOffset>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 border-b border-[#333]" />
              <span className="font-mono text-[#666] text-xs">OR</span>
              <div className="flex-1 border-b border-[#333]" />
            </div>

            {isSdkLoaded && isGoogleConfigured ? (
              <div className="w-full flex justify-center">
                <div id="google-register-button" className="w-full flex justify-center"></div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGoogleRegisterFallback}
                  disabled={googleLoading}
                  className="w-full bg-raw-surface border-[3px] border-raw-border py-3 px-4
                           hover:bg-raw-hover transition-colors duration-150
                           flex items-center justify-center gap-3 disabled:opacity-50"
                  style={{ borderRadius: '0px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                    <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05"/>
                    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.696 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
                  </svg>
                  <span className="font-mono text-raw-white text-sm">
                    {googleLoading ? 'Signing up...' : 'Sign up with Google'}
                  </span>
                </button>
                {!isGoogleConfigured && (
                  <p className="text-center font-mono text-[#999] text-[11px] mt-2">
                    Google Sign-In: Add VITE_GOOGLE_CLIENT_ID to .env
                  </p>
                )}
              </>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link to="/login" className="font-mono text-raw-white text-sm underline hover:text-[#999]">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Register
