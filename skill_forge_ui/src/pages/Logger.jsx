import { useState, useEffect } from 'react'
import ButtonOffset from '../components/ui/ButtonOffset'
import { useNotifStore } from '../store/useNotifStore'
import { useStudentStore } from '../store/useStudentStore'
import { useAuthStore } from '../store/useAuthStore'
import { logActivity } from '../api/student'

const Logger = () => {
  const addToast = useNotifStore(state => state.addToast)
  const applyActivityResult = useStudentStore(state => state.applyActivityResult)
  const refreshStudent = useStudentStore(state => state.refreshStudent)
  const user = useAuthStore(state => state.user)

  const syncAfterActivity = async (result) => {
    if (result?.updated_attributes) {
      applyActivityResult(result.updated_attributes)
    }
    if (user?.student_id) {
      await refreshStudent(user.student_id)
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

  const [tasks, setTasks] = useState([
    { id: 1, label: 'COMPLETE PRACTICE PROBLEM SET', checked: false },
    { id: 2, label: 'REVIEW SESSION NOTES', checked: false },
    { id: 3, label: 'WATCH LECTURE RECAP', checked: false },
    { id: 4, label: 'SUBMIT WRITTEN SUMMARY', checked: false },
    { id: 5, label: 'PEER REVIEW EXCHANGE', checked: false }
  ])

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
        student_id: user?.student_id,
        activity: 'study',
        value: duration
      })
      
      await syncAfterActivity(result)
      const intGain = result.delta?.INT || 0
      addToast({
        message: `+${intGain} INT`,
        type: 'info'
      })

      setStudyTopic('')
      setStudyDuration('')
      setStudyError(false)
    } catch (err) {
      setStudyErrorMsg(`FAILED — ${err.message}`)
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
        student_id: user?.student_id,
        activity: 'sleep',
        value: hours
      })
      
      await syncAfterActivity(result)
      const energyGain = result.delta?.energy || 0
      addToast({
        message: `+${energyGain} ENERGY`,
        type: 'info'
      })

      setSleepHours('')
      setSleepError(false)
    } catch (err) {
      setSleepErrorMsg(`FAILED — ${err.message}`)
    } finally {
      setSleepLoading(false)
    }
  }

  const handleTasksSubmit = async () => {
    const checkedCount = tasks.filter(t => t.checked).length
    if (checkedCount === 0) return

    try {
      const result = await logActivity({
        student_id: user?.student_id,
        activity: 'task_done',
        value: checkedCount
      })
      
      await syncAfterActivity(result)
      const wisGain = result.delta?.WIS || 0
      addToast({
        message: `+${wisGain} WIS`,
        type: 'info'
      })

      setTasks(tasks.map(t => ({ ...t, checked: false })))
    } catch (err) {
      addToast({
        message: `FAILED — ${err.message}`,
        type: 'error'
      })
    }
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, checked: !t.checked } : t))
  }

  const checkedCount = tasks.filter(t => t.checked).length
  const studyDelta = studyDuration > 0 ? Math.round(parseFloat(studyDuration) * 0.4) : 0
  const sleepDelta = sleepHours > 0 ? Math.min(100, Math.round(parseFloat(sleepHours) * 12)) : 0

  return (
    <div className="min-h-screen bg-raw-bg p-6">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-raw text-raw-text text-[32px] uppercase tracking-[2px] mb-2">
            LOG ACTIVITY
          </h1>
          <p className="font-mono text-raw-text-secondary text-[13px] tracking-[1px]">
            RECORD YOUR REAL-WORLD ACTIONS
          </p>
        </div>

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
                  className={`bg-raw-bg w-full font-mono text-[14px] px-3 py-2 text-raw-text focus:outline-none placeholder:text-raw-text-tertiary ${
                    studyError
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

              {studyDelta > 0 && (
                <div className="font-raw text-[18px] text-raw-text uppercase">
                  +{studyDelta} INTELLIGENCE
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
                  className={`bg-raw-bg w-full font-mono text-[14px] px-3 py-2 text-raw-text focus:outline-none placeholder:text-raw-text-tertiary ${
                    sleepError
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

              {sleepDelta > 0 && (
                <div className="font-raw text-[18px] text-raw-text uppercase">
                  +{sleepDelta} ENERGY
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

          {/* Section 3: Tasks */}
          <div className="border-[3px] border-raw-border bg-raw-surface p-6" style={{ borderRadius: '0px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="font-raw text-[20px] text-raw-text-secondary">03</div>
              <h2 className="font-raw text-[20px] text-raw-text uppercase tracking-[1px]">
                TASKS COMPLETED
              </h2>
            </div>

            <div className="space-y-2 mb-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="border-b-[2px] border-raw-border py-3 flex items-center gap-3 cursor-pointer hover:bg-raw-hover"
                >
                  <div
                    className={`w-4 h-4 border-[2px] border-raw-border flex items-center justify-center ${
                      task.checked ? 'bg-raw-border' : 'bg-raw-bg'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    {task.checked && (
                      <span className="font-raw text-raw-bg text-[10px]">✓</span>
                    )}
                  </div>
                  <label className="font-raw text-raw-text text-[11px] uppercase tracking-[1px] cursor-pointer">
                    {task.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="font-mono text-raw-text-secondary text-[12px] mb-3">
              TASKS COMPLETED: {checkedCount} / 5
            </div>

            {checkedCount > 0 && (
              <div className="font-raw text-[18px] text-raw-text uppercase mb-4">
                +{checkedCount * 5} WISDOM
              </div>
            )}

            <ButtonOffset size="md" className="mt-2" onClick={handleTasksSubmit}>
              LOG TASKS
            </ButtonOffset>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Logger
