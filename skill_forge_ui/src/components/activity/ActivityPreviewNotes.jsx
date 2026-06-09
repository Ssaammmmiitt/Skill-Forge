const ActivityPreviewNotes = ({ notes = [], rateLabel = null, className = '' }) => {
  if (!rateLabel && notes.length === 0) return null

  return (
    <div className={`space-y-1 ${className}`}>
      {rateLabel && (
        <div className="text-raw-text-secondary text-[10px] normal-case font-mono">
          {rateLabel}
        </div>
      )}
      {notes.map((line) => (
        <div
          key={line}
          className="text-raw-text-tertiary text-[10px] normal-case font-mono"
        >
          {line}
        </div>
      ))}
    </div>
  )
}

export default ActivityPreviewNotes
