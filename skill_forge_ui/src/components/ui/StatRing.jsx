const StatRing = ({ label, value, size = 80, system = 'star' }) => {
  const clampedValue = Math.min(100, Math.max(0, value))
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference

  const systemStyles = {
    star: {
      trackStroke: '#3D3890',
      fillStroke: '#A78BFA',
      textColor: '#E2DFFF',
      fontClass: 'font-body-space',
      labelColor: '#A78BFA'
    },
    raw: {
      trackStroke: '#333333',
      fillStroke: '#ffffff',
      textColor: '#ffffff',
      fontClass: 'font-mono',
      labelColor: '#ffffff'
    },
    arcade: {
      trackStroke: '#1a1a1a',
      fillStroke: '#2A3FE5',
      textColor: '#FDE047',
      fontClass: 'font-arcade',
      labelColor: '#FDE047'
    }
  }

  const style = systemStyles[system] || systemStyles.star

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={style.trackStroke}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={style.fillStroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className={`${style.fontClass} text-lg font-semibold transform rotate-90`}
          fill={style.textColor}
          style={{ transformOrigin: 'center' }}
        >
          {value}
        </text>
      </svg>
      {label && (
        <div className={`${style.fontClass} text-xs`} style={{ color: style.labelColor }}>
          {label}
        </div>
      )}
    </div>
  )
}

export default StatRing
