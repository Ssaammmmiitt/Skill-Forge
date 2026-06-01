import { getThemeColors } from '../../utils/themeColors'

const StatRing = ({ label, value, size = 80, system = 'star' }) => {
  const colors = getThemeColors()
  const clampedValue = Math.min(100, Math.max(0, value))
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference

  const systemStyles = {
    star: {
      trackStroke: colors.spaceOverlay,
      fillStroke: colors.spaceNebula,
      textColor: colors.spaceText,
      fontClass: 'font-body-space',
      labelColor: colors.spaceNebula
    },
    raw: {
      trackStroke: colors.rawText,
      fillStroke: colors.rawText,
      textColor: colors.rawText,
      fontClass: 'font-mono',
      labelColor: colors.rawText
    },
    arcade: {
      trackStroke: colors.arcadePrimary,
      fillStroke: colors.arcadePrimary,
      textColor: colors.arcadePrimary,
      fontClass: 'font-arcade',
      labelColor: colors.arcadePrimary
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
