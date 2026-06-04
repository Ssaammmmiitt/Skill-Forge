import { useEffect } from 'react'
import { useNotifStore } from '../../store/useNotifStore'

const TYPE_STYLES = {
  info: 'border-raw-border bg-raw-surface text-raw-text',
  success: 'border-raw-success bg-raw-surface text-raw-success',
  error: 'border-raw-error bg-raw-surface text-raw-error',
  arcade: 'border-arcade-primary bg-arcade-surface text-space-star',
}

const ToastStack = () => {
  const toasts = useNotifStore((s) => s.toasts)
  const removeToast = useNotifStore((s) => s.removeToast)

  useEffect(() => {
    if (toasts.length === 0) return undefined
    const timers = toasts.map((t) =>
      setTimeout(() => removeToast(t.id), t.duration ?? 5000)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto border-[3px] p-4 shadow-lg font-mono text-[12px] leading-relaxed ${
            TYPE_STYLES[toast.type] || TYPE_STYLES.info
          }`}
          style={{ borderRadius: 0 }}
        >
          <div className="flex justify-between gap-3 items-start">
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="font-raw text-[14px] opacity-70 hover:opacity-100 shrink-0"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
