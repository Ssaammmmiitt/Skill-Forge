const MetricArcade = ({ label, value, large = false }) => {
  return (
    <div
      className={`bg-arcade-surface border-dotted border-space-star ${
        large
          ? 'border-[3px] md:border-[4px] p-4 md:p-6'
          : 'border-[2px] md:border-[3px] p-2 md:p-4'
      }`}
      style={{ borderRadius: '0px' }}
    >
      <div
        className={`font-arcade text-arcade-secondary uppercase ${
          large
            ? 'text-[9px] md:text-[11px] tracking-[2px] mb-2 md:mb-3 font-bold'
            : 'text-[6px] md:text-[8px] tracking-[1px] md:tracking-[2px] mb-1 md:mb-2'
        }`}
      >
        {label}
      </div>
      <div
        className={`font-arcade text-space-star font-bold ${
          large
            ? 'text-[28px] md:text-[36px] tracking-[3px] md:tracking-[5px]'
            : 'text-[14px] md:text-[22px] tracking-[2px] md:tracking-[4px]'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

export default MetricArcade
