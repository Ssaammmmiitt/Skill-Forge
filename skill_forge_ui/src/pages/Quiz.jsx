import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useStudentStore } from '../store/useStudentStore'
import { useNotifStore } from '../store/useNotifStore'
import { getQuiz, submitQuiz } from '../api/quiz'
import ButtonArcade from '../components/ui/ButtonArcade'
import ButtonStar from '../components/ui/ButtonStar'
import MetricArcade from '../components/ui/MetricArcade'
import BadgeArcade from '../components/ui/BadgeArcade'
import ProgressRaw from '../components/ui/ProgressRaw'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import ThemeToggle from '../components/ui/ThemeToggle'

const QuizThemeFab = () => (
  <div className="fixed top-6 right-6 z-50">
    <ThemeToggle />
  </div>
)

const Quiz = () => {
  const navigate = useNavigate()
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
  const [timeLeft, setTimeLeft] = useState(30)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

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
    if (phase === 'question' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
    if (phase === 'question' && timeLeft === 0) {
      handleAnswerSelect(null)
    }
  }, [phase, timeLeft])

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getQuiz(5)
      setQuestions(data.questions || [])
      setPhase('question')
      setCurrentIndex(0)
      setScore(0)
      setCorrectCount(0)
      setStreak(0)
      setXpEarned(0)
      setEvents([])
      setAnswers([])
      setTimeLeft(30)
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
    
    setSelectedIndex(index)
    
    setTimeout(() => {
      const isCorrect = index === currentQuestion.correct_index
      const isTimeout = index === null
      
      let questionXP = 0
      let newEvents = []
      let newStreak = streak

      if (isCorrect) {
        setCorrectCount(prev => prev + 1)
        newStreak = streak + 1
        setStreak(newStreak)
        questionXP = 50 + (Math.floor(timeLeft / 3) * 5)
        
        if (newStreak >= 3) newEvents.push(`STREAK ×${newStreak}`)
        if (timeLeft > 25) newEvents.push('QUICK')
        if (newStreak === 5) newEvents.push('PERFECT')
      } else {
        newStreak = 0
        setStreak(0)
        questionXP = isTimeout ? 0 : 10
      }

      setXpEarned(prev => prev + questionXP)
      setScore(prev => prev + (isCorrect ? 20 : 0))
      setEvents(newEvents)
      setAnswers(prev => [...prev, {
        question_id: currentQuestion.id,
        chosen_index: index,
        correct_index: currentQuestion.correct_index,
        topic: currentQuestion.topic,
        _ui_xp: questionXP,
        _ui_correct: isCorrect,
        _ui_timeout: isTimeout,
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
      setTimeLeft(30)
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

      const result = await submitQuiz({
        student_id: user?.student_id,
        answers: apiAnswers,
        difficulty: 5,
        time_taken: answers.length * 30,
      })
      
      // Check for level up
      const oldLevel = student?.level || 1
      const newLevel = result.student?.level || result.new_level || oldLevel
      
      if (newLevel > oldLevel) {
        setLevelUp({
          newLevel,
          learningPath: result.learning_path || result.student?.learning_style || 'Unknown Path'
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

  if (phase === 'start') {
    return (
      <div className="min-h-screen bg-arcade-surface flex items-center justify-center px-6 py-12">
        <QuizThemeFab />
        <button
          onClick={() => navigate('/')}
          className="fixed top-6 left-6 font-arcade text-[8px] text-arcade-secondary hover:text-arcade-primary tracking-[2px]"
        >
          ← EXIT
        </button>

        {loading ? (
          <div className="text-center">
            <Spinner variant="arcade" size="lg" />
            <p className="font-arcade text-[8px] text-arcade-secondary tracking-[2px] mt-4">
              LOADING...
            </p>
          </div>
        ) : error ? (
          <div className="text-center max-w-lg">
            <div className="font-arcade text-[12px] text-space-error tracking-[3px] mb-6">
              // LOAD FAILED //
            </div>
            <p className="font-arcade text-[9px] text-arcade-secondary mb-6">
              {error}
            </p>
            <ButtonArcade size="md" onClick={handleStart}>
              RETRY
            </ButtonArcade>
          </div>
        ) : (
          <div
            className="border-[3px] border-dotted border-arcade-primary max-w-lg w-full p-10"
            style={{ borderRadius: '0px' }}
          >
            <div className="text-center">
              <div className="font-arcade text-[9px] text-arcade-secondary tracking-[3px] mb-8">
                SKILL FORGE
              </div>
              <h1 className="font-arcade text-[22px] text-space-star tracking-[4px] mb-2">
                ASSESSMENT
              </h1>
              <div className="font-arcade text-[9px] text-arcade-secondary tracking-[2px]">
                MODE // ADAPTIVE
              </div>

              <div className="border-b-[3px] border-dotted border-arcade-primary my-6" />

              <div className="grid grid-cols-3 gap-4 mb-8">
                <MetricArcade label="QUESTIONS" value="05" />
                <MetricArcade label="DIFFICULTY" value="05" />
                <MetricArcade label="TIME/Q" value="30S" />
              </div>

              <ButtonArcade size="lg" onClick={handleStart}>
                PRESS START
              </ButtonArcade>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (phase === 'question') {
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-arcade-surface flex items-center justify-center">
          <Spinner variant="arcade" size="lg" />
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-arcade-surface px-8 py-6">
        <QuizThemeFab />
        <button
          onClick={() => navigate('/')}
          className="fixed top-6 left-6 font-arcade text-[8px] text-arcade-secondary hover:text-arcade-primary tracking-[2px]"
        >
          ← EXIT
        </button>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="font-arcade text-[9px] text-arcade-secondary tracking-[2px]">
              Q.{String(currentIndex + 1).padStart(2, '0')}/{String(questions.length).padStart(2, '0')}
            </div>
            <div
              className={`border-[3px] border-dotted px-3 py-1 ${
                timeLeft < 10 ? 'border-arcade-danger' : 'border-arcade-primary'
              }`}
              style={{ borderRadius: '0px' }}
            >
              <span className="font-arcade text-[12px] text-space-star tracking-[2px]">
                00:{String(timeLeft).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <ProgressRaw value={(timeLeft / 30) * 100} />
          </div>

          <div className="border-l-[5px] border-arcade-primary pl-6 mt-4 mb-8">
            <h2 className="font-raw text-raw-white text-[24px] uppercase leading-tight">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`
                  bg-arcade-surface border-[3px] border-dotted p-4 cursor-pointer
                  flex items-center
                  ${selectedIndex === null ? 'hover:border-space-nebula hover:bg-arcade-hover' : ''}
                  ${selectedIndex === index ? 'border-solid border-raw-white bg-arcade-hover' : 'border-arcade-primary'}
                `}
                style={{ borderRadius: '0px' }}
              >
                <span className="font-arcade text-[10px] text-arcade-primary mr-4">
                  {String.fromCharCode(65 + index)}
                </span>
                <span
                  className={`font-arcade text-[9px] tracking-[1px] leading-relaxed ${
                    selectedIndex === index ? 'text-raw-white' : 'text-arcade-secondary'
                  }`}
                >
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'feedback') {
    const lastAnswer = answers[answers.length - 1]
    const isCorrect = lastAnswer._ui_correct
    const isTimeout = lastAnswer._ui_timeout

    return (
      <div className="min-h-screen bg-arcade-surface flex items-center justify-center px-8 py-8">
        <div className="text-center max-w-lg">
          <div className="font-arcade text-[12px] tracking-[3px] mb-6">
            {isTimeout ? '// TIME UP //' : (isCorrect ? '// CORRECT //' : '// WRONG //')}
            <span
              className={`ml-2 ${
                isTimeout ? 'text-arcade-secondary' : (isCorrect ? 'text-space-success' : 'text-space-error')
              }`}
            >
              {isTimeout ? '' : (isCorrect ? '✓' : '✗')}
            </span>
          </div>

          <div className="mb-6">
            <div
              className={`bg-arcade-surface border-[3px] border-solid p-4 ${
                isCorrect ? 'border-space-success' : 'border-arcade-primary'
              }`}
              style={{ borderRadius: '0px' }}
            >
              <span className="font-arcade text-[10px] text-arcade-primary mr-4">
                {String.fromCharCode(65 + currentQuestion.correct_index)}
              </span>
              <span
                className={`font-arcade text-[9px] tracking-[1px] leading-relaxed ${
                  isCorrect ? 'text-space-success' : 'text-arcade-secondary'
                }`}
              >
                {currentQuestion.options[currentQuestion.correct_index]}
              </span>
            </div>
          </div>

          <div className="font-arcade text-[22px] text-space-star tracking-[4px] mt-6">
            +{String(lastAnswer._ui_xp ?? 0).padStart(3, '0')} XP
          </div>

          {events.length > 0 && (
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {events.map((event, i) => (
                <BadgeArcade key={i}>{event}</BadgeArcade>
              ))}
            </div>
          )}

          <div className="mt-8">
            <ButtonArcade size="md" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? 'NEXT QUESTION' : 'FINAL RESULTS'}
            </ButtonArcade>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'complete') {
    if (submitting) {
      return (
        <div className="min-h-screen bg-arcade-surface flex items-center justify-center">
          <div className="text-center">
            <Spinner variant="arcade" size="lg" />
            <p className="font-arcade text-[8px] text-arcade-secondary tracking-[2px] mt-4">
              SUBMITTING...
            </p>
          </div>
        </div>
      )
    }

    if (submitError) {
      return (
        <div className="min-h-screen bg-arcade-surface flex items-center justify-center px-6">
          <div className="text-center max-w-lg">
            <div className="font-arcade text-[12px] text-space-error tracking-[3px] mb-6">
              // SUBMIT FAILED //
            </div>
            <p className="font-arcade text-[9px] text-arcade-secondary mb-6">
              {submitError}
            </p>
            <ButtonArcade size="md" onClick={handleSubmitQuiz}>
              RETRY SUBMIT
            </ButtonArcade>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-arcade-surface flex items-center justify-center px-6 py-12">
        <div
          className="border-[3px] border-dotted border-space-star max-w-lg w-full p-10 mt-16"
          style={{ borderRadius: '0px' }}
        >
          <div className="text-center">
            <div className="font-arcade text-[12px] text-arcade-secondary tracking-[4px] mb-6">
              GAME OVER
            </div>
            <h1 className="font-arcade text-[22px] text-space-star tracking-[4px] mb-8">
              RESULTS
            </h1>

            <div className="mb-4">
              <MetricArcade label="FINAL SCORE" value={String(score).padStart(3, '0')} />
            </div>

            <div className="mt-4">
              <MetricArcade label="XP EARNED" value={`+${xpEarned}`} />
            </div>

            <div className="mt-6">
              <div className="font-arcade text-[8px] text-arcade-secondary tracking-[2px] uppercase">
                PATTERN DETECTED //
              </div>
              <div className="font-arcade text-[12px] text-space-star tracking-[3px] mt-2">
                {correctCount >= 4 ? 'FAST LEARNER' : correctCount >= 3 ? 'CONCEPTUAL' : 'MEMORIZATION'}
              </div>
            </div>

            {answers.filter(a => a.is_correct).length >= 3 && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                <BadgeArcade>STRONG PERFORMANCE</BadgeArcade>
                {correctCount === 5 && <BadgeArcade>PERFECT</BadgeArcade>}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <ButtonArcade size="md" onClick={handleStart}>
                RETRY
              </ButtonArcade>
              <ButtonStar size="md" variant="primary" onClick={() => navigate('/app/analytics')}>
                VIEW STATS
              </ButtonStar>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Level-up modal
  return (
    <Modal
      open={levelUpPending}
      onClose={() => {
        clearLevelUp()
        if (phase === 'complete') navigate('/app/analytics')
      }}
      system="arcade"
      title="LEVEL UP!"
    >
      <div className="text-center">
        <div className="mb-6">
          <MetricArcade 
            label="NEW LEVEL" 
            value={levelUpData?.newLevel || ''} 
          />
        </div>
        <p className="font-arcade text-[8px] text-arcade-secondary tracking-[2px] mt-4">
          UNLOCKED: {levelUpData?.learningPath?.toUpperCase() || 'NEW PATH'}
        </p>
        <div className="mt-6">
          <ButtonArcade size="md" onClick={() => {
            clearLevelUp()
            if (phase === 'complete') navigate('/app/analytics')
          }}>
            CONTINUE
          </ButtonArcade>
        </div>
      </div>
    </Modal>
  )
}

export default Quiz
