import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { getAnalytics } from '../api/analytics'

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const user = useAuthStore(state => state.user)

  const fetchAnalytics = async () => {
    const studentId = user?.student_id
    if (!studentId) {
      setError('No student ID available')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const data = await getAnalytics(studentId)
      setAnalytics(data)
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [user?.student_id])

  return { analytics, loading, error, refetch: fetchAnalytics }
}
