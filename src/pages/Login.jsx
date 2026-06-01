import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  
  const handleLogin = () => {
    // Mock login - navigate to dashboard
    navigate('/')
  }
  
  return (
    <div className="bg-canvas min-h-screen flex flex-col items-center justify-center px-4">
      <div className="font-display text-sm tracking-[6px] uppercase text-ink mb-12">
        SKILL FORGE
      </div>
      
      <div className="w-full max-w-md">
        <h1 className="font-display text-[32px] tracking-[2px] uppercase text-ink mb-8">
          SIGN IN
        </h1>
        
        <div className="space-y-6 mb-8">
          <div>
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-hairline-strong text-ink font-body text-base py-3 placeholder-muted focus:border-ink focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-hairline-strong text-ink font-body text-base py-3 placeholder-muted focus:border-ink focus:outline-none transition-colors"
            />
          </div>
        </div>
        
        <Button onClick={handleLogin}>
          SIGN IN
        </Button>
        
        <div className="mt-6 text-center">
          <Link to="/register" className="text-link font-mono text-sm">
            Don't have an account? Create one
          </Link>
        </div>
      </div>
    </div>
  )
}
