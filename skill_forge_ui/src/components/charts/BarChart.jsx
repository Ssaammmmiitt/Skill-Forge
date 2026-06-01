import { memo } from 'react'
import { BarChart as RechartsBar, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CardStar from '../ui/CardStar'
import { getThemeColors } from '../../utils/themeColors'

const BarChart = memo(({ data, title = 'Performance Breakdown' }) => {
  const colors = getThemeColors()
  
  return (
    <CardStar>
      <h3 className="font-space font-bold text-[22px] text-raw-white mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBar data={data}>
          <CartesianGrid stroke={colors.spaceOverlay} strokeDasharray="4 4" />
          <XAxis
            dataKey="name"
            tick={{ fill: colors.spaceNebula, fontFamily: 'Space Mono', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: colors.spaceNebula, fontFamily: 'Space Mono', fontSize: 11 }}
          />
          <Bar
            dataKey="value"
            fill={colors.spaceNebula}
            radius={[4, 4, 0, 0]}
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
        </RechartsBar>
      </ResponsiveContainer>
    </CardStar>
  )
})

BarChart.displayName = 'BarChart'

export default BarChart
