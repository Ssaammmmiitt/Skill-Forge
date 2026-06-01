export const ProgressBar = ({ value, label = "" }) => {
  return (
    <div className="w-full">
      {label && (
        <div className="text-muted font-mono text-[11px] tracking-[2px] uppercase mb-2">
          {label}
        </div>
      )}
      <div className="w-full h-px bg-hairline">
        <div
          className="h-full bg-ink transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}
