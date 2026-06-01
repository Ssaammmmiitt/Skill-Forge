import { useState, useEffect } from 'react'
import { useStudentStore } from '../store/useStudentStore'
import { useAuthStore } from '../store/useAuthStore'
import { getStudent } from '../api/student'

export const useStudent = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { student, setStudent } = useStudentStore()
  const user = useAuthStore(state => state.user)

  const fetchStudent = async () => {
    const studentId = user?.student_id
    if (!studentId) {
      setError('No student ID available')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const data = await getStudent(studentId)
      setStudent(data)
    } catch (err) {
      setError(err.message || 'Failed to load student data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudent()
  }, [user?.student_id])

  const refetch = () => fetchStudent()

  return { student, loading, error, refetch }
}
