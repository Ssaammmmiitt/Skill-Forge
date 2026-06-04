import axios from 'axios'

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
}
