import CardStar from '../ui/CardStar'
import {
  LineChart as RechartsLine,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getThemeColors } from '../../utils/themeColors'

const BehavioralMetricsSection = ({ behavioralMetrics }) => {
  if (!behavioralMetrics) return null

  const { table = [], chart = [], summary = {} } = behavioralMetrics
  const colors = getThemeColors()

  return (
    <section className="mb-12">
      <h2 className="font-space font-bold text-[28px] text-raw-white mb-2">
        Behavioral metrics
      </h2>
      <p className="font-body-space text-[14px] text-space-nebula mb-6">
        Engagement and consistency beyond classification accuracy — exported for
        your learning report.
      </p>

      {summary.sessions_completed !== undefined && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <CardStar>
            <p className="font-body-space text-xs text-space-text-secondary mb-1">
              Sessions
            </p>
            <p className="font-space text-2xl text-space-star">
              {summary.sessions_completed}
            </p>
          </CardStar>
          <CardStar>
            <p className="font-body-space text-xs text-space-text-secondary mb-1">
              Completion rate
            </p>
            <p className="font-space text-2xl text-space-nebula">
              {summary.completion_rate}%
            </p>
          </CardStar>
          <CardStar>
            <p className="font-body-space text-xs text-space-text-secondary mb-1">
              Consistency
            </p>
            <p className="font-space text-2xl text-space-star">
              {Math.round(summary.consistency_score)}%
            </p>
          </CardStar>
        </div>
      )}

      {chart.length > 0 && (
        <CardStar className="mb-8">
          <h3 className="font-space font-bold text-[18px] text-raw-white mb-4">
            Session progress
          </h3>
          <p className="font-body-space text-[13px] text-space-nebula mb-4">
            Quiz score and rolling consistency across recent sessions.
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsLine data={chart}>
              <CartesianGrid stroke={colors.spaceOverlay} strokeDasharray="4 4" />
              <XAxis
                dataKey="session"
                tick={{ fill: colors.spaceNebula, fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: colors.spaceNebula, fontSize: 11 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: colors.spaceSurface,
                  border: `1px solid ${colors.spaceNebula}`,
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                name="Quiz score"
                stroke={colors.spaceStar}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="consistency"
                name="Consistency"
                stroke={colors.spaceNebula}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </RechartsLine>
          </ResponsiveContainer>
        </CardStar>
      )}

      {table.length > 0 && (
        <CardStar>
          <h3 className="font-space font-bold text-[18px] text-raw-white mb-4">
            Metrics table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-space-overlay">
                  <th className="font-body-space text-xs uppercase text-space-text-secondary py-3 pr-4">
                    Metric
                  </th>
                  <th className="font-body-space text-xs uppercase text-space-text-secondary py-3 pr-4">
                    Value
                  </th>
                  <th className="font-body-space text-xs uppercase text-space-text-secondary py-3">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr
                    key={row.metric}
                    className="border-b border-space-overlay/60"
                  >
                    <td className="font-body-space text-sm text-raw-white py-3 pr-4">
                      {row.metric}
                    </td>
                    <td className="font-mono text-sm text-space-star py-3 pr-4">
                      {row.value}
                    </td>
                    <td className="font-body-space text-xs text-space-text-secondary py-3">
                      {row.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardStar>
      )}
    </section>
  )
}

export default BehavioralMetricsSection
