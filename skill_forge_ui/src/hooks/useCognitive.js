import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useStudentStore } from '../store/useStudentStore'
import { getCognitiveProfile } from '../api/cognitive'
import { resolveStudentId } from '../utils/resolveStudentId'

export const useCognitive = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const user = useAuthStore((state) => state.user)
  const student = useStudentStore((state) => state.student)

  const fetchProfile = useCallback(async () => {
    const studentId = resolveStudentId(user, student)
    if (!studentId) {
      setError('Sign in again to load your cognitive profile.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getCognitiveProfile(studentId)
      setProfile(data)
    } catch (err) {
      setError(err.message || 'Failed to load cognitive profile')
    } finally {
      setLoading(false)
    }
  }, [user, student])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}
