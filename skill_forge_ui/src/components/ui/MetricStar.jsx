const MetricStar = ({ label, value }) => {
  return (
    <div className="border-[2px] border-space-nebula rounded-md p-3 md:p-4">
      <div className="font-space text-[10px] md:text-[11px] text-space-nebula mb-1 uppercase tracking-wider">
        {label}
      </div>
      <div className="font-space font-bold text-[16px] md:text-[18px] text-space-star leading-tight break-words">
        {value}
      </div>
    </div>
  )
}

export default MetricStar
