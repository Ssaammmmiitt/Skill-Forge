const CardArcade = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-arcade-surface border-[3px] border-dotted border-arcade-primary p-4 ${className}`}
      style={{ borderRadius: '0px', boxShadow: 'none' }}
    >
      {children}
    </div>
  )
}

export default CardArcade
