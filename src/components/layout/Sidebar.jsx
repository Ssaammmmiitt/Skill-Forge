import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { path: '/', label: 'DASHBOARD' },
  { path: '/profile', label: 'PROFILE' },
  { path: '/quiz', label: 'QUIZ' },
  { path: '/log', label: 'LOG ACTIVITY' },
  { path: '/path', label: 'LEARNING PATH' },
  { path: '/analytics', label: 'ANALYTICS' },
  { path: '/leaderboard', label: 'LEADERBOARD' },
]

export const Sidebar = () => {
  const location = useLocation()
  
  return (
    <div className="w-[200px] bg-surface-soft border-r border-hairline h-screen pt-10 px-6">
      <nav className="flex flex-col gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`font-mono text-xs uppercase tracking-[2px] transition-colors ${
              location.pathname === link.path
                ? 'text-ink'
                : 'text-muted hover:text-ink'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
