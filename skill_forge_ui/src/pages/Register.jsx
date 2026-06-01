import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ButtonStar from '../components/ui/ButtonStar'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-space-deep flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="font-space text-space-nebula text-2xl text-center mb-16">
          SKILL FORGE
        </h1>

        <h2 className="font-space font-bold text-[36px] text-raw-white text-center mb-12">
          CREATE ACCOUNT
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-body-space text-[14px] font-semibold text-space-nebula block mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-space-sunken border-[2px] border-space-overlay rounded-md
                       font-body-space text-[16px] text-space-text px-4 py-2.5
                       focus:outline-none focus:border-space-nebula"
              style={{ boxShadow: 'none' }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 8px rgba(167,139,250,0.3)'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
              }}
              required
            />
          </div>

          <div>
            <label className="font-body-space text-[14px] font-semibold text-space-nebula block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-space-sunken border-[2px] border-space-overlay rounded-md
                       font-body-space text-[16px] text-space-text px-4 py-2.5
                       focus:outline-none focus:border-space-nebula"
              style={{ boxShadow: 'none' }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 8px rgba(167,139,250,0.3)'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
              }}
              required
            />
          </div>

          <div>
            <label className="font-body-space text-[14px] font-semibold text-space-nebula block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-space-sunken border-[2px] border-space-overlay rounded-md
                       font-body-space text-[16px] text-space-text px-4 py-2.5
                       focus:outline-none focus:border-space-nebula"
              style={{ boxShadow: 'none' }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 8px rgba(167,139,250,0.3)'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
              }}
              required
            />
          </div>

          <ButtonStar size="lg" variant="primary" type="submit">
            CREATE ACCOUNT
          </ButtonStar>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="font-body-space text-space-nebula underline text-sm">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
