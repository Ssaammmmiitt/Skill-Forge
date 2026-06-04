const MetricArcade = ({ label, value }) => {
  return (
    <div
      className="bg-arcade-surface border-[2px] md:border-[3px] border-dotted border-space-star p-2 md:p-4"
      style={{ borderRadius: '0px' }}
    >
      <div className="font-arcade text-[6px] md:text-[8px] text-arcade-secondary tracking-[1px] md:tracking-[2px] mb-1 md:mb-2">
        {label}
      </div>
      <div className="font-arcade text-[14px] md:text-[22px] text-space-star tracking-[2px] md:tracking-[4px]">
        {value}
      </div>
    </div>
  )
}

export default MetricArcade
