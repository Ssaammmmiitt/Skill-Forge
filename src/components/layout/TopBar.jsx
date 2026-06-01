import { Badge } from '../ui/Badge'
import { useStudentStore } from '../../store/useStudentStore'

export const TopBar = () => {
  const { student } = useStudentStore()
  
  return (
    <div className="h-14 border-b border-hairline flex items-center justify-between px-6">
      <div className="font-display text-sm uppercase tracking-[6px] text-ink">
        SKILL FORGE
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-muted">
          {student?.name || 'Guest'}
        </span>
        <Badge>LVL {student?.level || 1}</Badge>
      </div>
    </div>
  )
}
