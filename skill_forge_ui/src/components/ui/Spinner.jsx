const Spinner = ({ variant = 'star', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[3px]',
    lg: 'w-8 h-8 border-4'
  }

  if (variant === 'raw') {
    return (
      <div className="inline-block">
        <div
          className={`${sizeMap[size]} border-raw-white border-t-raw-black rounded-circle animate-spin`}
          style={{ borderRadius: '50%' }}
        />
      </div>
    )
  }

  if (variant === 'star') {
    return (
      <div className="inline-block">
        <div
          className={`${sizeMap[size]} border-space-nebula border-t-space-star rounded-circle animate-spin`}
          style={{
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(167,139,250,0.3)'
          }}
        />
      </div>
    )
  }

  if (variant === 'arcade') {
    return (
      <div className="inline-block bg-arcade-surface p-1">
        <div
          className={`${sizeMap[size]} border-dotted border-arcade-primary animate-spin`}
          style={{ borderRadius: '50%' }}
        />
      </div>
    )
  }

  return null
}

export default Spinner
