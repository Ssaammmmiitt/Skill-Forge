import axios from 'axios'
import { parseGroqApiError } from './groqErrors'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const authHeaders = () => {
  const token = localStorage.getItem('sf_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

/**
 * Normalize API / network failures into a structured error for the UI.
 * @returns {{ title: string, message: string, hint?: string, status?: number, retryable: boolean }}
 */
export const parseCustomQuizError = (err) => {
  const parsed = parseGroqApiError(err, 'quiz')
  if (parsed.title === 'Request timed out') {
    return {
      ...parsed,
      hint: 'Try fewer questions, pick an easier difficulty, or try again in a moment.',
    }
  }
  if (parsed.title === 'Format error' || parsed.title === 'AI generation failed') {
    const isFormat = parsed.title === 'Format error'
    return {
      ...parsed,
      title: isFormat ? 'Quiz format error' : 'AI generation failed',
      hint: isFormat
        ? 'The model returned unusable output — try again or change the subject/chapter.'
        : 'Try again with a different subject or fewer questions.',
    }
  }

  if (parsed.title !== 'Request failed') {
    return parsed
  }

  const status = err.response?.status
  const apiError =
    err.response?.data?.error ||
    err.response?.data?.message ||
    null

  if (status === 400) {
    return {
      title: 'Invalid request',
      message: apiError || 'Please check your quiz settings.',
      hint: 'Verify subject, chapter, difficulty, and question count.',
      status,
      retryable: false,
    }
  }

  if (status >= 500) {
    return {
      title: 'Server error',
      message: apiError || 'Something went wrong on the server.',
      hint: 'Try again shortly. If it persists, check the API logs.',
      status,
      retryable: true,
    }
  }

  return {
    title: 'Could not generate quiz',
    message: apiError || err.message || 'An unexpected error occurred.',
    hint: 'Adjust your settings and try again.',
    status,
    retryable: true,
  }
}

const wrapRequest = async (requestFn) => {
  try {
    return await requestFn()
  } catch (err) {
    const parsed = parseCustomQuizError(err)
    const error = new Error(parsed.message)
    error.parsed = parsed
    throw error
  }
}

export const getCustomQuizSubjects = async () => {
  return wrapRequest(async () => {
    const response = await axios.get(`${baseURL}/custom-quiz/subjects`, {
      headers: authHeaders(),
      timeout: 15000,
    })
    const body = response.data
    if (body?.error) {
      const err = new Error(body.error)
      err.response = { status: body.status || 400, data: body }
      throw err
    }
    return body?.data ?? body
  })
}

export const generateCustomQuiz = async (payload) => {
  return wrapRequest(async () => {
    const response = await axios.post(
      `${baseURL}/custom-quiz/generate`,
      payload,
      { headers: authHeaders(), timeout: 120000 }
    )
    const body = response.data
    if (body?.error) {
      const err = new Error(body.error)
      err.response = { status: body.status || 400, data: body }
      throw err
    }
    const data = body?.data ?? body
    if (!data?.questions?.length) {
      const err = new Error('The server returned no questions.')
      err.response = { status: 502, data: { error: err.message } }
      throw err
    }
    return data
  })
}

export const submitCustomQuiz = async (payload) => {
  return wrapRequest(async () => {
    const response = await axios.post(
      `${baseURL}/custom-quiz/submit`,
      payload,
      { headers: authHeaders(), timeout: 15000 }
    )
    const body = response.data
    if (body?.error) {
      const err = new Error(body.error)
      err.response = { status: body.status || 400, data: body }
      throw err
    }
    return body?.data ?? body
  })
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

export const GENERATE_PROGRESS_STAGES = [
  { until: 12, label: 'Preparing your quiz settings…' },
  { until: 28, label: 'Connecting to AI service…' },
  { until: 75, label: 'Generating questions…' },
  { until: 92, label: 'Validating & shuffling options…' },
  { until: 100, label: 'Almost ready…' },
]

export const getGenerateStageLabel = (percent) => {
  const stage = GENERATE_PROGRESS_STAGES.find((s) => percent < s.until)
  return stage?.label ?? GENERATE_PROGRESS_STAGES[GENERATE_PROGRESS_STAGES.length - 1].label
}
