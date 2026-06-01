import axios from 'axios'

// Use environment variable or default to /api proxy
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const client = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

client.interceptors.request.use(config => {
  const token = localStorage.getItem('sf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  response => {
    const body = response.data
    if (body && typeof body === 'object' && 'data' in body && 'error' in body) {
      if (body.error) {
        return Promise.reject(new Error(body.error))
      }
      return body.data
    }
    return body
  },
  error => {
    const message = error.response?.data?.error || 'Network error — please try again'
    return Promise.reject(new Error(message))
  }
)

export default client
