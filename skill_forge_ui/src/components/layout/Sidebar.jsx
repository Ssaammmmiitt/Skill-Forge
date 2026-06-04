import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStudentStore } from '../../store/useStudentStore'
import { useAuthStore } from '../../store/useAuthStore'
import ProgressRaw from '../ui/ProgressRaw'
import ThemeToggle from '../ui/ThemeToggle'
import ButtonOffset from '../ui/ButtonOffset'
import { getLevelInfo } from '../../utils/formatters'
import { XP_PER_LEVEL } from '../../utils/constants'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const student = useStudentStore(state => state.student)
  const logout = useAuthStore(state => state.logout)
  const clearStudent = useStudentStore(state => state.clearStudent)

  const handleLogout = () => {
    clearStudent()
    logout()
    navigate('/login')
  }

  const navLinks = [
    { path: '/dashboard', label: 'DASHBOARD' },
    { path: '/app/profile', label: 'PROFILE' },
    { path: '/quiz', label: 'QUIZ' },
    { path: '/app/tasks', label: 'DAILY TASKS' },
    { path: '/app/log', label: 'LOG ACTIVITY' },
    { path: '/app/reader', label: 'DOC READER' },
    { path: '/app/path', label: 'LEARNING PATH' },
    { path: '/app/analytics', label: 'ANALYTICS' },
    { path: '/app/leaderboard', label: 'LEADERBOARD' },
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
        {(() => {
          const levelInfo = getLevelInfo(student?.xp || 0, XP_PER_LEVEL)
          const displayLevel = student?.level ?? levelInfo.currentLevel
          return (
            <>
              <div className="font-mono text-[10px] text-raw-text-tertiary uppercase mb-2">
                LEVEL {displayLevel} XP
              </div>
              <ProgressRaw
                value={levelInfo.progress}
              />
              <div className="font-mono text-[10px] text-raw-text-secondary mt-1">
                {levelInfo.currentLevelXP} / {levelInfo.xpForNextLevel} XP
              </div>
            </>
          )
        })()}
      </div>

      <div className="px-6 pb-6 flex justify-center">
        <ThemeToggle />
      </div>

      <div className="px-6 pb-8">
        <ButtonOffset size="md" className="w-full" onClick={handleLogout}>
          LOGOUT
        </ButtonOffset>
      </div>
    </div>
  )
}

export default Sidebar
