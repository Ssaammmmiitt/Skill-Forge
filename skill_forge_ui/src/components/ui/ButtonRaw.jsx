const ButtonRaw = ({ children, onClick, size = 'md', disabled = false }) => {
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs min-h-[32px]',
    md: 'px-6 py-2.5 text-sm min-h-[44px]',
    lg: 'px-10 py-4 text-lg min-h-[56px]'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-raw-black text-raw-white border-[3px] border-raw-black
        font-raw uppercase tracking-[2px]
        hover:bg-raw-white hover:text-raw-black
        transition-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses[size]}
      `}
      style={{ borderRadius: '0px' }}
    >
      {children}
    </button>
  )
}

export default ButtonRaw
