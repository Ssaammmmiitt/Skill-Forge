const ProgressRaw = ({ value, label = '' }) => {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {label && (
        <div className="font-raw text-[10px] uppercase text-raw-text mb-1">
          {label}
        </div>
      )}
      <div
        className="w-full border-[3px] border-raw-border h-5 relative overflow-hidden"
        style={{ 
          borderRadius: '0px',
          backgroundColor: 'var(--raw-hover)'
        }}
      >
        <div
          className="h-full transition-all duration-300 absolute top-0 left-0"
          style={{ 
            width: `${clampedValue}%`, 
            borderRadius: '0px',
            backgroundColor: 'var(--raw-text)',
            minWidth: clampedValue > 0 ? '3px' : '0' // Ensure visibility even at low percentages
          }}
        />
      </div>
    </div>
  )
}

export default ProgressRaw
