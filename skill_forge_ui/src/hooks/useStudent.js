import { useState, useEffect } from 'react'
import { useStudentStore } from '../store/useStudentStore'
import { useAuthStore } from '../store/useAuthStore'
import { getStudent } from '../api/student'

export const useStudent = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { student, setStudent } = useStudentStore()
  const user = useAuthStore(state => state.user)

  const fetchStudent = async (force = false) => {
    const studentId = user?.student_id
    if (!studentId) {
      setError('No student ID available')
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
  }

  useEffect(() => {
    // Only fetch if student data is not already in store/localStorage
    if (!student && user?.student_id) {
      fetchStudent()
    }
  }, [user?.student_id])

  const refetch = () => fetchStudent(true)

  return { student, loading, error, refetch }
}
