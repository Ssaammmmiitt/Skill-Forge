import { StatCard } from '../components/ui/StatCard'
import { useStudentStore } from '../store/useStudentStore'

export default function Dashboard() {
  const { student } = useStudentStore()
  
  return (
    <div className="bg-canvas min-h-screen">
      <h1 className="font-display text-[48px] uppercase tracking-[3px] text-ink mb-8">
        DASHBOARD
      </h1>
      
      <div className="grid grid-cols-4 gap-6 mb-12">
        <StatCard label="INTELLIGENCE" value={student?.INT || 0} />
        <StatCard label="WISDOM" value={student?.WIS || 0} />
        <StatCard label="ENERGY" value={student?.energy || 0} unit="%" />
        <StatCard label="XP" value={student?.xp || 0} />
      </div>
      
      <div className="text-muted font-mono text-[11px] uppercase tracking-[2px]">
        COMING IN PHASE 2
      </div>
    </div>
  )
}
