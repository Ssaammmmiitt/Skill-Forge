import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonArcade from '../components/ui/ButtonArcade'
import ButtonStar from '../components/ui/ButtonStar'
import MetricArcade from '../components/ui/MetricArcade'
import BadgeArcade from '../components/ui/BadgeArcade'
import ProgressRaw from '../components/ui/ProgressRaw'
import { useNotifStore } from '../store/useNotifStore'

const MOCK_QUESTIONS = [
  {
    question: "WHAT IS THE PRIMARY MECHANISM OF PHOTOSYNTHESIS IN PLANTS?",
    options: [
      "CONVERSION OF LIGHT ENERGY INTO CHEMICAL ENERGY",
      "ABSORPTION OF WATER THROUGH ROOT SYSTEMS",
      "RELEASE OF CARBON DIOXIDE DURING RESPIRATION",
      "TRANSPORT OF NUTRIENTS VIA XYLEM TISSUE"
    ],
    correctIndex: 0
  },
  {
    question: "WHICH FUNDAMENTAL FORCE IS RESPONSIBLE FOR RADIOACTIVE DECAY?",
    options: [
      "ELECTROMAGNETIC FORCE",
      "GRAVITATIONAL FORCE",
      "WEAK NUCLEAR FORCE",
      "STRONG NUCLEAR FORCE"
    ],
    correctIndex: 2
  },
  {
    question: "IN MATHEMATICS, WHAT DOES THE SYMBOL ∂ REPRESENT?",
    options: [
      "PARTIAL DERIVATIVE",
      "INTEGRAL BOUNDARY",
      "SET COMPLEMENT",
      "VECTOR PRODUCT"
    ],
    correctIndex: 0
  },
  {
    question: "WHAT IS THE PRIMARY FUNCTION OF MITOCHONDRIA IN CELLS?",
    options: [
      "PROTEIN SYNTHESIS",
      "ATP PRODUCTION",
      "LIPID STORAGE",
      "DNA REPLICATION"
    ],
    correctIndex: 1
  },
  {
    question: "WHICH PROGRAMMING PARADIGM EMPHASIZES IMMUTABLE DATA?",
    options: [
      "OBJECT-ORIENTED PROGRAMMING",
      "PROCEDURAL PROGRAMMING",
      "FUNCTIONAL PROGRAMMING",
      "DECLARATIVE PROGRAMMING"
    ],
    correctIndex: 2
  }
]

const Quiz = () => {
  const navigate = useNavigate()
  const addToast = useNotifStore(state => state.addToast)

  const [phase, setPhase] = useState('start')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [events, setEvents] = useState([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [answers, setAnswers] = useState([])

  const currentQuestion = MOCK_QUESTIONS[currentIndex]

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

  const handleStart = () => {
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
  }

  const handleAnswerSelect = (index) => {
    if (selectedIndex !== null) return
    
    setSelectedIndex(index)
    
    setTimeout(() => {
      const isCorrect = index === currentQuestion.correctIndex
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
      setAnswers(prev => [...prev, { index, isCorrect, isTimeout, xp: questionXP }])

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
    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setTimeLeft(30)
      setSelectedIndex(null)
      setPhase('question')
    } else {
      setPhase('complete')
    }
  }

  useEffect(() => {
    if (phase === 'feedback') {
      const timer = setTimeout(handleNext, 2000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  if (phase === 'start') {
    return (
      <div className="min-h-screen bg-arcade-surface flex items-center justify-center px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="fixed top-6 left-6 font-arcade text-[8px] text-arcade-secondary hover:text-arcade-primary tracking-[2px]"
        >
          ← EXIT
        </button>
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
      </div>
    )
  }

  if (phase === 'question') {
    return (
      <div className="min-h-screen bg-arcade-surface px-8 py-6">
        <button
          onClick={() => navigate('/')}
          className="fixed top-6 left-6 font-arcade text-[8px] text-arcade-secondary hover:text-arcade-primary tracking-[2px]"
        >
          ← EXIT
        </button>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="font-arcade text-[9px] text-arcade-secondary tracking-[2px]">
              Q.{String(currentIndex + 1).padStart(2, '0')}/05
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
                  ${selectedIndex === null ? 'hover:border-space-nebula hover:bg-[#0a0a0a]' : ''}
                  ${selectedIndex === index ? 'border-solid border-raw-white bg-[#0d0d0d]' : 'border-arcade-primary'}
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
    const isCorrect = lastAnswer.isCorrect
    const isTimeout = lastAnswer.isTimeout

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
                {String.fromCharCode(65 + currentQuestion.correctIndex)}
              </span>
              <span
                className={`font-arcade text-[9px] tracking-[1px] leading-relaxed ${
                  isCorrect ? 'text-space-success' : 'text-arcade-secondary'
                }`}
              >
                {currentQuestion.options[currentQuestion.correctIndex]}
              </span>
            </div>
          </div>

          <div className="font-arcade text-[22px] text-space-star tracking-[4px] mt-6">
            +{String(lastAnswer.xp).padStart(3, '0')} XP
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
              {currentIndex < MOCK_QUESTIONS.length - 1 ? 'NEXT QUESTION' : 'FINAL RESULTS'}
            </ButtonArcade>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'complete') {
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

            {answers.filter(a => a.isCorrect).length >= 3 && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                <BadgeArcade>STRONG PERFORMANCE</BadgeArcade>
                {correctCount === 5 && <BadgeArcade>PERFECT</BadgeArcade>}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <ButtonArcade size="md" onClick={handleStart}>
                RETRY
              </ButtonArcade>
              <ButtonStar size="md" variant="primary" onClick={() => navigate('/analytics')}>
                VIEW STATS
              </ButtonStar>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default Quiz
