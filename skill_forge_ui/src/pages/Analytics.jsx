import { useEffect } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import PageIntro from '../components/layout/PageIntro'
import RadarChart from '../components/charts/RadarChart'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import CardStar from '../components/ui/CardStar'
import MetricStar from '../components/ui/MetricStar'
import Spinner from '../components/ui/Spinner'
import ButtonStar from '../components/ui/ButtonStar'
import { Link } from 'react-router-dom'

const Analytics = () => {
  const { analytics, loading, error, refetch } = useAnalytics()

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
        <PageIntro
          title="ANALYTICS"
          purpose="Charts and ML insights from your quiz behavior—pace, consistency, and learning style over time."
        />
        <p className="font-body-space text-space-error text-sm mt-4">{error}</p>
        <ButtonStar className="mt-4" onClick={refetch}>
          Retry
        </ButtonStar>
      </div>
    )
  }

  const hasSessions = analytics?.score_trend?.length > 0
  const hasSummary = analytics?.cognitive_summary?.learning_style

  if (!analytics) {
    return (
      <div className="min-h-full bg-space-deep flex items-center justify-center px-8">
        <Spinner variant="star" size="lg" />
      </div>
    )
  }

  const radarData = analytics.radar
  const scoreTrendData = (analytics.score_trend || []).map((value, idx) => ({
    round: idx + 1,
    value: value
  }))
  const styleHistoryData = Object.entries(analytics.style_history).map(([name, value]) => ({
    name,
    value
  }))

  const summary = analytics.cognitive_summary

  return (
    <div className="min-h-full bg-space-deep px-8 py-16">
      <div className="max-w-[1200px] mx-auto">
        <PageIntro
          title="ANALYTICS"
          purpose="Your performance dashboard. Machine learning classifies how you learn; charts show whether you're improving and staying consistent."
          steps={[
            'Complete at least one quiz to populate trends',
            'After two quizzes, style distribution becomes meaningful',
            'Use this with Learning Path to decide what to practice',
          ]}
        />

        {!hasSessions && (
          <CardStar className="mb-8">
            <p className="font-body-space text-space-nebula text-sm mb-4">
              No quiz sessions yet. Your AI profile will appear after your first assessment.
            </p>
            <Link to="/quiz">
              <ButtonStar size="sm">Start a quiz</ButtonStar>
            </Link>
          </CardStar>
        )}

        {summary && (
          <section className="mb-12">
            <h2 className="font-space font-bold text-[28px] text-raw-white mb-2">
              AI COGNITIVE PROFILE
            </h2>
            <p className="font-body-space text-[14px] text-space-nebula mb-6">
              Ensemble classification (decision tree + neural network)
            </p>
            <CardStar variant="default">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricStar
                  label="LEARNING STYLE"
                  value={summary.learning_style?.replace(/_/g, ' ') || '—'}
                />
                <MetricStar
                  label="MODEL CONFIDENCE"
                  value={
                    summary.confidence
                      ? `${(summary.confidence * 100).toFixed(0)}%`
                      : '—'
                  }
                />
                <MetricStar
                  label="PACE SCORE"
                  value={`${Math.round(summary.pace_score || 0)}`}
                />
                <MetricStar
                  label="SCORE VELOCITY"
                  value={`${summary.score_velocity >= 0 ? '+' : ''}${summary.score_velocity ?? 0}`}
                />
              </div>
              {summary.explanations?.length > 0 && (
                <ul className="mt-6 space-y-2 font-body-space text-[13px] text-space-nebula list-disc pl-5">
                  {summary.explanations.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
              {analytics.learning_path?.focus && (
                <p className="mt-4 font-body-space text-[14px] text-space-star">
                  Recommended focus: {analytics.learning_path.focus}
                </p>
              )}
            </CardStar>
          </section>
        )}

        <div className="border-t border-space-overlay my-12" />
        
        {analytics.radar && (
          <>
            <section className="mb-12">
              <h2 className="font-space font-bold text-[22px] text-raw-white mb-2">Attribute radar</h2>
              <p className="font-body-space text-[14px] text-space-nebula mb-6">
                INT, WIS, Energy, and derived pace/consistency scores.
              </p>
              <RadarChart data={radarData} />
            </section>
            <div className="border-t border-space-overlay my-12" />
          </>
        )}

        {hasSessions && (
          <>
            <section className="mb-12">
              <h2 className="font-space font-bold text-[22px] text-raw-white mb-2">Score trend</h2>
              <p className="font-body-space text-[14px] text-space-nebula mb-6">
                Quiz scores across your recent sessions.
              </p>
              <LineChart data={scoreTrendData} title="Quiz Score Progress" />
            </section>
            <div className="border-t border-space-overlay my-12" />
            <section className="mb-12">
              <h2 className="font-space font-bold text-[22px] text-raw-white mb-2">Style distribution</h2>
              <p className="font-body-space text-[14px] text-space-nebula mb-6">
                How often the ML model labeled each learning style from your sessions.
              </p>
              <BarChart data={styleHistoryData} />
            </section>
            <div className="border-t border-space-overlay my-12" />
          </>
        )}

        <section>
          <h2 className="font-space font-bold text-[22px] text-raw-white mb-2">Consistency</h2>
          <p className="font-body-space text-[14px] text-space-nebula mb-6">
            Lower score variance across recent quizzes raises this score.
          </p>
          <div className="max-w-[240px]">
            <CardStar variant="default">
              <MetricStar
                label="CONSISTENCY SCORE"
                value={Math.round(analytics.consistency_score ?? 0) + '%'}
              />
            </CardStar>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Analytics
