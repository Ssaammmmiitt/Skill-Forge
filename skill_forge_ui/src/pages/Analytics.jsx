import { useEffect } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import RadarChart from '../components/charts/RadarChart'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import CardStar from '../components/ui/CardStar'
import MetricStar from '../components/ui/MetricStar'
import Spinner from '../components/ui/Spinner'

const Analytics = () => {
  const { analytics, loading, error } = useAnalytics()

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // ANALYTICS'
  }, [])

  if (loading) {
    return (
      <div className="min-h-full bg-space-deep flex items-center justify-center">
        <Spinner variant="star" size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full bg-space-deep px-8 py-16">
        <p className="font-body-space text-space-error text-sm mt-4">
          {error}
        </p>
      </div>
    )
  }

  if (!analytics || !analytics.radar || !analytics.score_trend || !analytics.style_history) {
    return (
      <div className="min-h-full bg-space-deep flex items-center justify-center px-8">
        <p className="font-body-space text-space-nebula text-[14px] text-center max-w-md">
          NO SESSION DATA YET — COMPLETE A QUIZ TO SEE YOUR ANALYTICS
        </p>
      </div>
    )
  }

  const radarData = analytics.radar
  const scoreTrendData = analytics.score_trend.map((value, idx) => ({
    round: idx + 1,
    value: value
  }))
  const styleHistoryData = Object.entries(analytics.style_history).map(([name, value]) => ({
    name,
    value
  }))

  return (
    <div className="min-h-full bg-space-deep px-8 py-16">
      <div className="max-w-[1200px] mx-auto">
        
        {/* SECTION 1: COGNITIVE RADAR */}
        <section className="mb-12">
          <h2 className="font-space font-bold text-[28px] text-raw-white mb-2">
            COGNITIVE RADAR
          </h2>
          <p className="font-body-space text-[14px] text-space-nebula mb-8">
            Multi-dimensional attribute visualization
          </p>
          <RadarChart data={radarData} />
        </section>

        {/* DIVIDER */}
        <div className="border-t border-space-overlay my-12" />

        {/* SECTION 2: SCORE TREND */}
        <section className="mb-12">
          <h2 className="font-space font-bold text-[28px] text-raw-white mb-2">
            SCORE TREND
          </h2>
          <p className="font-body-space text-[14px] text-space-nebula mb-8">
            Performance trajectory over sessions
          </p>
          <LineChart 
            data={scoreTrendData}
            title="Quiz Score Progress"
          />
        </section>

        {/* DIVIDER */}
        <div className="border-t border-space-overlay my-12" />

        {/* SECTION 3: SESSION BREAKDOWN */}
        <section className="mb-12">
          <h2 className="font-space font-bold text-[28px] text-raw-white mb-2">
            SESSION BREAKDOWN
          </h2>
          <p className="font-body-space text-[14px] text-space-nebula mb-8">
            Distribution across learning styles
          </p>
          <BarChart 
            data={styleHistoryData}
          />
        </section>

        {/* DIVIDER */}
        <div className="border-t border-space-overlay my-12" />

        {/* SECTION 4: CONSISTENCY METRIC */}
        <section>
          <h2 className="font-space font-bold text-[28px] text-raw-white mb-2">
            CONSISTENCY SCORE
          </h2>
          <p className="font-body-space text-[14px] text-space-nebula mb-8">
            Overall behavioral pattern strength
          </p>
          <div className="max-w-[240px]">
            <CardStar variant="default">
              <MetricStar 
                label="CONSISTENCY SCORE"
                value={Math.round(analytics.consistency_score) + "%"}
              />
            </CardStar>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Analytics
