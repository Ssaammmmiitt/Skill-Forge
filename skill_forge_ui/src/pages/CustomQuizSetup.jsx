import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ButtonOffset from '../components/ui/ButtonOffset'
import PageIntro from '../components/layout/PageIntro'
import Spinner from '../components/ui/Spinner'
import {
  getCustomQuizSubjects,
  generateCustomQuiz,
  saveCustomQuizSession,
  TIMER_OPTIONS,
  QUESTION_COUNT_OPTIONS,
  DIFFICULTY_OPTIONS,
  CUSTOM_SUBJECT_VALUE,
} from '../api/customQuiz'

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
  const [generateError, setGenerateError] = useState(null)

  useEffect(() => {
    document.title = 'SKILL FORGE // CUSTOMIZED QUIZ'
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingSubjects(true)
      setSubjectError(null)
      try {
        const data = await getCustomQuizSubjects()
        if (!cancelled) {
          setSubjects(data.subjects || [])
          if (data.subjects?.length) {
            setSelectedSubject(data.subjects[0].id)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setSubjectError(err.message || 'Could not load subjects')
        }
      } finally {
        if (!cancelled) setLoadingSubjects(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const isCustomSubject = selectedSubject === CUSTOM_SUBJECT_VALUE
  const subjectMeta = subjects.find((s) => s.id === selectedSubject)
  const chapterOptions = subjectMeta?.chapters || []

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
      return 'Enter a custom subject (at least 2 characters).'
    }
    if (!isCustomSubject && !selectedSubject) {
      return 'Select a subject.'
    }
    if (useChapter && (useCustomChapter || isCustomSubject) && customChapter.trim().length < 2) {
      return 'Enter a custom chapter name (at least 2 characters).'
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
      saveCustomQuizSession({
        ...result,
        timer_seconds: timerSeconds,
      })
      navigate('/quiz', { state: { fromCustom: true } })
    } catch (err) {
      setGenerateError(err.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  if (loadingSubjects) {
    return (
      <div className="min-h-full bg-raw-bg flex items-center justify-center">
        <Spinner variant="star" size="lg" />
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-full bg-raw-bg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="max-w-3xl mx-auto px-4 md:px-0 py-2">
        <PageIntro
          title="CUSTOMIZED QUIZ"
          purpose="Build your own AI-generated quiz by subject and chapter. Choose difficulty, timer, and question count. Results earn XP and INT/WIS without affecting your adaptive learning profile."
          steps={[
            'Pick a subject (or enter your own)',
            'Optionally focus on a chapter',
            'Configure difficulty, timer, and questions — then generate',
          ]}
        />

        {subjectError && (
          <div className="border-[3px] border-raw-border bg-raw-surface p-4 mb-6 font-mono text-[12px] text-red-700">
            {subjectError}
          </div>
        )}

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
                onChange={(e) => setCustomSubject(e.target.value)}
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

        {generateError && (
          <div className="border-[3px] border-dotted border-red-600 bg-raw-surface p-4 mb-6 font-mono text-[12px] text-red-700">
            {generateError}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-8">
          <ButtonOffset
            size="md"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'GENERATING…' : 'GENERATE QUIZ'}
          </ButtonOffset>
          <ButtonOffset
            size="md"
            onClick={() => navigate('/quiz')}
          >
            STANDARD QUIZ
          </ButtonOffset>
          <ButtonOffset
            size="md"
            onClick={() => navigate('/dashboard')}
          >
            BACK
          </ButtonOffset>
        </div>

        {generating && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-raw-text-secondary">
            <Spinner variant="star" size="sm" />
            AI is generating your questions — this may take up to a minute…
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CustomQuizSetup
