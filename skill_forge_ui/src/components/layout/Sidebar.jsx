import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStudentStore } from '../../store/useStudentStore'
import { useAuthStore } from '../../store/useAuthStore'
import ProgressRaw from '../ui/ProgressRaw'
import ThemeToggle from '../ui/ThemeToggle'
import { calculateLevelProgress } from '../../utils/formatters'
import { XP_PER_LEVEL } from '../../utils/constants'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const student = useStudentStore(state => state.student)
  const logout = useAuthStore(state => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { path: '/dashboard', label: 'DASHBOARD' },
    { path: '/app/profile', label: 'PROFILE' },
    { path: '/quiz', label: 'QUIZ' },
    { path: '/app/log', label: 'LOG ACTIVITY' },
    { path: '/app/path', label: 'LEARNING PATH' },
    { path: '/app/analytics', label: 'ANALYTICS' },
    { path: '/app/leaderboard', label: 'LEADERBOARD' },
    { path: '/app/admin', label: 'ADMIN' },
  ]

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div
      className="w-[220px] bg-raw-surface h-screen flex flex-col border-r-[3px] border-raw-border"
    >
      <div className="pt-10 flex-1">
        <div className="font-raw text-[10px] uppercase text-raw-text-tertiary tracking-[2px] px-6 mb-4">
          NAVIGATION
        </div>

        <nav>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                font-raw text-xs uppercase tracking-[2px]
                block px-6 py-3
                border-l-[3px]
                transition-colors duration-150
                ${
                  isActive(link.path)
                    ? 'border-l-raw-border bg-raw-hover text-raw-text'
                    : 'border-l-transparent text-raw-text hover:bg-raw-hover hover:border-l-raw-border'
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-6 pb-6">
        <div className="font-mono text-[10px] text-raw-text-tertiary uppercase mb-2">
          XP PROGRESS
        </div>
        <ProgressRaw
          value={calculateLevelProgress(student?.xp || 0, XP_PER_LEVEL)}
        />
        <div className="font-mono text-[10px] text-raw-text-secondary mt-1">
          {student?.xp || 0} / {XP_PER_LEVEL}
        </div>
      </div>

      <div className="px-6 pb-6">
        <ThemeToggle />
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={handleLogout}
          className="w-full border-[3px] border-raw-border bg-raw-surface py-3 px-4 
                   font-raw text-xs uppercase tracking-[2px] text-raw-white
                   hover:bg-raw-hover transition-colors duration-150"
          style={{ borderRadius: '0px' }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  )
}

export default Sidebar
