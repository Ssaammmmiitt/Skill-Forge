import { useEffect } from 'react'

export const Toast = ({ message, type = "info", onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [onDismiss])
  
  return (
    <div className="fixed bottom-4 right-4 bg-surface-card border border-hairline p-4 text-ink font-mono text-sm max-w-sm z-50">
      {message}
    </div>
  )
}
