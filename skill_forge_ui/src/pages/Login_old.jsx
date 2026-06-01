import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getStudent } from '../api/student'
import ButtonRaw from '../components/ui/ButtonRaw'

const Login = () => {
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const setUser = useAuthStore(state => state.setUser)

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // SIGN IN'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!studentId.trim()) return

    setLoading(true)
    setError(null)
    try {
      const student = await getStudent(studentId)
      setUser({ student_id: studentId, ...student })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Student not found')
    } finally {
      setLoading(false)
    }
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
              Student ID
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g., mock-abc-123"
              className="w-full bg-raw-surface border-[3px] border-raw-border font-mono text-[15px] px-3 py-2.5 text-raw-white
                       focus:outline-none focus:border-[5px] placeholder:text-raw-text-tertiary"
              style={{ borderRadius: '0px' }}
              required
            />
          </div>

          {error && (
            <div className="font-raw text-raw-white text-[14px] uppercase mt-4">
              // STUDENT NOT FOUND //
            </div>
          )}

          <ButtonRaw 
            size="lg" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'LOADING...' : 'SIGN IN'}
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
