const MetricStar = ({ label, value }) => {
  return (
    <div className="border-[2px] border-space-nebula rounded-md p-4">
      <div className="font-space text-[12px] text-space-nebula mb-1">
        {label}
      </div>
      <div className="font-space font-bold text-[26px] text-space-star">
        {value}
      </div>
    </div>
  )
}

export default MetricStar
