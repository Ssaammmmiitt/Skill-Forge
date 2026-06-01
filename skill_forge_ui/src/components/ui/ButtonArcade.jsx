const ButtonArcade = ({ children, onClick, size = 'md', disabled = false }) => {
  const sizeClasses = {
    sm: 'px-4 py-1.5 min-h-[32px]',
    md: 'px-6 py-2.5 min-h-[44px]',
    lg: 'px-10 py-4 min-h-[56px]'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-arcade-surface text-arcade-primary
        border-[3px] border-dotted border-arcade-primary
        font-arcade text-[9px] tracking-[1px]
        hover:bg-arcade-primary hover:text-arcade-surface
        transition-colors duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses[size]}
      `}
      style={{ borderRadius: '0px' }}
    >
      {children}
    </button>
  )
}

export default ButtonArcade
