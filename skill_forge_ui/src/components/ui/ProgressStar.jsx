const ProgressStar = ({ value, label = '' }) => {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {label && (
        <div className="font-body-space text-[12px] text-space-nebula mb-1">
          {label}
        </div>
      )}
      <div className="w-full border-[2px] border-space-nebula bg-space-deep rounded-pill h-3">
        <div
          className="rounded-pill h-full transition-[width] duration-500"
          style={{
            width: `${clampedValue}%`,
            background: 'linear-gradient(90deg, #A78BFA, #FDE047)'
          }}
        />
      </div>
    </div>
  )
}

export default ProgressStar
