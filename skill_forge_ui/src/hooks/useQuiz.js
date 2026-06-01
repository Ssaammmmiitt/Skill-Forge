import { useState, useEffect } from 'react'
import { getQuiz } from '../api/quiz'

export const useQuiz = (difficulty) => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchQuestions = async () => {
    if (!difficulty) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await getQuiz(difficulty)
      setQuestions(data.questions || [])
    } catch (err) {
      setError(err.message || 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [difficulty])

  return { questions, loading, error, refetch: fetchQuestions }
}
