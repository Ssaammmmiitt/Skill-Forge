import axios from 'axios'
import { groqErrorMessage } from './groqErrors'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

/**
 * Upload a document and get AI-generated study content.
 * @param {File} file
 * @param {'summary'|'detailed'} mode
 * @param {(percent: number) => void} [onUploadProgress]
 */
export const analyzeDocument = async (file, mode, onUploadProgress) => {
  const form = new FormData()
  form.append('file', file)
  form.append('mode', mode)

  const token = localStorage.getItem('sf_token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await axios.post(`${baseURL}/reader/analyze`, form, {
      headers,
      timeout: 180000,
      onUploadProgress: (event) => {
        if (event.total && onUploadProgress) {
          onUploadProgress(Math.round((event.loaded * 100) / event.total))
        }
      },
    })

    const body = response.data
    if (body?.error) {
      throw new Error(body.error)
    }
    return body?.data ?? body
  } catch (err) {
    throw new Error(groqErrorMessage(err, 'analyze'))
  }
}

/**
 * Generate quiz questions from document study content.
 * @param {string} content - Generated study content (markdown)
 * @param {string} filename
 * @param {number} [difficulty=5]
 */
export const generateDocumentQuiz = async (content, filename, difficulty = 5) => {
  const token = localStorage.getItem('sf_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await axios.post(
      `${baseURL}/reader/quiz`,
      { content, filename, difficulty },
      { headers, timeout: 120000 }
    )

    const body = response.data
    if (body?.error) {
      throw new Error(body.error)
    }
    return body?.data ?? body
  } catch (err) {
    throw new Error(groqErrorMessage(err, 'quiz'))
  }
}

export const DOCUMENT_QUIZ_STORAGE_KEY = 'sf_document_quiz'

export const saveDocumentQuizSession = (payload) => {
  sessionStorage.setItem(DOCUMENT_QUIZ_STORAGE_KEY, JSON.stringify(payload))
}

export const loadDocumentQuizSession = () => {
  try {
    const raw = sessionStorage.getItem(DOCUMENT_QUIZ_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const clearDocumentQuizSession = () => {
  sessionStorage.removeItem(DOCUMENT_QUIZ_STORAGE_KEY)
}

export const submitDocumentQuiz = async (payload) => {
  const token = localStorage.getItem('sf_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await axios.post(
      `${baseURL}/reader/quiz/submit`,
      payload,
      { headers, timeout: 15000 }
    )

    const body = response.data
    if (body?.error) {
      throw new Error(body.error)
    }
    return body?.data ?? body
  } catch (err) {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Failed to submit document quiz'
    throw new Error(message)
  }
}
