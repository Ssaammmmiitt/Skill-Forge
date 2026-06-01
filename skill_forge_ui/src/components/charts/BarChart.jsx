import { BarChart as RechartsBar, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CardStar from '../ui/CardStar'

const BarChart = ({ data, title = 'Performance Breakdown' }) => {
  return (
    <CardStar>
      <h3 className="font-space font-bold text-[22px] text-raw-white mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBar data={data}>
          <CartesianGrid stroke="#3D3890" strokeDasharray="4 4" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#A78BFA', fontFamily: 'Space Mono', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: '#A78BFA', fontFamily: 'Space Mono', fontSize: 11 }}
          />
          <Bar
            dataKey="value"
            fill="#A78BFA"
            radius={[4, 4, 0, 0]}
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
        </RechartsBar>
      </ResponsiveContainer>
    </CardStar>
  )
}

export default BarChart
