import { useStudentStore } from '../store/useStudentStore'
import { mockSessions } from '../utils/mockData'
import RadarChart from '../components/charts/RadarChart'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'

const Analytics = () => {
  const student = useStudentStore(state => state.student)

  const progressData = mockSessions.map((session, index) => ({
    round: index + 1,
    value: session.quiz_score
  }))

  const topicData = mockSessions.reduce((acc, session) => {
    const existing = acc.find(item => item.name === session.topic)
    if (existing) {
      existing.value = Math.max(existing.value, session.quiz_score)
    } else {
      acc.push({ name: session.topic, value: session.quiz_score })
    }
    return acc
  }, [])

  return (
    <div className="min-h-full space-y-8">
      <h1 className="font-space text-[36px] leading-tight text-space-nebula mb-8">
        ANALYTICS
      </h1>

      <div className="grid grid-cols-1 gap-8">
        <RadarChart 
          data={student}
          title="Cognitive Profile"
        />

        <LineChart
          data={progressData}
          title="Quiz Score Progression"
          yLabel="Score"
        />

        <BarChart
          data={topicData}
          title="Best Scores by Topic"
        />
      </div>
    </div>
  )
}

export default Analytics
