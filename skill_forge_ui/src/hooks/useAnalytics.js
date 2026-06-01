import { useState } from 'react'
import * as analyticsApi from '../api/analytics'

export const useAnalytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAnalytics = async (studentId) => {
    setLoading(true)
    try {
      const result = await analyticsApi.getAnalytics(studentId)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const result = await analyticsApi.getLeaderboard()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fetchAnalytics, fetchLeaderboard }
}
