import { motion } from 'framer-motion'
import CardStar from '../ui/CardStar'
import BadgeStar from '../ui/BadgeStar'

const SkillRecommendations = ({ allSkills, getSkillMastery, getSkillStatus }) => {
  // Calculate which skills to recommend
  const getRecommendations = () => {
    const recommendations = []

    // Find skills that are 'started' or 'learning' (not mastered or locked)
    const activeSkills = allSkills
      .map(skill => ({
        ...skill,
        mastery: getSkillMastery(skill.id),
        status: getSkillStatus(skill.id)
      }))
      .filter(skill => skill.status === 'started' || skill.status === 'learning')
      .sort((a, b) => b.mastery - a.mastery) // Sort by mastery descending

    // Recommend top 3 skills to work on
    if (activeSkills.length > 0) {
      // Skill closest to next threshold
      const almostNext = activeSkills.find(s => 
        (s.mastery >= 40 && s.mastery < 50) || (s.mastery >= 70 && s.mastery < 80)
      )
      if (almostNext) {
        const nextThreshold = almostNext.mastery < 50 ? 50 : 80
        recommendations.push({
          ...almostNext,
          reason: `Just ${nextThreshold - almostNext.mastery.toFixed(0)}% away from ${nextThreshold === 50 ? 'Learning' : 'Mastered'} status!`,
          priority: 'high'
        })
      }

      // Skills that haven't been touched much
      const needsWork = activeSkills.filter(s => s.mastery < 30 && !recommendations.some(r => r.id === s.id))
      if (needsWork.length > 0) {
        recommendations.push({
          ...needsWork[0],
          reason: 'Build a stronger foundation in this area.',
          priority: 'medium'
        })
      }

      // Highest mastery skill not yet mastered
      const topSkill = activeSkills.find(s => s.mastery >= 50 && s.mastery < 80 && !recommendations.some(r => r.id === s.id))
      if (topSkill) {
        recommendations.push({
          ...topSkill,
          reason: 'You\'re doing great! Push this skill to mastery.',
          priority: 'low'
        })
      }
    }

    // If no active skills, recommend starting something
    if (recommendations.length === 0) {
      const lockedSkills = allSkills
        .map(skill => ({
          ...skill,
          mastery: getSkillMastery(skill.id),
          status: getSkillStatus(skill.id)
        }))
        .filter(skill => skill.status === 'locked')
        .sort((a, b) => a.y - b.y) // Sort by position (foundation first)

      if (lockedSkills.length > 0) {
        recommendations.push({
          ...lockedSkills[0],
          reason: 'Start here to build your foundation.',
          priority: 'high'
        })
      }
    }

    return recommendations.slice(0, 3) // Max 3 recommendations
  }

  const recommendations = getRecommendations()

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-space-star'
      case 'medium': return 'text-space-nebula'
      case 'low': return 'text-space-info'
      default: return 'text-space-text'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'completed'
      case 'medium': return 'pending'
      case 'low': return 'locked'
      default: return 'locked'
    }
  }

  return (
    <CardStar variant="default" className="sticky top-8">
      <div className="mb-4">
        <h3 className="font-space text-[18px] text-space-star mb-2">
          RECOMMENDED FOCUS
        </h3>
        <p className="font-body-space text-space-text-secondary text-xs">
          Based on your current progress
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[36px] mb-2">✨</div>
          <div className="font-body-space text-space-text text-sm">
            Complete a quiz to get personalized recommendations
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-space-sunken rounded-lg p-4 border border-space-overlay hover:border-space-nebula transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="text-[24px]">{rec.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-space text-sm text-space-nebula">
                      {rec.name}
                    </h4>
                    <BadgeStar
                      variant={getPriorityBadge(rec.priority)}
                      size="sm"
                    >
                      {rec.priority.toUpperCase()}
                    </BadgeStar>
                  </div>
                  <p className="font-body-space text-space-text text-xs mb-2">
                    {rec.reason}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-space-deep rounded-full h-1.5">
                      <div
                        className="bg-space-nebula h-full rounded-full transition-all duration-500"
                        style={{ width: `${rec.mastery}%` }}
                      />
                    </div>
                    <span className="font-mono text-space-text-secondary text-[10px]">
                      {rec.mastery.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-space-overlay">
          <p className="font-body-space text-space-text-secondary text-xs text-center">
            💡 Take a quiz in these categories to improve faster
          </p>
        </div>
      )}
    </CardStar>
  )
}

export default SkillRecommendations
