import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStudent } from '../hooks/useStudent'
import PageIntro from '../components/layout/PageIntro'
import CardStar from '../components/ui/CardStar'
import BadgeStar from '../components/ui/BadgeStar'
import ProgressStar from '../components/ui/ProgressStar'
import ButtonStar from '../components/ui/ButtonStar'
import Spinner from '../components/ui/Spinner'
import {
  SKILL_TREE,
  getAllSkills,
  getSkillMastery,
  getSkillStatus,
  buildAttributesFromStudent,
  SKILL_DESCRIPTIONS,
} from '../utils/learningPathSkills'

const STATUS_COLORS = {
  mastered: '#FDE047',
  learning: '#A78BFA',
  started: '#60A5FA',
  locked: '#4B4876',
}

const LearningPath = () => {
  const { student, loading, error, refetch } = useStudent()
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    document.title = 'SKILL FORGE // LEARNING PATH'
  }, [])

  const allSkills = getAllSkills()
  const attrs = buildAttributesFromStudent(student)
  const avgMastery =
    allSkills.length > 0
      ? allSkills.reduce((sum, s) => sum + getSkillMastery(student, s.id), 0) / allSkills.length
      : 0

  const selected = allSkills.find((s) => s.id === selectedId)
  const pathFocus = student?.learning_path?.focus || 'Complete quizzes to unlock personalized guidance.'

  if (loading) {
    return (
      <div className="min-h-full bg-space-deep flex items-center justify-center">
        <Spinner variant="star" size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full bg-space-deep px-8 py-10">
        <PageIntro
          title="LEARNING PATH"
          purpose="See how your INT, WIS, and Energy map to cognitive skills, and what to practice next."
        />
        <p className="font-body-space text-space-error text-sm">{error}</p>
        <ButtonStar className="mt-4" onClick={refetch}>
          Retry
        </ButtonStar>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-full bg-space-deep px-8 py-10">
        <p className="font-body-space text-space-nebula text-sm">Loading your profile…</p>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-space-deep px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <PageIntro
          title="LEARNING PATH"
          purpose="This is your skill roadmap-not a separate game. Progress comes from your real stats (INT, WIS, Energy) and quiz history. The AI suggests what to focus on next."
          steps={[
            'Higher INT → logic & problem-solving',
            'Higher WIS → comprehension & wisdom',
            'Higher Energy → attention & consistency',
            'Take quizzes to move skills from Locked → Mastered',
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <CardStar>
            <p className="font-body-space text-xs text-space-text-secondary mb-1">Average mastery</p>
            <p className="font-space text-2xl text-space-star">{Math.round(avgMastery)}%</p>
            <ProgressStar value={avgMastery} className="mt-2" />
          </CardStar>
          <CardStar>
            <p className="font-body-space text-xs text-space-text-secondary mb-1">Quizzes completed</p>
            <p className="font-space text-2xl text-space-nebula">{student.sessions_completed ?? 0}</p>
          </CardStar>
          <CardStar>
            <p className="font-body-space text-xs text-space-text-secondary mb-1">Learning style (ML)</p>
            <p className="font-space text-lg text-space-star capitalize">
              {(student.learning_style || 'unknown').replace(/_/g, ' ')}
            </p>
          </CardStar>
        </div>

        <CardStar className="mb-8 border border-space-nebula/30">
          <h3 className="font-space text-lg text-space-star mb-2">AI recommendation</h3>
          <p className="font-body-space text-sm text-space-nebula leading-relaxed">{pathFocus}</p>
          {student.learning_path?.task_types?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {student.learning_path.task_types.map((t) => (
                <BadgeStar key={t} status="learning">
                  {t.replace(/_/g, ' ')}
                </BadgeStar>
              ))}
            </div>
          )}
          <Link to="/quiz" className="inline-block mt-4">
            <ButtonStar size="sm">Take a quiz →</ButtonStar>
          </Link>
        </CardStar>

        {SKILL_TREE.map((tier) => (
          <section key={tier.tier} className="mb-10">
            <h2 className="font-space text-xl text-space-nebula mb-4">{tier.tier}</h2>
            <div className="space-y-3">
              {tier.skills.map((skill) => {
                const mastery = getSkillMastery(student, skill.id)
                const status = getSkillStatus(mastery)
                const isSelected = selectedId === skill.id
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => setSelectedId(skill.id)}
                    className={`w-full text-left rounded-xl p-4 transition-colors border-2 ${isSelected
                        ? 'border-space-star bg-space-overlay'
                        : 'border-transparent bg-space-sunken hover:bg-space-overlay'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl" aria-hidden>
                        {skill.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-space text-base text-raw-white">{skill.name}</span>
                          <BadgeStar status={status === 'locked' ? 'locked' : status}>
                            {status}
                          </BadgeStar>
                        </div>
                        <ProgressStar value={mastery} />
                        <p className="font-mono text-xs text-space-text-secondary mt-1">
                          {mastery}% · tied to {skill.attr.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ))}

        <CardStar variant="achievement">
          {selected ? (
            <div>
              <div className="text-4xl mb-2">{selected.icon}</div>
              <h3 className="font-space text-xl text-space-star mb-2">{selected.name}</h3>
              <p className="font-body-space text-sm text-space-nebula mb-4">
                {SKILL_DESCRIPTIONS[selected.id]}
              </p>
              <p className="font-body-space text-xs text-space-text-secondary">
                Current value: {attrs[selected.attr] ?? 0}/100 (from your live attributes)
              </p>
            </div>
          ) : (
            <p className="font-body-space text-sm text-space-text-secondary text-center py-4">
              Select a skill above to read how it connects to your stats.
            </p>
          )}
        </CardStar>

        <div className="flex flex-wrap gap-4 mt-6 text-xs font-body-space text-space-text-secondary">
          <span>
            <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: STATUS_COLORS.mastered }} />
            Mastered 80%+
          </span>
          <span>
            <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: STATUS_COLORS.learning }} />
            Learning 50%+
          </span>
          <span>
            <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: STATUS_COLORS.started }} />
            Started
          </span>
          <span>
            <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: STATUS_COLORS.locked }} />
            Locked (0%)
          </span>
        </div>
      </div>
    </div>
  )
}

export default LearningPath
