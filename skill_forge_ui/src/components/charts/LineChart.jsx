import { LineChart as RechartsLine, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CardStar from '../ui/CardStar'

const LineChart = ({ data, title = 'Progress Over Time', yLabel = '' }) => {
  return (
    <CardStar>
      <h3 className="font-space font-bold text-[22px] text-raw-white mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLine data={data}>
          <CartesianGrid stroke="#3D3890" strokeDasharray="4 4" />
          <XAxis
            dataKey="round"
            tick={{ fill: '#A78BFA', fontFamily: 'Space Mono', fontSize: 11 }}
          />
          <YAxis
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
            tick={{ fill: '#A78BFA', fontFamily: 'Space Mono', fontSize: 11 }}
          />
          <Line
            dataKey="value"
            stroke="#FDE047"
            strokeWidth={2}
            dot={{ fill: '#FDE047', r: 4 }}
            type="monotone"
          />
          <Tooltip
            contentStyle={{
              background: '#2E2A6E',
              border: '1px solid #A78BFA',
              borderRadius: '8px',
              fontFamily: 'DM Sans',
              color: '#E2DFFF'
            }}
          />
        </RechartsLine>
      </ResponsiveContainer>
    </CardStar>
  )
}

export default LineChart
