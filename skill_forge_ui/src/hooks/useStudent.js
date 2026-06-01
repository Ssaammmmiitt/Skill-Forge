import { useState, useEffect } from 'react'
import { useStudentStore } from '../store/useStudentStore'
import * as studentApi from '../api/student'

export const useStudent = (studentId) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { student, setStudent } = useStudentStore()

  const fetchStudent = async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const data = await studentApi.getStudent(studentId)
      setStudent(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { student, loading, error, fetchStudent }
}
