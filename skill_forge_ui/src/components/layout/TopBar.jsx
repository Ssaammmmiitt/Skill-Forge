import { useStudentStore } from '../../store/useStudentStore'
import BadgeArcade from '../ui/BadgeArcade'

const TopBar = () => {
  const student = useStudentStore(state => state.student)

  return (
    <div
      className="h-14 bg-raw-black flex items-center justify-between px-8"
      style={{ borderBottom: '3px solid #000' }}
    >
      <div className="font-raw text-raw-white text-sm uppercase tracking-[3px]">
        SKILL FORGE
      </div>

      <div className="flex items-center gap-4">
        <div className="font-raw text-raw-white text-xs uppercase tracking-[2px]">
          {student?.name || 'STUDENT'}
        </div>
        <BadgeArcade>LVL {student?.level || 1}</BadgeArcade>
      </div>
    </div>
  )
}

export default TopBar
