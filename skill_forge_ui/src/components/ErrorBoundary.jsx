import React from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonStar from './ui/ButtonStar'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

const ErrorFallback = ({ error }) => {
  const navigate = useNavigate()

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
          <div className="font-mono text-arcade-secondary text-[12px]">
            {error?.message || 'An unexpected error occurred'}
          </div>
        </div>
      </div>

      {/* StarChart Section */}
      <div className="px-8 pb-16 pt-8">
        <ButtonStar 
          size="md" 
          variant="primary"
          onClick={() => {
            window.location.href = '/'
          }}
        >
          RETURN TO DASHBOARD
        </ButtonStar>
        <p className="font-body-space text-[12px] text-space-nebula mt-4">
          Your progress has been saved.
        </p>
      </div>
    </div>
  )
}

export default ErrorBoundary
