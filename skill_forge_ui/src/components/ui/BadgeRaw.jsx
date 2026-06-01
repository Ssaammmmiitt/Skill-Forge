const BadgeRaw = ({ children, active = false }) => {
  return (
    <span
      className={`
        border-[2px] border-raw-black
        font-raw text-[10px] uppercase tracking-[1px]
        px-3 py-1 inline-block
        ${active ? 'bg-raw-black text-raw-white' : 'bg-raw-white text-raw-black'}
      `}
      style={{ borderRadius: '0px' }}
    >
      {children}
    </span>
  )
}

export default BadgeRaw
