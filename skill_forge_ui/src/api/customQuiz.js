import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const authHeaders = () => {
  const token = localStorage.getItem('sf_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export const getCustomQuizSubjects = async () => {
  const response = await axios.get(`${baseURL}/custom-quiz/subjects`, {
    headers: authHeaders(),
    timeout: 15000,
  })
  const body = response.data
  if (body?.error) throw new Error(body.error)
  return body?.data ?? body
}

export const generateCustomQuiz = async (payload) => {
  try {
    const response = await axios.post(
      `${baseURL}/custom-quiz/generate`,
      payload,
      { headers: authHeaders(), timeout: 120000 }
    )
    const body = response.data
    if (body?.error) throw new Error(body.error)
    return body?.data ?? body
  } catch (err) {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Could not generate customized quiz'
    throw new Error(message)
  }
}

export const submitCustomQuiz = async (payload) => {
  try {
    const response = await axios.post(
      `${baseURL}/custom-quiz/submit`,
      payload,
      { headers: authHeaders(), timeout: 15000 }
    )
    const body = response.data
    if (body?.error) throw new Error(body.error)
    return body?.data ?? body
  } catch (err) {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Could not submit customized quiz'
    throw new Error(message)
  }
}

export const CUSTOM_QUIZ_STORAGE_KEY = 'sf_custom_quiz'

export const saveCustomQuizSession = (payload) => {
  sessionStorage.setItem(CUSTOM_QUIZ_STORAGE_KEY, JSON.stringify(payload))
}

export const loadCustomQuizSession = () => {
  try {
    const raw = sessionStorage.getItem(CUSTOM_QUIZ_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const clearCustomQuizSession = () => {
  sessionStorage.removeItem(CUSTOM_QUIZ_STORAGE_KEY)
}

export const TIMER_OPTIONS = [
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 45, label: '45 seconds' },
  { value: 60, label: '60 seconds' },
  { value: 90, label: '90 seconds' },
  { value: 0, label: 'No timer' },
]

export const QUESTION_COUNT_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10]

export const DIFFICULTY_OPTIONS = [
  { level: 1, label: 'Easy' },
  { level: 2, label: 'Medium' },
  { level: 3, label: 'Hard' },
]

export const CUSTOM_SUBJECT_VALUE = '__custom__'
