import React from 'react'
import ButtonStar from './ui/ButtonStar'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorCount: 0 }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo)
    
    // Increment error count to prevent infinite loops
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }))
    
    // If too many errors, force a full reload to reset state
    if (this.state.errorCount > 3) {
      console.error('Too many errors, forcing page reload')
      window.location.href = '/dashboard'
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

const ErrorFallback = ({ error, resetError }) => {
  const handleReturn = () => {
    // Try to reset error state first
    if (resetError) {
      resetError()
    }
    // Navigate back safely
    setTimeout(() => {
      const token = localStorage.getItem('sf_token')
      if (token) {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/login'
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-raw-black flex flex-col">
      {/* RawBlock Section */}
      <div className="px-8 pt-16">
        <h1 className="font-raw text-raw-white text-[64px] uppercase leading-none">
          SYSTEM ERROR
        </h1>
      </div>

      {/* Arcade Section */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div
          className="border-[3px] border-dotted border-arcade-primary p-6 max-w-2xl w-full"
          style={{ borderRadius: '0px' }}
        >
          <div className="font-arcade text-[9px] text-space-error tracking-[3px] mb-4">
            // CRITICAL FAILURE //
          </div>
          <div className="font-mono text-arcade-secondary text-[12px] break-words">
            {error?.message || 'An unexpected error occurred'}
          </div>
          <div className="font-mono text-[10px] text-gray-500 mt-4">
            {error?.stack?.split('\n').slice(0, 3).join('\n')}
          </div>
        </div>
      </div>

      {/* StarChart Section */}
      <div className="px-8 pb-16 pt-8">
        <ButtonStar 
          size="md" 
          variant="primary"
          onClick={handleReturn}
        >
          RETURN TO DASHBOARD
        </ButtonStar>
        <p className="font-body-space text-[12px] text-space-nebula mt-4">
          Your session is preserved. Click above to continue.
        </p>
      </div>
    </div>
  )
}

export default ErrorBoundary
