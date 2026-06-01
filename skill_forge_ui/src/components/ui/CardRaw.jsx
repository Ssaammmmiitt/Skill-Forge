const CardRaw = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-raw-surface border-[3px] border-raw-border p-6 ${className}`}
      style={{ borderRadius: '0px', boxShadow: 'none' }}
    >
      {children}
    </div>
  )
}

export default CardRaw
