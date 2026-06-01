import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonRaw from '../components/ui/ButtonRaw'
import { useNotifStore } from '../store/useNotifStore'
import { useStudentStore } from '../store/useStudentStore'
import { useAuthStore } from '../store/useAuthStore'
import { logActivity } from '../api/student'

const Logger = () => {
  const navigate = useNavigate()
  const addToast = useNotifStore(state => state.addToast)
  const updateAttributes = useStudentStore(state => state.updateAttributes)
  const user = useAuthStore(state => state.user)

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
      
      const delta = result.delta || {}
      updateAttributes(delta)
      
      const intGain = delta.INT || 0
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

  const handleSleepSubmit = () => {
    const hours = parseFloat(sleepHours)
    if (!hours || hours <= 0) {
      setSleepError(true)
      return
    }

    const energyGain = Math.min(100, Math.round(hours * 12))
    updateAttributes({ energy: energyGain })
    addToast({
      message: `+${energyGain} ENERGY`,
      type: 'info'
    })

    setSleepHours('')
    setSleepError(false)
  }

  const handleTasksSubmit = () => {
    const checkedCount = tasks.filter(t => t.checked).length
    if (checkedCount === 0) return

    const wisGain = checkedCount * 5
    updateAttributes({ WIS: wisGain })
    addToast({
      message: `+${wisGain} WIS`,
      type: 'info'
    })

    setTasks(tasks.map(t => ({ ...t, checked: false })))
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, checked: !t.checked } : t))
  }

  const checkedCount = tasks.filter(t => t.checked).length
  const studyDelta = studyDuration > 0 ? Math.round(parseFloat(studyDuration) * 0.4) : 0
  const sleepDelta = sleepHours > 0 ? Math.min(100, Math.round(parseFloat(sleepHours) * 12)) : 0

  return (
    <div className="min-h-screen bg-raw-white">
      {/* Exit Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 right-6 font-raw text-[11px] uppercase tracking-[1px] text-raw-white bg-raw-black border-[3px] border-raw-white px-4 py-2 hover:bg-raw-white hover:text-raw-black hover:border-raw-black z-50"
        style={{ borderRadius: '0px' }}
      >
        ← EXIT
      </button>
      {/* Page Header */}
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

      {/* Section 1: Study */}
      <div className="border-b-[5px] border-raw-black px-8 py-10">
        <div className="relative mb-6">
          <div
            className="font-raw text-[48px] text-raw-text-secondary absolute top-0 left-0"
            style={{ lineHeight: '1.0' }}
          >
            01
          </div>
          <h2
            className="font-raw text-[32px] text-raw-black uppercase relative z-10 pl-16"
            style={{ lineHeight: '1.0' }}
          >
            STUDY SESSION
          </h2>
        </div>

        <div className="max-w-2xl space-y-6">
          <div>
            <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-black block mb-1">
              SUBJECT
            </label>
            <input
              type="text"
              value={studyTopic}
              onChange={(e) => setStudyTopic(e.target.value)}
              placeholder="MATHEMATICS"
              className="bg-raw-surface border-[3px] border-raw-border w-full font-mono text-[15px] px-3 py-2.5 text-raw-white focus:outline-none focus:border-[5px] placeholder:text-raw-text-tertiary"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <div>
            <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-black block mb-1">
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
              className={`bg-raw-surface w-full font-mono text-[15px] px-3 py-2.5 text-raw-white focus:outline-none placeholder:text-raw-text-tertiary ${
                studyError
                  ? 'border-[3px] border-raw-error'
                  : 'border-[3px] border-raw-border focus:border-[5px]'
              }`}
              style={{ borderRadius: '0px' }}
            />
            {studyError && (
              <p className="font-mono text-[12px] text-raw-error mt-1">
                ENTER A VALUE GREATER THAN 0
              </p>
            )}
          </div>

          {studyDelta > 0 && (
            <div className="font-raw text-[24px] text-raw-black uppercase">
              +{studyDelta} INTELLIGENCE
            </div>
          )}

          <ButtonRaw 
            size="lg" 
            onClick={handleStudySubmit}
            disabled={studyLoading}
          >
            {studyLoading ? 'LOGGING...' : 'LOG STUDY SESSION'}
          </ButtonRaw>
          {studyErrorMsg && (
            <div className="mt-4 font-raw text-raw-error text-[14px] uppercase tracking-[1px] border-[3px] border-raw-error p-4">
              {studyErrorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Sleep */}
      <div className="border-b-[5px] border-raw-black px-8 py-10">
        <div className="relative mb-6">
          <div
            className="font-raw text-[48px] text-raw-text-secondary absolute top-0 left-0"
            style={{ lineHeight: '1.0' }}
          >
            02
          </div>
          <h2
            className="font-raw text-[32px] text-raw-black uppercase relative z-10 pl-16"
            style={{ lineHeight: '1.0' }}
          >
            SLEEP
          </h2>
        </div>

        <div className="max-w-2xl space-y-6">
          <div>
            <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-black block mb-1">
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
              className={`bg-raw-surface w-full font-mono text-[15px] px-3 py-2.5 text-raw-white focus:outline-none placeholder:text-raw-text-tertiary ${
                sleepError
                  ? 'border-[3px] border-raw-error'
                  : 'border-[3px] border-raw-black focus:border-[5px]'
              }`}
              style={{ borderRadius: '0px' }}
            />
            {sleepError && (
              <p className="font-mono text-[12px] text-raw-error mt-1">
                ENTER A VALUE GREATER THAN 0
              </p>
            )}
          </div>

          {sleepDelta > 0 && (
            <div className="font-raw text-[24px] text-raw-black uppercase">
              +{sleepDelta} ENERGY
            </div>
          )}

          <ButtonRaw 
            size="lg" 
            onClick={handleSleepSubmit}
            disabled={sleepLoading}
          >
            {sleepLoading ? 'LOGGING...' : 'LOG SLEEP'}
          </ButtonRaw>
          {sleepErrorMsg && (
            <div className="mt-4 font-raw text-raw-error text-[14px] uppercase tracking-[1px] border-[3px] border-raw-error p-4">
              {sleepErrorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Tasks */}
      <div className="px-8 py-10">
        <div className="relative mb-6">
          <div
            className="font-raw text-[48px] text-raw-text-secondary absolute top-0 left-0"
            style={{ lineHeight: '1.0' }}
          >
            03
          </div>
          <h2
            className="font-raw text-[32px] text-raw-black uppercase relative z-10 pl-16"
            style={{ lineHeight: '1.0' }}
          >
            TASKS COMPLETED
          </h2>
        </div>

        <div className="max-w-2xl">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="border-b-[3px] border-raw-black py-4 flex items-center gap-4 cursor-pointer"
            >
              <div
                className={`w-5 h-5 border-[3px] border-raw-black flex items-center justify-center focus:border-[5px] ${
                  task.checked ? 'bg-raw-black' : 'bg-raw-white'
                }`}
                style={{ borderRadius: '0px' }}
              >
                {task.checked && (
                  <span className="font-raw text-raw-white text-[12px]">✓</span>
                )}
              </div>
              <label className="font-raw text-raw-black text-sm uppercase tracking-[1px] cursor-pointer">
                {task.label}
              </label>
            </div>
          ))}

          <div className="font-mono text-raw-black text-sm mt-4">
            TASKS COMPLETED: {checkedCount} / 5
          </div>

          {checkedCount > 0 && (
            <div className="font-raw text-[24px] text-raw-black uppercase mt-4">
              +{checkedCount * 5} WISDOM
            </div>
          )}

          <div className="mt-6">
            <ButtonRaw size="lg" onClick={handleTasksSubmit}>
              LOG TASKS
            </ButtonRaw>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Logger
