import { useStudentStore } from '../../store/useStudentStore'
import BadgeArcade from '../ui/BadgeArcade'
import ThemeToggle from '../ui/ThemeToggle'
import BrandLogo from './BrandLogo'

const TopBar = () => {
  const student = useStudentStore((state) => state.student)

  return (
    <div className="h-14 bg-raw-surface border-b-[3px] border-raw-border flex items-center px-4 lg:px-6 gap-4">
      <div className="flex-1 flex justify-start min-w-0">
        <BrandLogo />
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <ThemeToggle className="hidden sm:flex" />
        <div className="font-mono text-raw-text-secondary text-xs uppercase tracking-[1px] hidden md:block">
        </div>
        <div className="font-raw text-raw-text text-xs uppercase tracking-[2px] hidden md:block">
          {student?.name || 'STUDENT'}
        </div>
        <BadgeArcade>LVL {student?.level || 1}</BadgeArcade>
      </div>
    </div>
  )
}

export default TopBar
