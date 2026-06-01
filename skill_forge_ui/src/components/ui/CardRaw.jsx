const CardRaw = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-raw-white border-[3px] border-raw-black p-6 ${className}`}
      style={{ borderRadius: '0px', boxShadow: 'none' }}
    >
      {children}
    </div>
  )
}

export default CardRaw
