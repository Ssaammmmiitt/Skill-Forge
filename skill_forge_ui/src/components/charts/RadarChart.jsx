import { memo } from 'react'
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import CardStar from '../ui/CardStar'
import { getThemeColors } from '../../utils/themeColors'

const RadarChart = memo(({ data, title = 'Cognitive Profile' }) => {
  const colors = getThemeColors()
  
  const chartData = [
    { attribute: 'INT', value: data.INT },
    { attribute: 'WIS', value: data.WIS },
    { attribute: 'ENERGY', value: data.energy },
    { attribute: 'XP', value: data.xp_normalized || Math.min(100, Math.floor(data.xp / 10)) },
    { attribute: 'LEVEL', value: data.level_normalized || (data.level * 10) }
  ]

  return (
    <CardStar>
      <h3 className="font-space font-bold text-[22px] text-raw-white mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadar data={chartData}>
          <PolarGrid stroke={colors.spaceOverlay} />
          <PolarAngleAxis
            dataKey="attribute"
            tick={{ fill: colors.spaceNebula, fontFamily: 'DM Sans', fontSize: 12 }}
          />
          <Radar
            dataKey="value"
            fill={colors.spaceNebula}
            fillOpacity={0.15}
            stroke={colors.spaceNebula}
            strokeWidth={2}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </CardStar>
  )
})

RadarChart.displayName = 'RadarChart'

export default RadarChart
