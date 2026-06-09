/**
 * Normalize Groq-backed API failures for reader + custom quiz UIs.
 * @returns {{ title: string, message: string, hint?: string, status?: number, retryable: boolean }}
 */
export const parseGroqApiError = (err, context = 'request') => {
  const status = err.response?.status
  const apiError =
    err.response?.data?.error ||
    err.response?.data?.message ||
    null

  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return {
      title: 'Request timed out',
      message: 'The AI took too long to respond.',
      hint: 'Try again in a moment, or use a shorter document.',
      status,
      retryable: true,
    }
  }

  if (!err.response) {
    return {
      title: 'Connection failed',
      message: 'Could not reach the server.',
      hint: 'Check that the API is running on port 5001 and your network is stable.',
      retryable: true,
    }
  }

  if (status === 401) {
    return {
      title: 'Session expired',
      message: apiError || 'You need to sign in again.',
      hint: 'Log out and log back in, then retry.',
      status,
      retryable: false,
    }
  }

  if (status === 503) {
    return {
      title: 'AI not configured',
      message: apiError || 'Groq API key is missing on the server.',
      hint: 'Add GROQ_API_KEY to the project root .env file and restart the API.',
      status,
      retryable: false,
    }
  }

  if (status === 429) {
    return {
      title: 'Rate limited',
      message: apiError || 'Too many AI requests right now.',
      hint: 'Wait a minute and try again, or add GROQ_API_KEY2 in .env.',
      status,
      retryable: true,
    }
  }

  if (status === 502) {
    const msg = apiError || 'The AI service returned an error.'
    const isRateLimit = /rate limit|429|all \d+ api keys/i.test(msg)
    const isJson = /invalid quiz json|quiz format|no quiz questions/i.test(msg)
    return {
      title: isRateLimit ? 'AI rate limited' : isJson ? 'Format error' : 'AI generation failed',
      message: msg,
      hint: isRateLimit
        ? 'The server tried all configured Groq keys. Wait a moment and retry.'
        : isJson
          ? 'The model returned unusable output — try again.'
          : context === 'analyze'
            ? 'Try a shorter document or switch summary/detailed mode.'
            : 'Try again with fewer questions or different content.',
      status,
      retryable: true,
    }
  }

  return {
    title: 'Request failed',
    message: apiError || err.message || 'Something went wrong.',
    hint: 'Try again in a moment.',
    status,
    retryable: status == null || status >= 500,
  }
}

export const groqErrorMessage = (err, context = 'request') => {
  const parsed = parseGroqApiError(err, context)
  const parts = [parsed.title, parsed.message]
  if (parsed.hint) parts.push(parsed.hint)
  return parts.join(' — ')
}
