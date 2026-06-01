import { useStudentStore } from '../../store/useStudentStore'
import BadgeArcade from '../ui/BadgeArcade'

const TopBar = () => {
  const student = useStudentStore(state => state.student)

  return (
    <div
      className="h-14 bg-raw-surface border-b-[3px] border-raw-border flex items-center justify-between px-8"
    >
      <div className="font-raw text-raw-text text-sm uppercase tracking-[3px]">
        SKILL FORGE
      </div>

      <div className="flex items-center gap-4">
        <div className="font-raw text-raw-text text-xs uppercase tracking-[2px]">
          {student?.name || 'STUDENT'}
        </div>
        <BadgeArcade>LVL {student?.level || 1}</BadgeArcade>
      </div>
    </div>
  )
}

export default TopBar
