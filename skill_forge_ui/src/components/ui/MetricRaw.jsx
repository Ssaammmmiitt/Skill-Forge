const MetricRaw = ({ label, value }) => {
  return (
    <div
      className="bg-raw-black border-[3px] border-raw-white p-4"
      style={{ borderRadius: '0px' }}
    >
      <div className="font-raw text-[10px] uppercase text-raw-white tracking-[2px] mb-2">
        {label}
      </div>
      <div className="font-raw text-[28px] text-raw-white">
        {value}
      </div>
    </div>
  )
}

export default MetricRaw
