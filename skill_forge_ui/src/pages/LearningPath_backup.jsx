import { useState, useEffect, useRef } from 'react'
import { useStudent } from '../hooks/useStudent'
import CardStar from '../components/ui/CardStar'
import BadgeStar from '../components/ui/BadgeStar'
import ProgressStar from '../components/ui/ProgressStar'
import Spinner from '../components/ui/Spinner'

// Skill tree data structure - maps to cognitive skills
const SKILL_TREE = {
  foundation: {
    id: 'foundation',
    name: 'Foundation',
    skills: [
      { id: 'logic', name: 'Logical Reasoning', category: 'LOG', icon: '🧩', x: 50, y: 100 },
      { id: 'memory', name: 'Memory', category: 'MEM', icon: '🧠', x: 150, y: 100 },
      { id: 'attention', name: 'Attention', category: 'ATT', icon: '👁️', x: 250, y: 100 },
    ]
  },
  intermediate: {
    id: 'intermediate',
    name: 'Intermediate',
    skills: [
      { id: 'comprehension', name: 'Comprehension', category: 'COM', icon: '📖', x: 100, y: 220 },
      { id: 'problem_solving', name: 'Problem Solving', category: 'LOG', icon: '🎯', x: 200, y: 220 },
    ]
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced',
    skills: [
      { id: 'wisdom', name: 'Wisdom', category: 'WIS', icon: '🌟', x: 150, y: 340 },
    ]
  }
}

// Connection paths between skills
const CONNECTIONS = [
  { from: 'logic', to: 'problem_solving' },
  { from: 'memory', to: 'comprehension' },
  { from: 'memory', to: 'problem_solving' },
  { from: 'attention', to: 'problem_solving' },
  { from: 'comprehension', to: 'wisdom' },
  { from: 'problem_solving', to: 'wisdom' },
]

const LearningPath = () => {
  const { student, loading, error } = useStudent()
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [hoveredSkill, setHoveredSkill] = useState(null)
  const svgRef = useRef(null)

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // LEARNING PATH'
  }, [])

  // Get all skills in flat array
  const allSkills = Object.values(SKILL_TREE).flatMap(tier => tier.skills)

  // Calculate skill mastery based on student data
  const getSkillMastery = (skillId) => {
    if (!student?.attributes) return 0
    
    const skill = allSkills.find(s => s.id === skillId)
    if (!skill) return 0

    // Map skill categories to student attributes
    const categoryMap = {
      'LOG': 'logic',
      'MEM': 'memory',
      'ATT': 'attention',
      'COM': 'comprehension',
      'WIS': 'wisdom'
    }

    const attr = categoryMap[skill.category]
    return student.attributes[attr] || 0
  }

  // Get skill status based on mastery
  const getSkillStatus = (skillId) => {
    const mastery = getSkillMastery(skillId)
    if (mastery >= 80) return 'mastered'
    if (mastery >= 50) return 'learning'
    if (mastery > 0) return 'started'
    return 'locked'
  }

  // Get skill color based on status
  const getSkillColor = (status) => {
    switch (status) {
      case 'mastered': return '#FDE047' // star (yellow)
      case 'learning': return '#A78BFA' // nebula (purple)
      case 'started': return '#60A5FA' // info blue
      case 'locked': return '#4B4876' // muted
      default: return '#4B4876'
    }
  }

  // Handle skill click
  const handleSkillClick = (skill) => {
    setSelectedSkill(selectedSkill?.id === skill.id ? null : skill)
  }

  return (
    <div className="min-h-full bg-space-deep">
      {/* HEADER */}
      <div className="px-8 py-10">
        <h1 className="font-space text-[42px] leading-tight text-space-star mb-3">
          LEARNING PATH
        </h1>
        <p className="font-body-space text-space-text text-base leading-relaxed max-w-3xl">
          Your journey through the cognitive skill universe. Each constellation represents a mastery level.
          Click on skills to see details.
        </p>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Spinner variant="star" size="lg" />
        </div>
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="px-8">
          <div 
            className="p-6 border-2 border-space-error rounded-xl"
            style={{
              background: 'rgba(248, 113, 113, 0.1)',
              boxShadow: '0 0 20px rgba(248, 113, 113, 0.2)'
            }}
          >
            <div className="font-space text-space-error text-lg">
              NAVIGATION ERROR
            </div>
            <div className="font-body-space text-space-error text-sm mt-2">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      {!loading && !error && student && (
        <div className="px-8 pb-16">
          {/* OVERALL PROGRESS */}
          <div className="mb-10">
            <CardStar variant="default" className="max-w-4xl">
              <h3 className="font-space text-[20px] text-space-nebula mb-4">
                OVERALL MASTERY
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="font-body-space text-space-text-secondary text-sm mb-2">
                    Cognitive Attributes
                  </div>
                  <ProgressStar 
                    percent={
                      Object.values(student.attributes || {})
                        .reduce((sum, val) => sum + val, 0) / 
                      Object.keys(student.attributes || {}).length
                    } 
                  />
                </div>
                <div>
                  <div className="font-body-space text-space-text-secondary text-sm mb-2">
                    Sessions Completed
                  </div>
                  <div className="font-space text-[24px] text-space-star">
                    {student.sessions_completed || 0}
                  </div>
                </div>
                <div>
                  <div className="font-body-space text-space-text-secondary text-sm mb-2">
                    Total XP
                  </div>
                  <div className="font-space text-[24px] text-space-nebula">
                    {student.xp || 0}
                  </div>
                </div>
              </div>
            </CardStar>
          </div>

          {/* INTERACTIVE SKILL TREE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: SKILL MAP */}
            <div className="lg:col-span-2">
              <CardStar variant="default">
                <h3 className="font-space text-[18px] text-space-star mb-6">
                  SKILL CONSTELLATION
                </h3>
                
                <div className="relative bg-space-sunken rounded-xl p-8 overflow-hidden">
                  {/* Starfield background effect */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent)',
                      backgroundSize: '200px 200px',
                      backgroundPosition: '0 0, 40px 60px, 130px 270px, 70px 100px, 150px 50px'
                    }}
                  />
                  
                  <svg 
                    ref={svgRef}
                    viewBox="0 0 320 420" 
                    className="w-full h-auto relative z-10"
                    style={{ minHeight: '420px' }}
                  >
                    {/* Connection lines */}
                    <g className="connections">
                      {CONNECTIONS.map((conn, idx) => {
                        const fromSkill = allSkills.find(s => s.id === conn.from)
                        const toSkill = allSkills.find(s => s.id === conn.to)
                        if (!fromSkill || !toSkill) return null

                        const fromStatus = getSkillStatus(conn.from)
                        const toStatus = getSkillStatus(conn.to)
                        const isActive = fromStatus !== 'locked' && toStatus !== 'locked'

                        return (
                          <line
                            key={idx}
                            x1={fromSkill.x + 20}
                            y1={fromSkill.y + 20}
                            x2={toSkill.x + 20}
                            y2={toSkill.y + 20}
                            stroke={isActive ? '#A78BFA' : '#2E2A6E'}
                            strokeWidth="2"
                            strokeDasharray={isActive ? '0' : '5,5'}
                            opacity={isActive ? 0.6 : 0.3}
                            style={{
                              transition: 'all 0.3s ease'
                            }}
                          />
                        )
                      })}
                    </g>

                    {/* Skill nodes */}
                    {allSkills.map(skill => {
                      const status = getSkillStatus(skill.id)
                      const mastery = getSkillMastery(skill.id)
                      const isSelected = selectedSkill?.id === skill.id
                      const isHovered = hoveredSkill === skill.id
                      const color = getSkillColor(status)

                      return (
                        <g
                          key={skill.id}
                          transform={`translate(${skill.x}, ${skill.y})`}
                          onClick={() => handleSkillClick(skill)}
                          onMouseEnter={() => setHoveredSkill(skill.id)}
                          onMouseLeave={() => setHoveredSkill(null)}
                          className="cursor-pointer"
                          style={{ transition: 'all 0.3s ease' }}
                        >
                          {/* Glow effect on hover/select */}
                          {(isSelected || isHovered) && (
                            <circle
                              cx="20"
                              cy="20"
                              r="28"
                              fill={color}
                              opacity="0.2"
                              style={{
                                filter: `blur(8px)`,
                                animation: 'pulse 2s ease-in-out infinite'
                              }}
                            />
                          )}

                          {/* Outer ring (progress) */}
                          <circle
                            cx="20"
                            cy="20"
                            r="22"
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            opacity="0.3"
                          />

                          {/* Progress arc */}
                          {mastery > 0 && (
                            <circle
                              cx="20"
                              cy="20"
                              r="22"
                              fill="none"
                              stroke={color}
                              strokeWidth="2"
                              strokeDasharray={`${(mastery / 100) * 138.23} 138.23`}
                              strokeLinecap="round"
                              transform="rotate(-90 20 20)"
                              style={{
                                transition: 'stroke-dasharray 0.5s ease'
                              }}
                            />
                          )}

                          {/* Inner circle */}
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            fill={status === 'locked' ? '#1E1B4B' : color}
                            opacity={status === 'locked' ? 0.5 : 0.9}
                            style={{
                              filter: status !== 'locked' ? `drop-shadow(0 0 6px ${color})` : 'none',
                              transition: 'all 0.3s ease'
                            }}
                          />

                          {/* Icon/Emoji */}
                          <text
                            x="20"
                            y="20"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="16"
                            opacity={status === 'locked' ? 0.4 : 1}
                          >
                            {skill.icon}
                          </text>

                          {/* Skill name */}
                          <text
                            x="20"
                            y="48"
                            textAnchor="middle"
                            fill={color}
                            fontSize="9"
                            fontFamily="DM Sans"
                            opacity="0.9"
                          >
                            {skill.name.split(' ')[0]}
                          </text>

                          {/* Mastery percentage */}
                          {mastery > 0 && (
                            <text
                              x="20"
                              y="60"
                              textAnchor="middle"
                              fill={color}
                              fontSize="7"
                              fontFamily="Space Mono"
                              opacity="0.7"
                            >
                              {mastery.toFixed(0)}%
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-space-surface">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FDE047' }} />
                      <span className="font-body-space text-xs text-space-text-secondary">Mastered (80%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#A78BFA' }} />
                      <span className="font-body-space text-xs text-space-text-secondary">Learning (50%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#60A5FA' }} />
                      <span className="font-body-space text-xs text-space-text-secondary">Started</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#4B4876' }} />
                      <span className="font-body-space text-xs text-space-text-secondary">Locked</span>
                    </div>
                  </div>
                </div>
              </CardStar>
            </div>

            {/* RIGHT: SKILL DETAILS */}
            <div className="lg:col-span-1">
              <CardStar variant="achievement" className="sticky top-8">
                {selectedSkill ? (
                  <div>
                    <div className="text-center mb-4">
                      <div className="text-[48px] mb-2">{selectedSkill.icon}</div>
                      <h3 className="font-space text-[20px] text-space-star mb-2">
                        {selectedSkill.name}
                      </h3>
                      <BadgeStar 
                        variant={getSkillStatus(selectedSkill.id)}
                        size="md"
                      >
                        {getSkillStatus(selectedSkill.id).toUpperCase()}
                      </BadgeStar>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="font-body-space text-space-text-secondary text-sm mb-2">
                          Mastery Level
                        </div>
                        <ProgressStar percent={getSkillMastery(selectedSkill.id)} />
                      </div>

                      <div>
                        <div className="font-body-space text-space-text-secondary text-sm mb-2">
                          Category
                        </div>
                        <div className="font-mono text-space-nebula text-sm">
                          {selectedSkill.category}
                        </div>
                      </div>

                      <div>
                        <div className="font-body-space text-space-text-secondary text-sm mb-2">
                          Description
                        </div>
                        <div className="font-body-space text-space-text text-sm leading-relaxed">
                          {getSkillDescription(selectedSkill.id)}
                        </div>
                      </div>

                      <div>
                        <div className="font-body-space text-space-text-secondary text-sm mb-2">
                          Next Milestone
                        </div>
                        <div className="font-body-space text-space-text text-sm">
                          {getNextMilestone(getSkillMastery(selectedSkill.id))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-[48px] mb-4">🌌</div>
                    <div className="font-space text-space-nebula text-base mb-2">
                      SELECT A SKILL
                    </div>
                    <div className="font-body-space text-space-text-secondary text-sm">
                      Click on any skill node to view details and track your progress
                    </div>
                  </div>
                )}
              </CardStar>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function for skill descriptions
const getSkillDescription = (skillId) => {
  const descriptions = {
    logic: 'Foundation of analytical thinking. Solve puzzles, identify patterns, and make deductions.',
    memory: 'Retain and recall information effectively. Build your mental database.',
    attention: 'Focus and concentration. Filter distractions and maintain awareness.',
    comprehension: 'Understand complex ideas. Connect concepts and extract meaning.',
    problem_solving: 'Apply knowledge to overcome challenges. Think creatively and strategically.',
    wisdom: 'Synthesize experience into insight. Make sound judgments and decisions.',
  }
  return descriptions[skillId] || 'Master this skill to unlock new abilities.'
}

// Helper function for next milestone
const getNextMilestone = (currentMastery) => {
  if (currentMastery < 50) return `Reach 50% to unlock Learning status (${(50 - currentMastery).toFixed(0)}% to go)`
  if (currentMastery < 80) return `Reach 80% to achieve Mastered status (${(80 - currentMastery).toFixed(0)}% to go)`
  return 'Skill Mastered! Keep practicing to maintain proficiency.'
}

export default LearningPath
