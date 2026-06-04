/** Map API student (INT, WIS, energy) → skill mastery % for the learning path UI. */

export const SKILL_TREE = [
  {
    tier: 'Foundation',
    skills: [
      { id: 'logic', name: 'Logical Reasoning', icon: '🧩', attr: 'logic' },
      { id: 'memory', name: 'Memory', icon: '🧠', attr: 'memory' },
      { id: 'attention', name: 'Attention', icon: '👁️', attr: 'attention' },
    ],
  },
  {
    tier: 'Intermediate',
    skills: [
      { id: 'comprehension', name: 'Comprehension', icon: '📖', attr: 'comprehension' },
      { id: 'problem_solving', name: 'Problem Solving', icon: '🎯', attr: 'problem_solving' },
    ],
  },
  {
    tier: 'Advanced',
    skills: [
      { id: 'wisdom', name: 'Wisdom', icon: '🌟', attr: 'wisdom' },
    ],
  },
]

export function buildAttributesFromStudent(student) {
  if (!student) return {}
  if (student.attributes && Object.keys(student.attributes).length > 0) {
    return student.attributes
  }
  const int = student.INT ?? 50
  const wis = student.WIS ?? 50
  const energy = student.energy ?? 50
  return {
    logic: int,
    memory: Math.round(int * 0.55 + wis * 0.25),
    attention: energy,
    comprehension: wis,
    problem_solving: Math.round((int + wis) / 2),
    wisdom: wis,
  }
}

export function getAllSkills() {
  return SKILL_TREE.flatMap((t) => t.skills)
}

export function getSkillMastery(student, skillId) {
  const attrs = buildAttributesFromStudent(student)
  const skill = getAllSkills().find((s) => s.id === skillId)
  return skill ? Math.min(100, Math.max(0, attrs[skill.attr] ?? 0)) : 0
}

export function getSkillStatus(mastery) {
  if (mastery >= 80) return 'mastered'
  if (mastery >= 50) return 'learning'
  if (mastery > 0) return 'started'
  return 'locked'
}

export const SKILL_DESCRIPTIONS = {
  logic: 'Analytical thinking from quizzes and study. Higher INT boosts this skill.',
  memory: 'Recall and retention. Improved by consistent quiz practice and study time.',
  attention: 'Focus and stamina. Tied to your Energy - rest and sleep help here.',
  comprehension: 'Understanding concepts deeply. Grows with WIS and conceptual quiz performance.',
  problem_solving: 'Applying knowledge under pressure. Blend of INT and WIS.',
  wisdom: 'Long-term judgment and synthesis. Your highest-tier goal - driven by WIS.',
}
