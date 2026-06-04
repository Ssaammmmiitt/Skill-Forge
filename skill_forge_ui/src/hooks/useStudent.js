import { useState, useEffect, useCallback } from 'react'
import { useStudentStore } from '../store/useStudentStore'
import { useAuthStore } from '../store/useAuthStore'
import { getStudent } from '../api/student'
import { resolveStudentId } from '../utils/resolveStudentId'

export const useStudent = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { student, setStudent } = useStudentStore()
  const user = useAuthStore((state) => state.user)

  const fetchStudent = useCallback(async (force = false) => {
    const studentId = resolveStudentId(user, student)
    if (!studentId) {
      setError('Sign in again to load your profile.')
      return
    }

    // If we already have student data and not forcing refresh, skip API call
    if (student && !force) {
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const data = await getStudent(studentId)
      setStudent(data)
    } catch (err) {
      setError(err.message || 'Failed to load student data')
      console.error('Failed to fetch student:', err)
    } finally {
      setLoading(false)
    }
  }, [user, student, setStudent])

  useEffect(() => {
    const studentId = resolveStudentId(user, null)
    if (studentId) {
      fetchStudent(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id, user?.student_id])

  const refetch = () => fetchStudent(true)

  return { student, loading, error, refetch }
}
