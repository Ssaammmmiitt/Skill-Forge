const MetricArcade = ({ label, value }) => {
  return (
    <div
      className="bg-arcade-surface border-[3px] border-dotted border-space-star p-4"
      style={{ borderRadius: '0px' }}
    >
      <div className="font-arcade text-[8px] text-arcade-secondary tracking-[2px] mb-2">
        {label}
      </div>
      <div className="font-arcade text-[22px] text-space-star tracking-[4px]">
        {value}
      </div>
    </div>
  )
}

export default MetricArcade
