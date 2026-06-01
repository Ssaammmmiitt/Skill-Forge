import { memo } from 'react'
import { LineChart as RechartsLine, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CardStar from '../ui/CardStar'
import { getThemeColors } from '../../utils/themeColors'

const LineChart = memo(({ data, title = 'Progress Over Time', yLabel = '' }) => {
  const colors = getThemeColors()
  
  return (
    <CardStar>
      <h3 className="font-space font-bold text-[22px] text-raw-white mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLine data={data}>
          <CartesianGrid stroke={colors.spaceOverlay} strokeDasharray="4 4" />
          <XAxis
            dataKey="round"
            tick={{ fill: colors.spaceNebula, fontFamily: 'Space Mono', fontSize: 11 }}
          />
          <YAxis
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
            tick={{ fill: colors.spaceNebula, fontFamily: 'Space Mono', fontSize: 11 }}
          />
          <Line
            dataKey="value"
            stroke={colors.spaceStar}
            strokeWidth={2}
            dot={{ fill: colors.spaceStar, r: 4 }}
            type="monotone"
          />
          <Tooltip
            contentStyle={{
              background: colors.spaceSurface,
              border: `1px solid ${colors.spaceNebula}`,
              borderRadius: '8px',
              fontFamily: 'DM Sans',
              color: colors.spaceText
            }}
          />
        </RechartsLine>
      </ResponsiveContainer>
    </CardStar>
  )
})

LineChart.displayName = 'LineChart'

export default LineChart
