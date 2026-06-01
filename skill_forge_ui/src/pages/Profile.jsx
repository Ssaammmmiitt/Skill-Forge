import { useEffect } from 'react'
import { useStudent } from '../hooks/useStudent'
import BadgeStar from '../components/ui/BadgeStar'
import BadgeArcade from '../components/ui/BadgeArcade'
import ProgressStar from '../components/ui/ProgressStar'
import StatRing from '../components/ui/StatRing'
import Spinner from '../components/ui/Spinner'
import { getLevelInfo } from '../utils/formatters'
import { XP_PER_LEVEL } from '../utils/constants'

const Profile = () => {
  const { student, loading, error } = useStudent()

  // Document title
  useEffect(() => {
    document.title = `SKILL FORGE // ${student?.name || 'PROFILE'}`
  }, [student?.name])

  const learningStyleMap = {
    fast_learner: 'completed',
    slow_learner: 'pending',
    conceptual: 'pending',
    memorization: 'locked'
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-full bg-space-deep flex items-center justify-center">
        <Spinner variant="star" size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full bg-space-deep px-16 py-20">
        <p className="font-body-space text-space-error text-sm mt-4">
          {error}
        </p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-full bg-space-deep flex items-center justify-center">
        <p className="font-body-space text-space-nebula text-sm">
          No student data available
        </p>
      </div>
    )
  }

  const levelInfo = getLevelInfo(student.xp, XP_PER_LEVEL)
  const mockSessions = student.recent_sessions || []

  return (
    <div className="min-h-full bg-space-deep">
      <div className="max-w-[1200px] mx-auto px-16">
        
        {/* SECTION 1: IDENTITY BAND */}
        <section className="py-20">
          <div
            className="w-20 h-20 rounded-circle bg-space-overlay border-[2px] border-space-nebula flex items-center justify-center"
            style={{ boxShadow: '0 0 16px rgba(167,139,250,0.4)' }}
          >
            <span className="font-space font-bold text-[32px] text-raw-white uppercase">
              {getInitials(student.name)}
            </span>
          </div>

          <h1 className="font-space font-bold text-[36px] text-raw-white mt-6">
            {student.name}
          </h1>

          <div className="mt-2">
            <BadgeStar status={learningStyleMap[student.learning_style] || 'locked'}>
              {student.learning_style.replace('_', ' ')}
            </BadgeStar>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-raw text-raw-white text-sm uppercase tracking-[2px]">
              LEVEL {levelInfo.currentLevel}
            </span>
            <span className="text-space-nebula">·</span>
            <span className="font-mono text-space-nebula text-sm">
              {levelInfo.totalXP} XP TOTAL
            </span>
          </div>

          <div className="mt-3 w-64">
            <ProgressStar
              value={levelInfo.progress}
              label={`${levelInfo.currentLevelXP} / ${levelInfo.xpForNextLevel} XP TO LEVEL ${levelInfo.currentLevel + 1}`}
            />
          </div>
        </section>

        {/* SECTION 2: DIVIDER */}
        <div className="border-b border-space-overlay" />

        {/* SECTION 3: COGNITIVE ATTRIBUTES */}
        <section className="py-20">
          <div className="mb-10">
            <h2 className="font-space font-bold text-[28px] text-raw-white">
              Cognitive Attributes
            </h2>
            <p className="font-body-space text-[14px] text-space-nebula mt-1">
              YOUR LEARNING DNA — UPDATED AFTER EVERY SESSION
            </p>
          </div>

          <div className="flex items-start gap-10">
            <div className="flex flex-col items-center">
              <StatRing label="INT" value={student.INT} size={120} system="star" />
              <div className="font-space font-bold text-[20px] text-raw-white mt-4">
                {student.INT}
              </div>
              <div className="font-body-space text-[12px] text-space-nebula uppercase">
                Intelligence
              </div>
            </div>

            <div className="flex flex-col items-center">
              <StatRing label="WIS" value={student.WIS} size={120} system="star" />
              <div className="font-space font-bold text-[20px] text-raw-white mt-4">
                {student.WIS}
              </div>
              <div className="font-body-space text-[12px] text-space-nebula uppercase">
                Wisdom
              </div>
            </div>

            <div className="flex flex-col items-center">
              <StatRing label="ENERGY" value={student.energy} size={120} system="star" />
              <div className="font-space font-bold text-[20px] text-raw-white mt-4">
                {student.energy}
              </div>
              <div className="font-body-space text-[12px] text-space-nebula uppercase">
                Energy
              </div>
            </div>

            <div className="flex flex-col items-center">
              <StatRing label="XP" value={Math.min(100, Math.floor(student.xp / 10))} size={120} system="star" />
              <div className="font-space font-bold text-[20px] text-raw-white mt-4">
                {Math.min(100, Math.floor(student.xp / 10))}
              </div>
              <div className="font-body-space text-[12px] text-space-nebula uppercase">
                XP Score
              </div>
            </div>

            <div className="flex flex-col items-center">
              <StatRing label="LEVEL" value={student.level * 10} size={120} system="star" />
              <div className="font-space font-bold text-[20px] text-raw-white mt-4">
                {student.level * 10}
              </div>
              <div className="font-body-space text-[12px] text-space-nebula uppercase">
                Level Score
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DIVIDER */}
        <div className="border-b border-space-overlay" />

        {/* SECTION 5: RECENT SESSIONS */}
        <section className="py-16 pb-24">
          <h2 className="font-space font-bold text-[28px] text-raw-white mb-8">
            Recent Sessions
          </h2>

          {mockSessions.map((session, index) => (
            <div
              key={index}
              className="border-b border-space-overlay py-4 flex justify-between items-center"
            >
              <div className="font-raw text-raw-white text-sm uppercase tracking-[2px]">
                {session.topic}
              </div>
              <div className="font-mono text-space-nebula text-sm">
                {session.quiz_score} / 100
              </div>
              <div>
                <BadgeArcade>LVL {session.difficulty}</BadgeArcade>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default Profile
