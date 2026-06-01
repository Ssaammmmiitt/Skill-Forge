import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import CardStar from '../ui/CardStar'

const RadarChart = ({ data, title = 'Cognitive Profile' }) => {
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
          <PolarGrid stroke="#3D3890" />
          <PolarAngleAxis
            dataKey="attribute"
            tick={{ fill: '#A78BFA', fontFamily: 'DM Sans', fontSize: 12 }}
          />
          <Radar
            dataKey="value"
            fill="#A78BFA"
            fillOpacity={0.15}
            stroke="#A78BFA"
            strokeWidth={2}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </CardStar>
  )
}

export default RadarChart
