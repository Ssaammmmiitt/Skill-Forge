const CardStar = ({ children, variant = 'default', className = '' }) => {
  const defaultStyle = {
    boxShadow: '0 0 8px rgba(167,139,250,0.3)'
  }

  const achievementStyle = {
    boxShadow: '0 0 16px rgba(253,224,71,0.5)'
  }

  return (
    <div
      className={`
        bg-space-surface rounded-lg p-6
        ${variant === 'achievement' ? 'border border-space-star' : ''}
        ${className}
      `}
      style={variant === 'achievement' ? achievementStyle : defaultStyle}
    >
      {children}
    </div>
  )
}

export default CardStar
