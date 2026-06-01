import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudent } from '../hooks/useStudent'
import { useAnalytics } from '../hooks/useAnalytics'
import MetricStar from '../components/ui/MetricStar'
import MetricArcade from '../components/ui/MetricArcade'
import ButtonOffset from '../components/ui/ButtonOffset'
import BadgeStar from '../components/ui/BadgeStar'
import ProgressStar from '../components/ui/ProgressStar'
import Spinner from '../components/ui/Spinner'

const Dashboard = () => {
  const navigate = useNavigate()
  const { student, loading: studentLoading } = useStudent()
  const { analytics, loading: analyticsLoading } = useAnalytics()

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // DASHBOARD'
  }, [])

  const scoreTrend = analytics?.score_trend || []
  const sessions = scoreTrend.map((score, idx) => ({
    topic: `Session ${idx + 1}`,
    quiz_score: score,
    difficulty: 5,
    time_taken: 120
  }))

  const calculateAccuracy = () => {
    if (scoreTrend.length === 0) return 0
    const avgScore = scoreTrend.reduce((sum, s) => sum + s, 0) / scoreTrend.length
    return Math.round(avgScore)
  }

  const formatDate = () => {
    const date = new Date()
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')} — SESSION ACTIVE`
  }

  const getDifficultyStatus = (difficulty) => {
    if (difficulty >= 1 && difficulty <= 4) return 'pending'
    if (difficulty >= 5 && difficulty <= 7) return 'completed'
    return 'completed'
  }

  if (studentLoading || !student) {
    return (
      <div className="min-h-full bg-space-deep flex items-center justify-center">
        <Spinner variant="star" size="lg" />
      </div>
    )
  }

  const xpPerLevel = 500
  const currentLevelXP = student.xp % xpPerLevel
  const xpProgress = (currentLevelXP / xpPerLevel) * 100
  const nextLevel = student.level + 1
  const xpToNextLevel = nextLevel * xpPerLevel

  return (
    <div className="min-h-full">
      
      {/* HERO SECTION - RawBlock brutal hero */}
      <section className="bg-raw-black px-20 pt-20 pb-16">
        <div className="font-raw text-raw-white text-[14px] uppercase tracking-[4px]">
          WELCOME BACK,
        </div>
        <h1
          className="font-raw text-raw-white text-[64px] uppercase"
          style={{ letterSpacing: '2px', lineHeight: '1.0' }}
        >
          {student.name}
        </h1>
        <div className="font-mono text-[#666] text-xs mt-4">
          {formatDate()}
        </div>
      </section>

      {/* RAW DIVIDER */}
      <div className="border-b-[5px] border-raw-white" />

      {/* STAT CARDS ROW - StarChart cosmic metrics */}
      <section className="bg-space-deep px-16 py-12">
        <div className="flex gap-8">
          <MetricStar label="TODAY'S XP" value="0" />
          <MetricStar label="QUIZ ACCURACY" value={`${calculateAccuracy()}%`} />
          <MetricStar label="STREAK" value={`×${student.streak}`} />
          <MetricStar label="ENERGY" value={student.energy} />
        </div>

        <div className="mt-8 max-w-2xl">
          <ProgressStar
            value={xpProgress}
            label={`LEVEL ${student.level} PROGRESS — ${student.xp} / ${xpToNextLevel} XP`}
          />
        </div>
      </section>

      {/* ARCADE SCORE BAND - Retro game stats */}
      <section
        className="border-t-[3px] border-b-[3px] px-10 py-8 border-dotted border-arcade-primary"
      >
        <div className="font-arcade text-[8px] text-arcade-secondary tracking-[3px] mb-6">
          GAME STATS
        </div>
        <div className="flex gap-6">
          <MetricArcade label="SESSIONS" value={scoreTrend.length} />
          <MetricArcade label="BEST SCORE" value={scoreTrend.length > 0 ? Math.max(...scoreTrend) : 0} />
          <MetricArcade label="RANK" value="#--" />
        </div>
      </section>

      {/* QUICK ACTIONS - RawBlock white action zone */}
      <section className="bg-raw-white px-12 py-12">
        <div className="font-raw text-raw-black text-[10px] uppercase tracking-[3px] mb-6">
          ACTIONS
        </div>
        <div className="flex flex-wrap gap-5 mt-2">
          <ButtonOffset size="md" className="m-0" onClick={() => navigate('/quiz')}>
            START QUIZ
          </ButtonOffset>
          <ButtonOffset size="md" className="m-0" onClick={() => navigate('/app/log')}>
            LOG ACTIVITY
          </ButtonOffset>
          <ButtonOffset size="md" className="m-0" onClick={() => navigate('/app/path')}>
            VIEW PATH
          </ButtonOffset>
        </div>
      </section>

      {/* RECENT SESSIONS - StarChart data display */}
      <section className="bg-space-deep px-16 py-12 pb-24">
        <div className="font-raw text-raw-white text-[10px] uppercase tracking-[3px] mb-8">
          RECENT SESSIONS
        </div>

        {sessions.length === 0 ? (
          <div className="font-mono text-raw-white text-xs">NO SESSIONS YET</div>
        ) : (
          sessions.map((session, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b border-space-overlay py-4"
          >
            <div className="font-raw uppercase tracking-[2px] text-raw-white text-sm flex-1">
              {session.topic}
            </div>
            <div className="font-mono text-space-nebula text-sm flex-1 text-center">
              {session.quiz_score} / 100
            </div>
            <div className="flex items-center gap-4 flex-1 justify-end">
              <BadgeStar status={getDifficultyStatus(session.difficulty)}>
                Difficulty {session.difficulty}
              </BadgeStar>
              <span className="font-mono text-[#999] text-xs">
                {Math.floor(session.time_taken / 60)}:{String(session.time_taken % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
          ))
        )}
      </section>
    </div>
  )
}

export default Dashboard
