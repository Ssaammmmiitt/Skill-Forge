import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ButtonRaw from '../components/ui/ButtonRaw'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-raw-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="font-raw text-raw-white uppercase tracking-[4px] text-2xl text-center mb-16">
          SKILL FORGE
        </h1>

        <h2 className="font-raw text-raw-white uppercase tracking-[2px] text-5xl text-center mb-12">
          SIGN IN
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-white block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F0F0F0] border-[3px] border-raw-black font-mono text-[15px] px-3 py-2.5
                       focus:outline-none focus:border-[5px]"
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
              className="w-full bg-[#F0F0F0] border-[3px] border-raw-black font-mono text-[15px] px-3 py-2.5
                       focus:outline-none focus:border-[5px]"
              style={{ borderRadius: '0px' }}
              required
            />
          </div>

          <ButtonRaw size="lg" type="submit">
            SIGN IN
          </ButtonRaw>
        </form>

        <div className="mt-8 text-center space-y-3">
          <Link to="/register" className="font-mono text-raw-link text-sm underline block">
            Don't have an account? Register
          </Link>
          <div className="border-t border-[#333] pt-3 mt-3">
            <Link to="/" className="font-mono text-[#666] text-xs hover:text-raw-white block">
              [DEV] Skip to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
