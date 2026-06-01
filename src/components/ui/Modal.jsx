export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-surface-card border-none rounded-none p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display uppercase tracking-[2px] text-xl text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-pill border border-ink text-ink hover:bg-white/5 transition-colors flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}
