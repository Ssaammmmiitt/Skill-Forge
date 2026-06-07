import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { useStudentStore } from '../store/useStudentStore'
import { useNotifStore } from '../store/useNotifStore'
import { getQuiz, submitQuiz } from '../api/quiz'
import {
  loadDocumentQuizSession,
  clearDocumentQuizSession,
} from '../api/reader'
import {
  loadCustomQuizSession,
  clearCustomQuizSession,
  submitCustomQuiz,
} from '../api/customQuiz'
import ButtonOffset from '../components/ui/ButtonOffset'
import MetricArcade from '../components/ui/MetricArcade'
import BadgeArcade from '../components/ui/BadgeArcade'
import ProgressRaw from '../components/ui/ProgressRaw'
import Spinner from '../components/ui/Spinner'
import CardArcade from '../components/ui/CardArcade'
import ThemeToggle from '../components/ui/ThemeToggle'
import { resolveStudentId } from '../utils/resolveStudentId'
import GameMasterCard from '../components/gameMaster/GameMasterCard'
import { quizPhaseTransition, staggerItem } from '../components/motion/motionPresets'

const DEFAULT_QUESTION_TIME_SECONDS = 15

const QuizThemeFab = () => (
  <div className="fixed top-6 right-6 z-50">
    <ThemeToggle />
  </div>
)

const QuizExitButton = ({ onClick, label = '← HOME' }) => (
  <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
    <ButtonOffset size="sm" onClick={onClick}>
      {label}
    </ButtonOffset>
  </div>
)

const QuizPhase = ({ children, className = '' }) => (
  <motion.div
    className={className}
    initial={quizPhaseTransition.initial}
    animate={quizPhaseTransition.animate}
    exit={quizPhaseTransition.exit}
    transition={quizPhaseTransition.transition}
  >
    {children}
  </motion.div>
)

const Quiz = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore(state => state.user)
  const student = useStudentStore(state => state.student)
  const setStudent = useStudentStore(state => state.setStudent)
  const refreshStudent = useStudentStore(state => state.refreshStudent)
  const { addToast, setLevelUp, levelUpPending, levelUpData, clearLevelUp } = useNotifStore()

  const [phase, setPhase] = useState('start')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [events, setEvents] = useState([])
  const [timeLeft, setTimeLeft] = useState(DEFAULT_QUESTION_TIME_SECONDS)
  const [questionTimeSeconds, setQuestionTimeSeconds] = useState(DEFAULT_QUESTION_TIME_SECONDS)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [quizDifficulty, setQuizDifficulty] = useState(() => {
    const stored = sessionStorage.getItem('sf_quiz_difficulty')
    return stored ? Number(stored) : 5
  })
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0)
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now())
  const [cognitiveResult, setCognitiveResult] = useState(null)
  const [gameMasterResult, setGameMasterResult] = useState(null)
  const [topic, setTopic] = useState(() => location.state?.topic || null)
  const [documentQuiz, setDocumentQuiz] = useState(() => {
    if (location.state?.fromReader) {
      return loadDocumentQuizSession()
    }
    return null
  })
  const [customQuiz, setCustomQuiz] = useState(() => {
    if (location.state?.fromCustom) {
      return loadCustomQuizSession()
    }
    return null
  })
  const [customQuizResult, setCustomQuizResult] = useState(null)

  // Synchronize state and reset quiz elements when location/navigation state changes
  useEffect(() => {
    const stateTopic = location.state?.topic || null
    const fromReader = location.state?.fromReader || false
    const fromCustom = location.state?.fromCustom || false

    if (fromCustom) {
      const customQ = loadCustomQuizSession()
      clearDocumentQuizSession()
      setDocumentQuiz(null)
      setCustomQuiz(customQ)
      setTopic(null)
      setPhase('start')
      setQuestions([])
      setError(null)
      setCustomQuizResult(null)
    } else if (stateTopic) {
      clearDocumentQuizSession()
      clearCustomQuizSession()
      setDocumentQuiz(null)
      setCustomQuiz(null)
      setTopic(stateTopic)
      setPhase('start')
      setQuestions([])
      setError(null)
      setCustomQuizResult(null)
    } else if (fromReader) {
      const docQ = loadDocumentQuizSession()
      clearCustomQuizSession()
      setCustomQuiz(null)
      setDocumentQuiz(docQ)
      setTopic(null)
      setPhase('start')
      setQuestions([])
      setError(null)
      setCustomQuizResult(null)
    } else {
      clearDocumentQuizSession()
      clearCustomQuizSession()
      setDocumentQuiz(null)
      setCustomQuiz(null)
      setTopic(null)
      setPhase('start')
      setQuestions([])
      setError(null)
      setCustomQuizResult(null)
    }
  }, [location])

  const isDocumentQuiz = Boolean(documentQuiz?.questions?.length)
  const isCustomQuiz = Boolean(customQuiz?.questions?.length)
  const documentFilename = documentQuiz?.filename
  const customQuizLabel = customQuiz?.subject
  const customQuizChapter = customQuiz?.chapter
  const timerEnabled = questionTimeSeconds > 0

  const currentQuestion = questions[currentIndex]

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // ASSESSMENT'
  }, [])

  // Auto-close level-up modal after 5s
  useEffect(() => {
    if (levelUpPending) {
      const timer = setTimeout(() => {
        clearLevelUp()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [levelUpPending, clearLevelUp])

  useEffect(() => {
    if (phase !== 'question' || !timerEnabled) return

    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
    if (timeLeft === 0 && currentQuestion && selectedIndex === null) {
      handleAnswerSelect(null)
    }
  }, [phase, timeLeft, timerEnabled, currentQuestion, selectedIndex])

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    setCognitiveResult(null)
    setGameMasterResult(null)
    setCustomQuizResult(null)

    const perQuestionTimer = isCustomQuiz
      ? (customQuiz?.timer_seconds ?? DEFAULT_QUESTION_TIME_SECONDS)
      : DEFAULT_QUESTION_TIME_SECONDS
    setQuestionTimeSeconds(perQuestionTimer)

    const difficulty =
      documentQuiz?.difficulty ??
      student?.suggested_difficulty ??
      (Number(sessionStorage.getItem('sf_quiz_difficulty')) || 5)
    setQuizDifficulty(difficulty)
    try {
      if (isCustomQuiz) {
        setQuestions(customQuiz.questions)
      } else if (isDocumentQuiz) {
        setQuestions(documentQuiz.questions)
      } else {
        clearDocumentQuizSession()
        clearCustomQuizSession()
        setDocumentQuiz(null)
        setCustomQuiz(null)
        const data = await getQuiz(difficulty, topic)
        setQuestions(data.questions || [])
      }
      setPhase('question')
      setCurrentIndex(0)
      setScore(0)
      setCorrectCount(0)
      setStreak(0)
      setXpEarned(0)
      setEvents([])
      setAnswers([])
      setTotalTimeSeconds(0)
      setQuestionStartedAt(Date.now())
      setTimeLeft(perQuestionTimer > 0 ? perQuestionTimer : DEFAULT_QUESTION_TIME_SECONDS)
      setSelectedIndex(null)
    } catch (err) {
      setError(err.message || 'Failed to load quiz')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (index) => {
    if (selectedIndex !== null) return

    const question = questions[currentIndex]
    if (!question || question.correct_index == null) return

    setSelectedIndex(index)

    setTimeout(() => {
      const isCorrect = index === question.correct_index
      const isTimeout = index === null
      const correctOption = question.options?.[question.correct_index] ?? ''

      let questionXP = 0
      let newEvents = []
      let newStreak = streak

      if (isCorrect) {
        setCorrectCount(prev => prev + 1)
        newStreak = streak + 1
        setStreak(newStreak)
        questionXP = 50 + (Math.floor(timeLeft / 3) * 5)

        if (newStreak >= 3) newEvents.push(`STREAK ×${newStreak}`)
        if (timeLeft >= 12) newEvents.push('QUICK')
        if (newStreak === 5) newEvents.push('PERFECT')
      } else {
        newStreak = 0
        setStreak(0)
        questionXP = isTimeout ? 0 : 10
      }

      setXpEarned(prev => prev + questionXP)
      setScore(prev => prev + (isCorrect ? 20 : 0))
      setEvents(newEvents)
      const elapsed = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000))
      setTotalTimeSeconds((prev) => prev + elapsed)

      setAnswers(prev => [...prev, {
        question_id: question.id,
        chosen_index: index,
        correct_index: question.correct_index,
        topic: question.topic,
        _ui_xp: questionXP,
        _ui_correct: isCorrect,
        _ui_timeout: isTimeout,
        _ui_correct_index: question.correct_index,
        _ui_correct_option: correctOption,
      }])

      addToast({
        message: isCorrect
          ? `+${String(questionXP).padStart(3, '0')} XP${newEvents.length > 0 ? ' · ' + newEvents.join(' · ') : ''}`
          : (isTimeout ? 'TIME UP' : 'INCORRECT'),
        type: 'arcade'
      })

      setPhase('feedback')
    }, 700)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setTimeLeft(timerEnabled ? questionTimeSeconds : DEFAULT_QUESTION_TIME_SECONDS)
      setQuestionStartedAt(Date.now())
      setSelectedIndex(null)
      setPhase('question')
    } else {
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const apiAnswers = answers.map(
        ({ question_id, chosen_index, correct_index, topic }) => ({
          question_id,
          chosen_index,
          correct_index,
          topic,
        })
      )

      const studentId = resolveStudentId(user, student)

      if (isCustomQuiz) {
        const result = await submitCustomQuiz({
          student_id: studentId,
          answers: apiAnswers,
          difficulty_level: customQuiz?.difficulty_level ?? 2,
          time_taken: Math.max(totalTimeSeconds, answers.length),
          subject: customQuiz?.subject,
          chapter: customQuiz?.chapter,
        })

        setCustomQuizResult(result)

        const oldLevel = student?.level || 1
        const newLevel = result.student?.level || result.new_level || oldLevel

        if (newLevel > oldLevel) {
          setLevelUp({ newLevel, isCustomQuiz: true })
        }

        if (result.student) {
          setStudent(result.student)
        } else if (user?.student_id) {
          await refreshStudent(user.student_id)
        }

        if (result.xp_earned !== undefined) {
          setXpEarned(result.xp_earned)
        }

        setPhase('complete')
        return
      }

      const result = await submitQuiz({
        student_id: studentId,
        answers: apiAnswers,
        difficulty: quizDifficulty,
        time_taken: Math.max(totalTimeSeconds, answers.length),
      })

      if (result.new_difficulty != null) {
        sessionStorage.setItem('sf_quiz_difficulty', String(result.new_difficulty))
        setQuizDifficulty(result.new_difficulty)
      }

      if (result.cognitive) {
        setCognitiveResult(result.cognitive)
      }
      if (result.game_master) {
        setGameMasterResult(result.game_master)
      }

      const oldLevel = student?.level || 1
      const newLevel = result.student?.level || result.new_level || oldLevel
      const pathFocus =
        result.learning_path?.focus ||
        result.learning_style ||
        result.student?.learning_style ||
        'Unknown Path'

      if (newLevel > oldLevel) {
        setLevelUp({
          newLevel,
          learningPath: pathFocus,
        })
      }

      if (result.student) {
        setStudent(result.student)
      } else if (user?.student_id) {
        await refreshStudent(user.student_id)
      }

      if (result.xp_earned !== undefined) {
        setXpEarned(result.xp_earned)
      }

      setPhase('complete')
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  // Spacebar to start quiz
  useEffect(() => {
    if (phase !== 'start' || loading || error) return

    const handleSpacePress = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handleStart()
      }
    }

    document.addEventListener('keydown', handleSpacePress)
    return () => document.removeEventListener('keydown', handleSpacePress)
  }, [phase, loading, error])

  // Keyboard shortcuts for quiz
  useEffect(() => {
    if (phase !== 'question' || !currentQuestion) return

    const handleKeyPress = (e) => {
      if (selectedIndex !== null) return // Already selected

      const key = e.key.toLowerCase()
      if (key >= '1' && key <= '4') {
        const index = parseInt(key) - 1
        if (index < currentQuestion.options.length) {
          handleAnswerSelect(index)
        }
      } else if (key === 'a' || key === 'b' || key === 'c' || key === 'd') {
        const indexMap = { a: 0, b: 1, c: 2, d: 3 }
        const index = indexMap[key]
        if (index < currentQuestion.options.length) {
          handleAnswerSelect(index)
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [phase, currentQuestion, selectedIndex])

  useEffect(() => {
    if (phase === 'feedback') {
      const timer = setTimeout(handleNext, 2000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  const goHome = () => {
    if (isCustomQuiz) {
      navigate('/app/quiz/custom')
      return
    }
    if (isDocumentQuiz) {
      navigate('/app/reader')
      return
    }
    navigate('/dashboard')
  }

  const goStandardQuiz = () => {
    clearDocumentQuizSession()
    clearCustomQuizSession()
    setDocumentQuiz(null)
    setCustomQuiz(null)
    setTopic(null)
    setPhase('start')
    setQuestions([])
    setError(null)
    navigate('/quiz', { replace: true, state: {} })
  }

  const phaseKey =
    phase === 'question'
      ? `question-${currentIndex}`
      : phase === 'complete' && submitting
        ? 'submitting'
        : phase === 'complete' && submitError
          ? 'submit-error'
          : phase

  let phaseShellClass = 'min-h-screen bg-arcade-surface'
  let phaseContent = null

  if (phase === 'start') {
    phaseShellClass += ' flex items-center justify-center px-4 md:px-6 py-8 md:py-12'
    phaseContent = loading ? (
      <div className="text-center">
        <Spinner variant="arcade" size="lg" />
        <p className="font-arcade text-[8px] text-arcade-secondary tracking-[2px] mt-4">
          LOADING...
        </p>
      </div>
    ) : error ? (
      <div className="text-center max-w-lg">
        <div className="font-arcade text-[10px] md:text-[12px] text-space-error tracking-[3px] mb-6">
          // LOAD FAILED //
        </div>
        <p className="font-arcade text-[8px] md:text-[9px] text-arcade-secondary mb-6">
          {error}
        </p>
        <ButtonOffset size="md" onClick={handleStart}>
          RETRY
        </ButtonOffset>
      </div>
    ) : (
      <motion.div
        className="border-[3px] md:border-[4px] border-dotted border-arcade-primary max-w-lg w-full p-6 md:p-12 hover:border-space-nebula hover:shadow-2xl"
        style={{ borderRadius: '0px' }}
        {...staggerItem}
      >
        <div className="text-center">
          <div className="font-arcade text-[10px] md:text-[12px] text-arcade-secondary tracking-[2px] md:tracking-[3px] mb-4 md:mb-6">
            SKILL FORGE
          </div>
          <h1 className="font-arcade text-[22px] md:text-[32px] text-space-star tracking-[3px] md:tracking-[4px] mb-2 md:mb-3">
            {isCustomQuiz
              ? 'CUSTOMIZED QUIZ'
              : isDocumentQuiz
                ? 'DOCUMENT QUIZ'
                : topic
                  ? `PRACTICE: ${topic.toUpperCase()}`
                  : 'ASSESSMENT'}
          </h1>
          <div className="font-arcade text-[10px] md:text-[12px] text-space-star tracking-[1px] md:tracking-[2px] mb-3 md:mb-4">
            {isCustomQuiz
              ? `SUBJECT // ${(customQuizLabel || 'CUSTOM').toUpperCase()}${customQuizChapter ? ` · ${customQuizChapter.toUpperCase()}` : ''}`
              : isDocumentQuiz
                ? `SOURCE // ${(documentFilename || 'YOUR DOCUMENT').toUpperCase()}`
                : topic
                  ? `FOCUS // ${topic.replace('_', ' ').toUpperCase()}`
                  : 'MODE // ADAPTIVE ML'}
          </div>

          <p className="font-body-space text-[13px] md:text-[16px] text-arcade-secondary leading-relaxed mt-2 max-w-md mx-auto px-1 md:px-2">
            {isCustomQuiz
              ? 'AI-generated questions for your chosen subject. Earn XP and INT/WIS — this practice mode does not change your adaptive learning profile or difficulty.'
              : isDocumentQuiz
                ? 'Questions are drawn from the study content you just read. Same scoring rules apply — earn XP, build streaks, and update your learning profile.'
                : topic
                  ? `Practice quiz focused specifically on ${topic.replace('_', ' ')}. Five questions per run, scored to help you improve your weakness.`
                  : 'Five questions per run, drawn from a larger topic bank. Your speed, accuracy, and mistakes train the learning-style models—not the topic labels alone.'}
          </p>

          <div className="border-b-[2px] md:border-b-[3px] border-dotted border-arcade-primary my-6 md:my-8" />

          <div className="grid grid-cols-3 gap-2 md:gap-5 mb-8 md:mb-10">
            <MetricArcade
              label="QUESTIONS"
              value={String(
                isCustomQuiz
                  ? customQuiz.questions.length
                  : isDocumentQuiz
                    ? documentQuiz.questions.length
                    : 5
              ).padStart(2, '0')}
            />
            <MetricArcade
              label="DIFFICULTY"
              value={
                isCustomQuiz
                  ? (customQuiz.difficulty_label || 'MED').slice(0, 3).toUpperCase()
                  : String(quizDifficulty).padStart(2, '0')
              }
            />
            <MetricArcade
              label="TIME/Q"
              value={
                isCustomQuiz && customQuiz.timer_seconds === 0
                  ? 'OFF'
                  : `${isCustomQuiz ? customQuiz.timer_seconds : DEFAULT_QUESTION_TIME_SECONDS}S`
              }
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <ButtonOffset size="lg" onClick={handleStart}>
              PRESS START
            </ButtonOffset>
            <span className="font-arcade text-[7px] md:text-[8px] text-arcade-secondary tracking-[1px] opacity-70">
              or press SPACEBAR
            </span>
            {(isDocumentQuiz || isCustomQuiz || topic) && (
              <button
                type="button"
                onClick={goStandardQuiz}
                className="font-arcade text-[7px] md:text-[8px] text-arcade-secondary tracking-[1px] mt-3 underline underline-offset-2 hover:text-space-star"
              >
                {isCustomQuiz
                  ? 'Switch to standard adaptive quiz'
                  : isDocumentQuiz
                    ? 'Switch to standard topic quiz'
                    : 'Switch to standard adaptive quiz'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  } else if (phase === 'question') {
    phaseShellClass += ' px-4 md:px-8 py-4 md:py-6'
    if (!currentQuestion) {
      phaseContent = (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner variant="arcade" size="lg" />
        </div>
      )
    } else {
      phaseContent = (
        <div className="max-w-3xl mx-auto pt-12 md:pt-0">
          <motion.div
            className="flex justify-between items-center mb-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-arcade text-[8px] md:text-[9px] text-arcade-secondary tracking-[2px]">
              Q.{String(currentIndex + 1).padStart(2, '0')}/{String(questions.length).padStart(2, '0')}
            </div>
            <div
              className={`border-[2px] md:border-[3px] border-dotted px-2 md:px-3 py-1 ${timerEnabled && timeLeft <= 5 ? 'border-arcade-danger' : 'border-arcade-primary'}`}
              style={{ borderRadius: '0px' }}
            >
              <span className="font-arcade text-[10px] md:text-[12px] text-space-star tracking-[2px]">
                {timerEnabled
                  ? `00:${String(timeLeft).padStart(2, '0')}`
                  : 'NO LIMIT'}
              </span>
            </div>
          </motion.div>

          {timerEnabled && (
            <div className="mb-4 md:mb-6">
              <ProgressRaw value={(timeLeft / questionTimeSeconds) * 100} />
            </div>
          )}

          <motion.div
            className="border-l-[4px] md:border-l-[6px] border-arcade-primary pl-4 md:pl-7 mt-4 md:mt-6 mb-6 md:mb-10"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
          >
            <h2 className="font-raw text-raw-white text-[18px] md:text-[28px] uppercase leading-tight">
              {currentQuestion.question}
            </h2>
          </motion.div>

          <div className="flex flex-col gap-3 md:gap-4">
            {currentQuestion.options.map((option, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={selectedIndex === null ? { scale: 1.02 } : {}}
                whileTap={selectedIndex === null ? { scale: 0.98 } : {}}
                onClick={() => handleAnswerSelect(index)}
                className={`
                  bg-arcade-surface border-[2px] md:border-[3px] border-dotted p-3 md:p-5 cursor-pointer
                  flex items-center transition-colors duration-200
                  ${selectedIndex === null ? 'hover:border-space-nebula hover:bg-arcade-hover hover:shadow-lg' : ''}
                  ${selectedIndex === index ? 'border-solid border-raw-white bg-arcade-hover' : 'border-arcade-primary'}
                `}
                style={{ borderRadius: '0px' }}
              >
                <span className="font-arcade text-[12px] md:text-[14px] text-arcade-primary mr-3 md:mr-5 min-w-[18px] md:min-w-[22px] font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span
                  className={`font-arcade text-[12px] md:text-[14px] tracking-[1px] leading-relaxed ${selectedIndex === index ? 'text-raw-white font-bold' : 'text-arcade-secondary'}`}
                >
                  {option}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )
    }
  } else if (phase === 'feedback') {
    const lastAnswer = answers[answers.length - 1]
    const isCorrect = lastAnswer._ui_correct
    const isTimeout = lastAnswer._ui_timeout

    phaseShellClass += ' flex items-center justify-center px-4 md:px-8 py-6 md:py-8'
    phaseContent = (
      <div className="text-center max-w-lg w-full">
        <motion.div
          className="font-arcade text-[14px] md:text-[16px] tracking-[2px] md:tracking-[3px] mb-4 md:mb-6 font-bold"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {isTimeout ? '// TIME UP //' : (isCorrect ? '// CORRECT //' : '// WRONG //')}
          <span
            className={`ml-2 ${isTimeout ? 'text-arcade-secondary' : (isCorrect ? 'text-space-success' : 'text-space-error')}`}
          >
            {isTimeout ? '' : (isCorrect ? '✓' : '✗')}
          </span>
        </motion.div>

        <motion.div
          className="mb-4 md:mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className={`bg-arcade-surface border-[2px] md:border-[3px] border-solid p-3 md:p-5 ${isCorrect ? 'border-space-success' : 'border-arcade-primary'}`}
            style={{ borderRadius: '0px' }}
          >
            <span className="font-arcade text-[10px] md:text-[12px] text-arcade-primary mr-3 md:mr-5 min-w-[16px] md:min-w-[20px] inline-block">
              {String.fromCharCode(65 + (lastAnswer._ui_correct_index ?? 0))}
            </span>
            <span
              className={`font-arcade text-[9px] md:text-[10px] tracking-[1px] leading-relaxed ${isCorrect ? 'text-space-success' : 'text-arcade-secondary'}`}
            >
              {lastAnswer._ui_correct_option ?? ''}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="font-arcade text-[22px] md:text-[28px] text-space-star tracking-[3px] md:tracking-[4px] mt-4 md:mt-6 font-bold"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          +{String(lastAnswer._ui_xp ?? 0).padStart(3, '0')} XP
        </motion.div>

        {events.length > 0 && (
          <motion.div
            className="flex justify-center gap-2 mt-3 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {events.map((event, i) => (
              <BadgeArcade key={i}>{event}</BadgeArcade>
            ))}
          </motion.div>
        )}

        <motion.div
          className="mt-6 md:mt-8 border-[3px] border-dotted border-arcade-primary p-4 inline-block"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ButtonOffset size="md" onClick={handleNext}>
            {currentIndex < questions.length - 1 ? 'NEXT QUESTION' : 'FINAL RESULTS'}
          </ButtonOffset>
        </motion.div>
      </div>
    )
  } else if (phase === 'complete') {
    if (submitting) {
      phaseShellClass += ' flex items-center justify-center'
      phaseContent = (
        <div className="text-center">
          <Spinner variant="arcade" size="lg" />
          <p className="font-arcade text-[8px] text-arcade-secondary tracking-[2px] mt-4">
            SUBMITTING...
          </p>
        </div>
      )
    } else if (submitError) {
      phaseShellClass += ' flex items-center justify-center px-6'
      phaseContent = (
        <div className="text-center max-w-lg">
          <div className="font-arcade text-[12px] text-space-error tracking-[3px] mb-6">
            // SUBMIT FAILED //
          </div>
          <p className="font-arcade text-[9px] text-arcade-secondary mb-6">
            {submitError}
          </p>
          <div className="border-[3px] border-dotted border-arcade-primary p-4 inline-block">
            <ButtonOffset size="md" onClick={handleSubmitQuiz}>
              RETRY SUBMIT
            </ButtonOffset>
          </div>
        </div>
      )
    } else {
      phaseShellClass += ' flex flex-col items-center justify-start px-4 md:px-6 pt-20 pb-16 md:py-12 gap-8 md:gap-10 overflow-y-auto min-h-screen'
      phaseContent = (
        <>
          <motion.div
            className="border-[3px] md:border-[4px] border-dotted border-space-star max-w-xl w-full p-8 md:p-12 shrink-0"
            style={{ borderRadius: '0px' }}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-center">
              <motion.div
                className="font-arcade text-[12px] md:text-[14px] text-arcade-secondary tracking-[3px] md:tracking-[4px] mb-4 md:mb-6 font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                GAME OVER
              </motion.div>
              <motion.h1
                className="font-arcade text-[26px] md:text-[32px] text-space-star tracking-[4px] md:tracking-[5px] mb-6 md:mb-8 font-bold"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                RESULTS
              </motion.h1>

              <motion.div
                className="mb-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <MetricArcade large label="FINAL SCORE" value={String(score).padStart(3, '0')} />
              </motion.div>

              <motion.div
                className="mt-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <MetricArcade large label="XP EARNED" value={`+${xpEarned}`} />
              </motion.div>

              <motion.div
                className="mt-8 md:mt-10 border-t-[2px] border-dotted border-arcade-primary pt-6 md:pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {isCustomQuiz ? (
                  <>
                    <div className="font-arcade text-[10px] md:text-[12px] text-arcade-secondary tracking-[2px] uppercase font-bold">
                      PRACTICE REWARDS //
                    </div>
                    <div className="font-arcade text-[14px] md:text-[18px] text-space-star tracking-[2px] mt-3 font-bold">
                      INT +{customQuizResult?.attribute_delta?.INT ?? 0} · WIS +{customQuizResult?.attribute_delta?.WIS ?? 0}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-arcade text-[10px] md:text-[12px] text-arcade-secondary tracking-[2px] uppercase font-bold">
                      ML LEARNING STYLE //
                    </div>
                    <div className="font-arcade text-[16px] md:text-[20px] text-space-star tracking-[2px] md:tracking-[3px] mt-3 font-bold">
                      {(cognitiveResult?.predictions?.decision_tree ||
                        student?.learning_style ||
                        'UNKNOWN')
                        .replace(/_/g, ' ')
                        .toUpperCase()}
                    </div>
                    {cognitiveResult?.confidence > 0 && (
                      <div className="font-arcade text-[10px] md:text-[12px] text-arcade-secondary tracking-[1px] mt-3 font-bold">
                        CONFIDENCE {(cognitiveResult.confidence * 100).toFixed(0)}%
                        {cognitiveResult.model_agreement ? ' · MODELS AGREE' : ' · ENSEMBLE'}
                      </div>
                    )}
                    {cognitiveResult?.explanations?.length > 0 && (
                      <p className="font-body-space text-[12px] md:text-[14px] text-arcade-secondary mt-4 leading-relaxed max-w-md mx-auto">
                        {cognitiveResult.explanations[0]}
                      </p>
                    )}
                  </>
                )}
              </motion.div>

              {answers.filter(a => a._ui_correct).length >= 3 && (
                <motion.div
                  className="flex justify-center gap-2 mt-4 flex-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.42 }}
                >
                  <BadgeArcade>STRONG PERFORMANCE</BadgeArcade>
                  {correctCount === questions.length && <BadgeArcade>PERFECT</BadgeArcade>}
                </motion.div>
              )}

              <motion.div
                className="mt-6 md:mt-8 border-[3px] md:border-[4px] border-dotted border-arcade-primary p-4 md:p-6 bg-arcade-surface/30"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
              >
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                  <ButtonOffset size="md" onClick={handleStart}>
                    RETRY
                  </ButtonOffset>
                  <ButtonOffset size="md" onClick={() => navigate(isCustomQuiz ? '/app/quiz/custom' : '/app/analytics')}>
                    {isCustomQuiz ? 'NEW CUSTOM QUIZ' : 'VIEW STATS'}
                  </ButtonOffset>
                  {isDocumentQuiz && (
                    <ButtonOffset size="md" onClick={() => navigate('/app/reader')}>
                      BACK TO READER
                    </ButtonOffset>
                  )}
                  {isCustomQuiz && (
                    <ButtonOffset size="md" onClick={() => navigate('/dashboard')}>
                      DASHBOARD
                    </ButtonOffset>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {!isCustomQuiz && (
          <motion.div
            className="max-w-lg w-full shrink-0 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="font-arcade text-[7px] md:text-[8px] text-arcade-secondary tracking-[2px] md:tracking-[3px] mb-2 md:mb-3 text-center">
              GAME MASTER //
            </div>
            <GameMasterCard
              gameMaster={gameMasterResult}
              variant="arcade"
              compact
            />
          </motion.div>
          )}
        </>
      )
    }
  }

  return (
    <>
      <div className="relative min-h-screen bg-arcade-surface">
        <QuizThemeFab />
        <QuizExitButton
          onClick={goHome}
          label={isCustomQuiz ? '← CUSTOM' : isDocumentQuiz ? '← READER' : '← HOME'}
        />
        <AnimatePresence mode="wait">
          {phaseContent && (
            <QuizPhase key={phaseKey} className={phaseShellClass}>
              {phaseContent}
            </QuizPhase>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {levelUpPending && (
          <motion.aside
            role="status"
            aria-live="polite"
            className="fixed top-20 md:top-24 right-4 md:right-8 z-[100] w-[min(100vw-2rem,320px)] pointer-events-auto"
            initial={{ opacity: 0, x: 48, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 48, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <CardArcade className="shadow-2xl">
              <div className="font-arcade text-[10px] md:text-[12px] text-space-star tracking-[2px] mb-4">
                LEVEL UP!
              </div>
              <MetricArcade
                label="NEW LEVEL"
                value={String(levelUpData?.newLevel ?? '')}
                large
              />
              {!levelUpData?.isCustomQuiz && levelUpData?.learningPath && (
                <p className="font-arcade text-[7px] md:text-[8px] text-arcade-secondary tracking-[1px] mt-4 leading-relaxed">
                  UNLOCKED: {levelUpData.learningPath.toUpperCase()}
                </p>
              )}
              <div className="mt-5">
                <ButtonOffset size="sm" onClick={() => clearLevelUp()}>
                  NICE!
                </ButtonOffset>
              </div>
            </CardArcade>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

export default Quiz
