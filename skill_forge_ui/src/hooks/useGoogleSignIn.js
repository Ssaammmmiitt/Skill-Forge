import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { googleLogin } from '../api/auth'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

let gsiInitialized = false

function ensureGsiInitialized(onCredential) {
  if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return false
  if (!gsiInitialized) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    })
    gsiInitialized = true
  }
  return true
}

export const useGoogleSignIn = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isSdkLoaded, setIsSdkLoaded] = useState(false)
  const callbackRef = useRef(null)

  const handleCredentialResponse = useCallback(
    async (response) => {
      setLoading(true)
      setError(null)
      try {
        const result = await googleLogin(response.credential)
        const { token, user } = result
        setAuth(token, user)
        navigate('/dashboard')
      } catch (err) {
        setError(err.message || 'Google Sign-In failed')
      } finally {
        setLoading(false)
      }
    },
    [navigate, setAuth]
  )

  callbackRef.current = handleCredentialResponse

  useEffect(() => {
    const tryInit = () => {
      if (
        ensureGsiInitialized((res) => callbackRef.current?.(res))
      ) {
        setIsSdkLoaded(true)
        return true
      }
      return false
    }

    if (tryInit()) return

    const checkInterval = setInterval(() => {
      if (tryInit()) clearInterval(checkInterval)
    }, 200)

    const timeout = setTimeout(() => clearInterval(checkInterval), 8000)

    return () => {
      clearInterval(checkInterval)
      clearTimeout(timeout)
    }
  }, [])

  const renderGoogleButton = useCallback((elementId, type = 'signin') => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return

    const el = document.getElementById(elementId)
    if (!el) return

    el.innerHTML = ''

    ensureGsiInitialized((res) => callbackRef.current?.(res))

    try {
      window.google.accounts.id.renderButton(el, {
        theme: 'filled_black',
        size: 'large',
        text: type === 'signup' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        width: Math.min(384, el.offsetWidth || 384),
      })
    } catch (err) {
      console.error('Failed to render Google Sign-In button:', err)
    }
  }, [])

  return {
    renderGoogleButton,
    loading,
    error,
    isConfigured: !!GOOGLE_CLIENT_ID,
    isSdkLoaded,
  }
}
