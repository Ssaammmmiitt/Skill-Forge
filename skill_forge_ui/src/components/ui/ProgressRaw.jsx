const ProgressRaw = ({ value, label = '' }) => {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {label && (
        <div className="font-raw text-[10px] uppercase text-raw-white mb-1">
          {label}
        </div>
      )}
      <div
        className="w-full border-[3px] border-raw-white bg-[#1a1a1a] h-3"
        style={{ borderRadius: '0px' }}
      >
        <div
          className="bg-raw-white h-full transition-[width] duration-300"
          style={{ width: `${clampedValue}%`, borderRadius: '0px' }}
        />
      </div>
    </div>
  )
}

export default ProgressRaw
