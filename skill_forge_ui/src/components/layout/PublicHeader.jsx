import ThemeToggle from '../ui/ThemeToggle'
import BrandLogo from './BrandLogo'
import ButtonOffset from '../ui/ButtonOffset'
import { useNavigate } from 'react-router-dom'

const PublicHeader = ({ showAuthLinks = true }) => {
  const navigate = useNavigate()

  return (
    <header className="border-b-[3px] border-raw-border bg-raw-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
        <div className="flex-1 flex justify-start min-w-0">
          <BrandLogo />
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <ThemeToggle />
          {showAuthLinks && (
            <div className="hidden sm:flex items-center gap-3">
              <ButtonOffset size="sm" onClick={() => navigate('/login')}>
                Sign in
              </ButtonOffset>
              <ButtonOffset size="sm" onClick={() => navigate('/register')}>
                Register
              </ButtonOffset>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default PublicHeader
