import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ButtonOffset from '../components/ui/ButtonOffset'
import { useNotifStore } from '../store/useNotifStore'
import { useStudentStore } from '../store/useStudentStore'
import { useAuthStore } from '../store/useAuthStore'
import { getActivityTotals, logActivity } from '../api/student'
import { resolveStudentId } from '../utils/resolveStudentId'
import {
  previewStudyEffects,
  previewSleepEffects,
  STUDY_MIN_MINUTES,
  emptyActivityTotals,
} from '../utils/activityPreview'
import ActivityPreviewNotes from '../components/activity/ActivityPreviewNotes'
import PageIntro from '../components/layout/PageIntro'

const Logger = () => {
  const addToast = useNotifStore(state => state.addToast)
  const applyActivityResult = useStudentStore(state => state.applyActivityResult)
  const refreshStudent = useStudentStore(state => state.refreshStudent)
  const student = useStudentStore(state => state.student)
  const user = useAuthStore(state => state.user)
  const studentId = resolveStudentId(user, student)

  const syncAfterActivity = async (result) => {
    if (result?.updated_attributes) {
      applyActivityResult(result.updated_attributes)
    }
    const sid = resolveStudentId(user, null)
    if (sid) {
      await refreshStudent(sid)
    }
  }

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // LOG ACTIVITY'
  }, [])

  const [studyTopic, setStudyTopic] = useState('')
  const [studyDuration, setStudyDuration] = useState('')
  const [studyError, setStudyError] = useState(false)
  const [studyLoading, setStudyLoading] = useState(false)
  const [studyErrorMsg, setStudyErrorMsg] = useState('')

  const [sleepHours, setSleepHours] = useState('')
  const [sleepError, setSleepError] = useState(false)
  const [sleepLoading, setSleepLoading] = useState(false)
  const [sleepErrorMsg, setSleepErrorMsg] = useState('')
  const [activityTotals, setActivityTotals] = useState(emptyActivityTotals)

  const refreshActivityTotals = useCallback(async () => {
    if (!studentId) return
    try {
      const totals = await getActivityTotals(studentId)
      setActivityTotals(totals)
    } catch {
      setActivityTotals(emptyActivityTotals())
    }
  }, [studentId])

  useEffect(() => {
    refreshActivityTotals()
  }, [refreshActivityTotals])


  const handleStudySubmit = async () => {
    const duration = parseFloat(studyDuration)
    if (!duration || duration <= 0) {
      setStudyError(true)
      return
    }

    setStudyLoading(true)
    setStudyErrorMsg('')
    try {
      const result = await logActivity({
        student_id: studentId,
        activity: 'study',
        value: duration
      })

      await syncAfterActivity(result)
      await refreshActivityTotals()
      const intGain = result.delta?.INT || 0
      const energyCost = result.delta?.energy || 0
      const note = result.notes?.[0]
      addToast({
        message: intGain > 0
          ? `+${intGain} INT · -${Math.abs(energyCost)} ENERGY`
          : (note || 'No INT gained'),
        type: intGain > 0 ? 'info' : 'error'
      })

      setStudyTopic('')
      setStudyDuration('')
      setStudyError(false)
    } catch (err) {
      setStudyErrorMsg(`FAILED - ${err.message}`)
    } finally {
      setStudyLoading(false)
    }
  }

  const handleSleepSubmit = async () => {
    const hours = parseFloat(sleepHours)
    if (!hours || hours <= 0) {
      setSleepError(true)
      return
    }

    setSleepLoading(true)
    setSleepErrorMsg('')
    try {
      const result = await logActivity({
        student_id: studentId,
        activity: 'sleep',
        value: hours
      })

      await syncAfterActivity(result)
      await refreshActivityTotals()
      const energyGain = result.delta?.energy || 0
      const note = result.notes?.[0]
      addToast({
        message: energyGain > 0
          ? `+${energyGain} ENERGY`
          : (note || 'No energy gained'),
        type: energyGain > 0 ? 'info' : 'error'
      })

      setSleepHours('')
      setSleepError(false)
    } catch (err) {
      setSleepErrorMsg(`FAILED - ${err.message}`)
    } finally {
      setSleepLoading(false)
    }
  }

  const studyPreview = previewStudyEffects(
    studyDuration,
    student?.energy ?? 0,
    activityTotals.study_int_today ?? 0
  )
  const sleepPreview = previewSleepEffects(sleepHours, student?.energy ?? 0, {
    sleepLoggedToday: activityTotals.sleep_logged_today,
  })
  const showStudyPreview =
    studyDuration !== '' && (studyPreview.intGain > 0 || studyPreview.notes.length > 0)
  const showSleepPreview =
    sleepHours !== '' && (sleepPreview.energyGain > 0 || sleepPreview.notes.length > 0)

  return (
    <motion.div
      className="min-h-screen bg-raw-bg p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="max-w-3xl mx-auto">
        <PageIntro
          title="LOG ACTIVITY"
          purpose="Record study and sleep outside quizzes. Study builds INT but costs energy; sleep restores energy best at 7–9 hours."
          steps={[
            `Study ${STUDY_MIN_MINUTES}+ min → INT (tapers after 45 min, daily cap 15)`,
            'Sleep → Energy: 10/h (7–9 h), 7/h (6–7 or 9–10 h), 4/h otherwise — one log per day',
            'Daily tasks → WIS on the Tasks page (max 5/day)',
          ]}
        />

        <div className="space-y-6">
          {/* Section 1: Study */}
          <div className="border-[3px] border-raw-border bg-raw-surface p-6" style={{ borderRadius: '0px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="font-raw text-[20px] text-raw-text-secondary">01</div>
              <h2 className="font-raw text-[20px] text-raw-text uppercase tracking-[1px]">
                STUDY SESSION
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-raw text-[10px] uppercase tracking-[1px] text-raw-text-secondary block mb-1">
                  SUBJECT
                </label>
                <input
                  type="text"
                  value={studyTopic}
                  onChange={(e) => setStudyTopic(e.target.value)}
                  placeholder="MATHEMATICS"
                  className="bg-raw-bg border-[2px] border-raw-border w-full font-mono text-[14px] px-3 py-2 text-raw-text focus:outline-none focus:border-[3px] placeholder:text-raw-text-tertiary"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div>
                <label className="font-raw text-[10px] uppercase tracking-[1px] text-raw-text-secondary block mb-1">
                  DURATION (MINUTES)
                </label>
                <input
                  type="number"
                  value={studyDuration}
                  onChange={(e) => {
                    setStudyDuration(e.target.value)
                    setStudyError(false)
                  }}
                  placeholder="45"
                  className={`bg-raw-bg w-full font-mono text-[14px] px-3 py-2 text-raw-text focus:outline-none placeholder:text-raw-text-tertiary ${studyError
                      ? 'border-[2px] border-raw-error'
                      : 'border-[2px] border-raw-border focus:border-[3px]'
                    }`}
                  style={{ borderRadius: '0px' }}
                />
                {studyError && (
                  <p className="font-mono text-[11px] text-raw-error mt-1">
                    ENTER A VALUE GREATER THAN 0
                  </p>
                )}
              </div>

              {showStudyPreview && (
                <div className="font-raw text-[14px] text-raw-text uppercase space-y-1">
                  {studyPreview.intGain > 0 && (
                    <div>+{studyPreview.intGain} INTELLIGENCE</div>
                  )}
                  {studyPreview.energyCost > 0 && (
                    <div className="text-raw-text-secondary text-[11px]">
                      −{studyPreview.energyCost} ENERGY (focus cost)
                    </div>
                  )}
                  <ActivityPreviewNotes notes={studyPreview.notes} />
                </div>
              )}

              <ButtonOffset
                size="md"
                className="mt-2"
                onClick={handleStudySubmit}
                disabled={studyLoading}
              >
                {studyLoading ? 'LOGGING...' : 'LOG STUDY SESSION'}
              </ButtonOffset>
              {studyErrorMsg && (
                <div className="font-raw text-raw-error text-[12px] uppercase tracking-[1px] border-[2px] border-raw-error p-3">
                  {studyErrorMsg}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Sleep */}
          <div className="border-[3px] border-raw-border bg-raw-surface p-6" style={{ borderRadius: '0px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="font-raw text-[20px] text-raw-text-secondary">02</div>
              <h2 className="font-raw text-[20px] text-raw-text uppercase tracking-[1px]">
                SLEEP
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-raw text-[10px] uppercase tracking-[1px] text-raw-text-secondary block mb-1">
                  HOURS SLEPT
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => {
                    setSleepHours(e.target.value)
                    setSleepError(false)
                  }}
                  placeholder="7.5"
                  className={`bg-raw-bg w-full font-mono text-[14px] px-3 py-2 text-raw-text focus:outline-none placeholder:text-raw-text-tertiary ${sleepError
                      ? 'border-[2px] border-raw-error'
                      : 'border-[2px] border-raw-border focus:border-[3px]'
                    }`}
                  style={{ borderRadius: '0px' }}
                />
                {sleepError && (
                  <p className="font-mono text-[11px] text-raw-error mt-1">
                    ENTER A VALUE GREATER THAN 0
                  </p>
                )}
              </div>

              {activityTotals.sleep_logged_today && (
                <p className="font-mono text-[11px] text-raw-text-tertiary">
                  Sleep already logged today — one entry per day.
                </p>
              )}

              {showSleepPreview && (
                <div className="font-raw text-[14px] text-raw-text uppercase space-y-1">
                  {sleepPreview.energyGain > 0 && (
                    <div>+{sleepPreview.energyGain} ENERGY</div>
                  )}
                  <ActivityPreviewNotes
                    notes={sleepPreview.notes}
                    rateLabel={sleepPreview.rateLabel}
                  />
                </div>
              )}

              <ButtonOffset
                size="md"
                className="mt-2"
                onClick={handleSleepSubmit}
                disabled={sleepLoading}
              >
                {sleepLoading ? 'LOGGING...' : 'LOG SLEEP'}
              </ButtonOffset>
              {sleepErrorMsg && (
                <div className="font-raw text-raw-error text-[12px] uppercase tracking-[1px] border-[2px] border-raw-error p-3">
                  {sleepErrorMsg}
                </div>
              )}
            </div>
          </div>

          <div className="border-[3px] border-raw-border bg-raw-surface p-6" style={{ borderRadius: '0px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="font-raw text-[20px] text-raw-text-secondary">03</div>
              <h2 className="font-raw text-[20px] text-raw-text uppercase tracking-[1px]">
                DAILY TASKS
              </h2>
            </div>
            <p className="font-mono text-[12px] text-raw-text-secondary leading-relaxed mb-4">
              Custom to-do lists live on a separate page - one list per day, your own labels.
            </p>
            <Link to="/app/tasks">
              <ButtonOffset size="md">OPEN DAILY TASKS →</ButtonOffset>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Logger
