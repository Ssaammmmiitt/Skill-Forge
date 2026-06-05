import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ButtonOffset from '../components/ui/ButtonOffset'
import PageIntro from '../components/layout/PageIntro'
import Spinner from '../components/ui/Spinner'
import {
  getCustomQuizSubjects,
  generateCustomQuiz,
  saveCustomQuizSession,
  getGenerateStageLabel,
  TIMER_OPTIONS,
  QUESTION_COUNT_OPTIONS,
  DIFFICULTY_OPTIONS,
  CUSTOM_SUBJECT_VALUE,
} from '../api/customQuiz'

const ErrorBanner = ({ error, onDismiss, onRetry }) => {
  if (!error) return null

  return (
    <motion.div
      role="alert"
      className="border-[3px] border-red-600 bg-red-50 dark:bg-red-950/20 p-5 mb-6"
      style={{ borderRadius: 0 }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <div className="font-raw text-[11px] uppercase tracking-[2px] text-red-700 mb-2">
        {error.title || 'Error'}
      </div>
      <p className="font-mono text-[13px] text-red-800 leading-relaxed">
        {error.message}
      </p>
      {error.hint && (
        <p className="font-mono text-[11px] text-red-700/80 mt-2 leading-relaxed">
          {error.hint}
        </p>
      )}
      <div className="flex flex-wrap gap-3 mt-4">
        {error.retryable && onRetry && (
          <ButtonOffset size="sm" onClick={onRetry}>
            TRY AGAIN
          </ButtonOffset>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="font-mono text-[11px] text-red-700 underline underline-offset-2 hover:text-red-900"
          >
            Dismiss
          </button>
        )}
      </div>
    </motion.div>
  )
}

const GenerateProgressPanel = ({ progress, stageLabel }) => (
  <motion.div
    className="border-[3px] border-raw-border bg-raw-surface p-6 mb-6"
    style={{ borderRadius: 0 }}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <Spinner variant="star" size="sm" />
      <span className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text">
        Generating quiz
      </span>
    </div>

    <div className="flex justify-between font-mono text-[10px] text-raw-text-tertiary uppercase mb-2">
      <span>{stageLabel}</span>
      <span>{progress}%</span>
    </div>

    <div className="h-2.5 bg-raw-bg border-[2px] border-raw-border overflow-hidden">
      <motion.div
        className="h-full bg-raw-border"
        style={{ backgroundColor: 'var(--raw-border)' }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </div>

    <p className="font-mono text-[11px] text-raw-text-secondary mt-4 leading-relaxed">
      AI is writing {progress < 75 ? 'your' : 'and validating your'} questions — usually 15–60 seconds.
      Do not close this page.
    </p>
  </motion.div>
)

const CustomQuizSetup = () => {
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [subjectError, setSubjectError] = useState(null)

  const [selectedSubject, setSelectedSubject] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [useChapter, setUseChapter] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState('')
  const [customChapter, setCustomChapter] = useState('')
  const [useCustomChapter, setUseCustomChapter] = useState(false)
  const [difficultyLevel, setDifficultyLevel] = useState(2)
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [questionCount, setQuestionCount] = useState(5)

  const [generating, setGenerating] = useState(false)
  const [generateProgress, setGenerateProgress] = useState(0)
  const [generateError, setGenerateError] = useState(null)

  useEffect(() => {
    document.title = 'SKILL FORGE // CUSTOMIZED QUIZ'
  }, [])

  const loadSubjects = async () => {
    setLoadingSubjects(true)
    setSubjectError(null)
    try {
      const data = await getCustomQuizSubjects()
      setSubjects(data.subjects || [])
      if (data.subjects?.length) {
        setSelectedSubject(data.subjects[0].id)
      }
    } catch (err) {
      setSubjectError(
        err.parsed || {
          title: 'Could not load subjects',
          message: err.message || 'Failed to load subject list.',
          hint: 'Check your connection and refresh the page.',
          retryable: true,
        }
      )
    } finally {
      setLoadingSubjects(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  // Simulated progress while waiting on Groq (caps at 92% until API returns)
  useEffect(() => {
    if (!generating) {
      setGenerateProgress(0)
      return
    }

    setGenerateProgress(4)
    const interval = setInterval(() => {
      setGenerateProgress((prev) => {
        if (prev >= 92) {
          clearInterval(interval)
          return 92
        }
        const step = prev < 25 ? 3 : prev < 55 ? 2 : prev < 80 ? 1 : 0.5
        return Math.min(prev + step, 92)
      })
    }, 450)

    return () => clearInterval(interval)
  }, [generating])

  const isCustomSubject = selectedSubject === CUSTOM_SUBJECT_VALUE
  const subjectMeta = subjects.find((s) => s.id === selectedSubject)
  const chapterOptions = subjectMeta?.chapters || []
  const generateStageLabel = getGenerateStageLabel(generateProgress)

  useEffect(() => {
    if (!useChapter) return
    if (useCustomChapter) return
    if (chapterOptions.length && !selectedChapter) {
      setSelectedChapter(chapterOptions[0])
    }
  }, [useChapter, useCustomChapter, chapterOptions, selectedChapter])

  const handleSubjectChange = (value) => {
    setSelectedSubject(value)
    setSelectedChapter('')
    setCustomChapter('')
    setUseCustomChapter(false)
    setGenerateError(null)
  }

  const buildPayload = () => {
    const payload = {
      subject: isCustomSubject ? CUSTOM_SUBJECT_VALUE : selectedSubject,
      custom_subject: isCustomSubject ? customSubject.trim() : null,
      use_chapter: useChapter,
      difficulty_level: difficultyLevel,
      question_count: questionCount,
      timer_seconds: timerSeconds,
    }

    if (useChapter) {
      if (useCustomChapter || isCustomSubject) {
        payload.custom_chapter = customChapter.trim() || null
        payload.chapter = null
      } else {
        payload.chapter = selectedChapter || null
        payload.custom_chapter = null
      }
    }

    return payload
  }

  const validate = () => {
    if (isCustomSubject && customSubject.trim().length < 2) {
      return {
        title: 'Missing subject',
        message: 'Enter a custom subject (at least 2 characters).',
        retryable: false,
      }
    }
    if (!isCustomSubject && !selectedSubject) {
      return {
        title: 'Missing subject',
        message: 'Select a subject from the dropdown.',
        retryable: false,
      }
    }
    if (useChapter && (useCustomChapter || isCustomSubject) && customChapter.trim().length < 2) {
      return {
        title: 'Missing chapter',
        message: 'Enter a custom chapter name (at least 2 characters).',
        retryable: false,
      }
    }
    return null
  }

  const handleGenerate = async () => {
    const validationError = validate()
    if (validationError) {
      setGenerateError(validationError)
      return
    }

    setGenerating(true)
    setGenerateError(null)
    try {
      const payload = buildPayload()
      const result = await generateCustomQuiz(payload)
      setGenerateProgress(100)
      saveCustomQuizSession({
        ...result,
        timer_seconds: timerSeconds,
      })
      await new Promise((r) => setTimeout(r, 350))
      navigate('/quiz', { state: { fromCustom: true } })
    } catch (err) {
      setGenerateError(
        err.parsed || {
          title: 'Generation failed',
          message: err.message || 'Could not generate quiz.',
          hint: 'Try again or adjust your settings.',
          retryable: true,
        }
      )
    } finally {
      setGenerating(false)
    }
  }

  const formDisabled = generating || loadingSubjects

  if (loadingSubjects) {
    return (
      <div className="min-h-full bg-raw-bg flex flex-col items-center justify-center gap-4">
        <Spinner variant="star" size="lg" />
        <p className="font-mono text-[11px] text-raw-text-secondary uppercase tracking-wider">
          Loading subjects…
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-full bg-raw-bg flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="flex-1 max-w-3xl mx-auto px-4 md:px-0 py-2 w-full">
        <PageIntro
          title="CUSTOMIZED QUIZ"
          purpose="Build your own AI-generated quiz by subject and chapter. Choose difficulty, timer, and question count. Results earn XP and INT/WIS without affecting your adaptive learning profile."
          steps={[
            'Pick a subject (or enter your own)',
            'Optionally focus on a chapter',
            'Configure difficulty, timer, and questions — then generate',
          ]}
        />

        <AnimatePresence mode="wait">
          {subjectError && (
            <ErrorBanner
              error={subjectError}
              onDismiss={() => setSubjectError(null)}
              onRetry={loadSubjects}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {generateError && !generating && (
            <ErrorBanner
              error={generateError}
              onDismiss={() => setGenerateError(null)}
              onRetry={handleGenerate}
            />
          )}
        </AnimatePresence>

        {generating && (
          <GenerateProgressPanel
            progress={Math.round(generateProgress)}
            stageLabel={generateStageLabel}
          />
        )}

        <fieldset disabled={formDisabled} className="disabled:opacity-60 disabled:pointer-events-none border-0 p-0 m-0 min-w-0">
          <div
            className="border-[3px] border-raw-border bg-raw-surface p-6 mb-6 space-y-6"
            style={{ borderRadius: 0 }}
          >
            <div>
              <label htmlFor="subject-select" className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary block mb-2">
                Subject
              </label>
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full border-[2px] border-raw-border bg-raw-bg px-3 py-2 font-mono text-sm text-raw-text"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
                <option value={CUSTOM_SUBJECT_VALUE}>Other (custom subject)</option>
              </select>
            </div>

            {isCustomSubject && (
              <div>
                <label htmlFor="custom-subject" className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary block mb-2">
                  Custom subject name
                </label>
                <input
                  id="custom-subject"
                  type="text"
                  value={customSubject}
                  onChange={(e) => {
                    setCustomSubject(e.target.value)
                    setGenerateError(null)
                  }}
                  placeholder="e.g. Astrophysics, Sanskrit, Machine Learning"
                  className="w-full border-[2px] border-raw-border bg-raw-bg px-3 py-2 font-mono text-sm text-raw-text"
                  maxLength={80}
                />
              </div>
            )}

            <div className="border-t-[2px] border-dotted border-raw-border pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useChapter}
                  onChange={(e) => setUseChapter(e.target.checked)}
                  className="w-4 h-4 accent-raw-border"
                />
                <span className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text">
                  Focus on a specific chapter
                </span>
              </label>
            </div>

            {useChapter && !isCustomSubject && chapterOptions.length > 0 && (
              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={useCustomChapter}
                    onChange={(e) => setUseCustomChapter(e.target.checked)}
                    className="w-4 h-4 accent-raw-border"
                  />
                  <span className="font-mono text-[11px] text-raw-text-secondary">
                    Use a custom chapter name instead
                  </span>
                </label>

                {!useCustomChapter ? (
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full border-[2px] border-raw-border bg-raw-bg px-3 py-2 font-mono text-sm text-raw-text"
                  >
                    {chapterOptions.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customChapter}
                    onChange={(e) => setCustomChapter(e.target.value)}
                    placeholder="Enter chapter or topic name"
                    className="w-full border-[2px] border-raw-border bg-raw-bg px-3 py-2 font-mono text-sm text-raw-text"
                    maxLength={120}
                  />
                )}
              </div>
            )}

            {useChapter && (isCustomSubject || useCustomChapter || !chapterOptions.length) && (
              <div>
                <label htmlFor="custom-chapter" className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary block mb-2">
                  Chapter / topic name
                </label>
                <input
                  id="custom-chapter"
                  type="text"
                  value={customChapter}
                  onChange={(e) => setCustomChapter(e.target.value)}
                  placeholder="e.g. Newton's Laws, Chapter 5 — Thermodynamics"
                  className="w-full border-[2px] border-raw-border bg-raw-bg px-3 py-2 font-mono text-sm text-raw-text"
                  maxLength={120}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t-[2px] border-dotted border-raw-border pt-4">
              <div>
                <label htmlFor="difficulty" className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary block mb-2">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(Number(e.target.value))}
                  className="w-full border-[2px] border-raw-border bg-raw-bg px-3 py-2 font-mono text-sm text-raw-text"
                >
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d.level} value={d.level}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="timer" className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary block mb-2">
                  Timer per question
                </label>
                <select
                  id="timer"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="w-full border-[2px] border-raw-border bg-raw-bg px-3 py-2 font-mono text-sm text-raw-text"
                >
                  {TIMER_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="question-count" className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary block mb-2">
                  Questions (max 10)
                </label>
                <select
                  id="question-count"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full border-[2px] border-raw-border bg-raw-bg px-3 py-2 font-mono text-sm text-raw-text"
                >
                  {QUESTION_COUNT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} questions
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <ButtonOffset
              size="md"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'GENERATING…' : 'GENERATE QUIZ'}
            </ButtonOffset>
            <ButtonOffset
              size="md"
              onClick={() => navigate('/dashboard')}
              disabled={generating}
            >
              BACK
            </ButtonOffset>
          </div>
        </fieldset>
      </div>

      {/* Standard quiz — bottom of page */}
      <div
        className="mt-auto border-t-[3px] border-raw-border bg-raw-surface px-4 md:px-8 py-4 shrink-0"
        style={{ borderRadius: 0 }}
      >
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-mono text-[11px] text-raw-text-secondary">
            Prefer the adaptive ML quiz instead?
          </p>
          <ButtonOffset
            size="md"
            onClick={() => navigate('/quiz')}
            disabled={generating}
            className="w-full sm:w-auto"
          >
            STANDARD QUIZ
          </ButtonOffset>
        </div>
      </div>
    </motion.div>
  )
}

export default CustomQuizSetup
