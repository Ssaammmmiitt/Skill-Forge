const ButtonStar = ({ children, onClick, variant = 'primary', size = 'md', disabled = false }) => {
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs min-h-[32px]',
    md: 'px-6 py-2.5 text-sm min-h-[44px]',
    lg: 'px-10 py-4 text-lg min-h-[56px]'
  }

  const primaryStyle = `
    bg-space-star text-space-deep
    font-space font-semibold rounded-pill
    hover:brightness-110
    transition-all duration-200
  `

  const secondaryStyle = `
    bg-transparent text-space-nebula
    border-[2px] border-space-nebula rounded-pill
    font-space font-semibold
    hover:bg-[rgba(167,139,250,0.15)]
    transition-all duration-200
  `

  const primaryHoverShadow = '0 0 8px rgba(253,224,71,0.35)'
  const secondaryHoverShadow = '0 0 8px rgba(167,139,250,0.3)'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variant === 'primary' ? primaryStyle : secondaryStyle}
        ${sizeClasses[size]}
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = variant === 'primary' ? primaryHoverShadow : secondaryHoverShadow
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </button>
  )
}

export default ButtonStar
