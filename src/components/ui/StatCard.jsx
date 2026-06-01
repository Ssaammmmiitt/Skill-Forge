export const StatCard = ({ label, value, unit = "" }) => {
  return (
    <div className="bg-surface-card border-none rounded-none p-6">
      <div className="text-muted font-mono uppercase text-[11px] tracking-[2px] mb-3">
        {label}
      </div>
      <div className="flex items-baseline">
        <span className="text-ink font-display text-[32px] tracking-[2px]">
          {value}
        </span>
        {unit && (
          <span className="text-muted font-mono text-sm ml-2">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
