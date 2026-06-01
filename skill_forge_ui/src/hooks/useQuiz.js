import { useState } from 'react'
import { useQuizStore } from '../store/useQuizStore'
import * as quizApi from '../api/quiz'

export const useQuiz = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { currentQuestion, setCurrentQuestion, addToHistory } = useQuizStore()

  const fetchQuestion = async (studentId) => {
    setLoading(true)
    try {
      const question = await quizApi.getAdaptiveQuestion(studentId)
      setCurrentQuestion(question)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async (data) => {
    setLoading(true)
    try {
      const result = await quizApi.submitQuizAnswer(data)
      addToHistory(result)
      setError(null)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { currentQuestion, loading, error, fetchQuestion, submitAnswer }
}
