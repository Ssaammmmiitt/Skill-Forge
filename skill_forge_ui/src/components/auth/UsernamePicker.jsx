import { useState, useEffect } from 'react'
import { getUsernameSuggestions, checkUsername } from '../../api/auth'

const UsernamePicker = ({ firstName, selectedUsername, onSelect, error: externalError }) => {
  const [suggestions, setSuggestions] = useState([])
  const [customUsername, setCustomUsername] = useState('')
  const [selectedFromSuggestion, setSelectedFromSuggestion] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)
  const [available, setAvailable] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load suggestions only until the user has picked a username
  useEffect(() => {
    if (selectedUsername) return

    const trimmed = firstName?.trim()
    if (!trimmed) {
      setSuggestions([])
      setLoading(false)
      return
    }

    loadSuggestions(trimmed)
  }, [firstName, selectedUsername])

  const loadSuggestions = async (name) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getUsernameSuggestions(name)
      setSuggestions(response.suggestions || [])
    } catch {
      setError('Failed to load username suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomUsernameChange = async (value) => {
    setSelectedFromSuggestion(false)
    setCustomUsername(value)
    setAvailable(null)

    if (!value.trim()) {
      setError(null)
      onSelect('')
      return
    }

    if (value.length < 3) {
      setError('Username must be at least 3 characters')
      onSelect('')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setError('Only letters, numbers, and underscores allowed')
      onSelect('')
      return
    }

    setError(null)
    setChecking(true)

    try {
      const response = await checkUsername(value)
      setAvailable(response.available)
      if (response.available) {
        onSelect(value.toLowerCase())
      } else {
        setError('Username is already taken')
        onSelect('')
      }
    } catch {
      setError('Failed to check username availability')
      onSelect('')
    } finally {
      setChecking(false)
    }
  }

  const handleSuggestionClick = (username) => {
    setCustomUsername(username)
    setSelectedFromSuggestion(true)
    setAvailable(true)
    setError(null)
    onSelect(username)
  }

  const showSuggestionStyle =
    selectedFromSuggestion &&
    customUsername &&
    customUsername.toLowerCase() === selectedUsername?.toLowerCase()

  return (
    <div>
      <label className="font-raw text-[11px] uppercase tracking-[1px] text-raw-white block mb-2">
        Choose Username
      </label>

      {loading ? (
        <div className="font-mono text-raw-text-tertiary text-[12px] mb-4">
          Loading suggestions...
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-2 mb-4">
          {suggestions.map((username) => (
            <button
              key={username}
              type="button"
              onClick={() => handleSuggestionClick(username)}
              className={`w-full text-left px-3 py-2.5 border-[3px] transition-all duration-150
                       font-mono text-[14px] ${selectedUsername === username
                  ? 'bg-raw-border border-raw-border text-raw-bg'
                  : 'bg-raw-surface border-raw-border text-raw-white hover:border-[5px]'
                }`}
              style={{ borderRadius: '0px' }}
            >
              @{username}
              {selectedUsername === username && (
                <span className="float-right">✓</span>
              )}
            </button>
          ))}
        </div>
      ) : null}

      <div>
        <div className="font-mono text-raw-text-tertiary text-[10px] uppercase tracking-[1px] mb-2">
          {selectedUsername ? 'Your username:' : 'Or create your own:'}
        </div>
        <div className="relative">
          <input
            type="text"
            value={customUsername}
            onChange={(e) => handleCustomUsernameChange(e.target.value)}
            placeholder="custom_username"
            className={`w-full bg-raw-surface border-[3px] border-raw-border font-mono text-[15px] px-3 py-2.5
                     focus:outline-none focus:border-[5px] placeholder:text-raw-text-tertiary
                     ${showSuggestionStyle ? 'text-raw-text-tertiary' : 'text-raw-white'}`}
            style={{ borderRadius: '0px' }}
          />
          {checking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="font-mono text-raw-text-tertiary text-[12px]">
                Checking...
              </div>
            </div>
          )}
          {available === true && customUsername && !checking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="text-raw-success text-[16px]">✓</span>
            </div>
          )}
        </div>
        {showSuggestionStyle && (
          <p className="font-mono text-raw-text-tertiary text-[10px] mt-1.5">
            Selected from suggestions - edit to choose a different username
          </p>
        )}
      </div>

      {(error || externalError) && (
        <p className="font-mono text-[11px] text-raw-error mt-2">
          {error || externalError}
        </p>
      )}

      <p className="font-mono text-raw-text-tertiary text-[10px] mt-2">
        3-20 characters, letters, numbers, underscores only
      </p>
    </div>
  )
}

export default UsernamePicker
