import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

const brandClass =
  'font-space font-bold text-xl md:text-2xl text-raw-text uppercase tracking-[2px] hover:opacity-90 transition-opacity'

const BrandLogo = ({ className = '' }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const to = isAuthenticated ? '/dashboard' : '/'

  return (
    <Link to={to} className={`${brandClass} ${className}`}>
      SKILL FORGE
    </Link>
  )
}

export default BrandLogo
