import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonRaw from '../components/ui/ButtonRaw'
import { useNotifStore } from '../store/useNotifStore'
import { useStudentStore } from '../store/useStudentStore'
import { useAuthStore } from '../store/useAuthStore'
import { getActivityTotals, logActivity } from '../api/student'
import { resolveStudentId } from '../utils/resolveStudentId'
import {
  previewStudyEffects,
  previewSleepEffects,
  emptyActivityTotals,
} from '../utils/activityPreview'
import ActivityPreviewNotes from '../components/activity/ActivityPreviewNotes'

const Logger = () => {
  const navigate = useNavigate()
  const addToast = useNotifStore(state => state.addToast)
  const applyActivityResult = useStudentStore(state => state.applyActivityResult)
  const refreshStudent = useStudentStore(state => state.refreshStudent)
  const student = useStudentStore(state => state.student)
  const user = useAuthStore(state => state.user)
  const studentId = resolveStudentId(user, student)

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

  const syncAfterActivity = async (result) => {
    if (result?.updated_attributes) {
      applyActivityResult(result.updated_attributes)
    }
    if (studentId) {
      await refreshStudent(studentId)
      await refreshActivityTotals()
    }
  }

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
        value: duration,
      })

      await syncAfterActivity(result)
      const intGain = result.delta?.INT || 0
      const energyCost = result.delta?.energy || 0
      addToast({
        message: intGain > 0
          ? `+${intGain} INT · -${Math.abs(energyCost)} ENERGY`
          : (result.notes?.[0] || 'No INT gained'),
        type: intGain > 0 ? 'info' : 'error',
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
        value: hours,
      })

      await syncAfterActivity(result)
      const energyGain = result.delta?.energy || 0
      addToast({
        message: energyGain > 0
          ? `+${energyGain} ENERGY`
          : (result.notes?.[0] || 'No energy gained'),
        type: energyGain > 0 ? 'info' : 'error',
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

  return (
    <div className="min-h-screen bg-raw-white">
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 right-6 font-raw text-[11px] uppercase tracking-[1px] text-raw-white bg-raw-black border-[3px] border-raw-white px-4 py-2 hover:bg-raw-white hover:text-raw-black hover:border-raw-black z-50"
        style={{ borderRadius: '0px' }}
      >
        ← EXIT
      </button>

      <div className="bg-raw-black px-8 py-10">
        <h1
          className="font-raw text-raw-white text-[48px] uppercase"
          style={{ lineHeight: '1.0', letterSpacing: '2px' }}
        >
          LOG ACTIVITY
        </h1>
        <p className="font-mono text-[#888] text-xs tracking-[2px] mt-2">
          RECORD YOUR REAL-WORLD ACTIONS
        </p>
      </div>

      <div className="border-b-[5px] border-raw-black px-8 py-10">
        <h2 className="font-raw text-[32px] text-raw-black uppercase mb-6">STUDY SESSION</h2>
        <div className="max-w-2xl space-y-6">
          <input
            type="text"
            value={studyTopic}
            onChange={(e) => setStudyTopic(e.target.value)}
            placeholder="MATHEMATICS"
            className="bg-raw-surface border-[3px] border-raw-border w-full font-mono text-[15px] px-3 py-2.5"
            style={{ borderRadius: '0px' }}
          />
          <input
            type="number"
            value={studyDuration}
            onChange={(e) => {
              setStudyDuration(e.target.value)
              setStudyError(false)
            }}
            placeholder="45"
            className="bg-raw-surface border-[3px] border-raw-border w-full font-mono text-[15px] px-3 py-2.5"
            style={{ borderRadius: '0px' }}
          />
          {studyDuration !== '' && (
            <div className="font-raw text-[24px] text-raw-black uppercase space-y-2">
              {studyPreview.intGain > 0 && <div>+{studyPreview.intGain} INTELLIGENCE</div>}
              {studyPreview.energyCost > 0 && (
                <div className="text-[14px]">−{studyPreview.energyCost} ENERGY</div>
              )}
              <ActivityPreviewNotes notes={studyPreview.notes} />
            </div>
          )}
          <ButtonRaw size="lg" onClick={handleStudySubmit} disabled={studyLoading}>
            {studyLoading ? 'LOGGING...' : 'LOG STUDY SESSION'}
          </ButtonRaw>
          {studyErrorMsg && <p className="font-mono text-raw-error text-sm">{studyErrorMsg}</p>}
        </div>
      </div>

      <div className="px-8 py-10">
        <h2 className="font-raw text-[32px] text-raw-black uppercase mb-6">SLEEP</h2>
        <div className="max-w-2xl space-y-6">
          <input
            type="number"
            step="0.5"
            value={sleepHours}
            onChange={(e) => {
              setSleepHours(e.target.value)
              setSleepError(false)
            }}
            placeholder="7.5"
            className="bg-raw-surface border-[3px] border-raw-border w-full font-mono text-[15px] px-3 py-2.5"
            style={{ borderRadius: '0px' }}
          />
          {sleepHours !== '' && (
            <div className="font-raw text-[24px] text-raw-black uppercase space-y-2">
              {sleepPreview.energyGain > 0 && <div>+{sleepPreview.energyGain} ENERGY</div>}
              <ActivityPreviewNotes
                notes={sleepPreview.notes}
                rateLabel={sleepPreview.rateLabel}
              />
            </div>
          )}
          <ButtonRaw size="lg" onClick={handleSleepSubmit} disabled={sleepLoading}>
            {sleepLoading ? 'LOGGING...' : 'LOG SLEEP'}
          </ButtonRaw>
          {sleepErrorMsg && <p className="font-mono text-raw-error text-sm">{sleepErrorMsg}</p>}
        </div>
      </div>
    </div>
  )
}

export default Logger
