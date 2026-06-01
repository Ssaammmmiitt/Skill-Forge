import { Link, useLocation } from 'react-router-dom'
import { useStudentStore } from '../../store/useStudentStore'
import ProgressRaw from '../ui/ProgressRaw'
import { calculateLevelProgress } from '../../utils/formatters'
import { XP_PER_LEVEL } from '../../utils/constants'

const Sidebar = () => {
  const location = useLocation()
  const student = useStudentStore(state => state.student)

  const navLinks = [
    { path: '/', label: 'DASHBOARD' },
    { path: '/profile', label: 'PROFILE' },
    { path: '/quiz', label: 'QUIZ' },
    { path: '/log', label: 'LOG ACTIVITY' },
    { path: '/path', label: 'LEARNING PATH' },
    { path: '/analytics', label: 'ANALYTICS' },
    { path: '/leaderboard', label: 'LEADERBOARD' },
    { path: '/admin', label: 'ADMIN' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div
      className="w-[220px] bg-raw-black h-screen flex flex-col"
      style={{ borderRight: '3px solid #fff' }}
    >
      <div className="pt-10 flex-1">
        <div className="font-raw text-[10px] uppercase text-[#666] tracking-[2px] px-6 mb-4">
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
                hover:bg-[#111]
                ${
                  isActive(link.path)
                    ? 'border-l-raw-white bg-raw-white text-raw-black'
                    : 'border-l-transparent text-raw-white hover:border-l-raw-white'
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-6 pb-8">
        <div className="font-mono text-[10px] text-[#666] uppercase mb-2">
          XP PROGRESS
        </div>
        <ProgressRaw
          value={calculateLevelProgress(student?.xp || 0, XP_PER_LEVEL)}
        />
        <div className="font-mono text-[10px] text-[#999] mt-1">
          {student?.xp || 0} / {XP_PER_LEVEL}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
