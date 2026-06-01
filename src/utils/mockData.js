export const mockStudent = {
  student_id: "mock-abc-123",
  name: "Aria Voss",
  INT: 72,
  WIS: 58,
  energy: 85,
  xp: 1240,
  level: 2,
  learning_style: "conceptual",
  streak: 4,
  created_at: "2025-01-15T09:00:00"
}

export const mockSessions = [
  { quiz_score: 62, time_taken: 145, mistakes: 4, difficulty: 4, topic: "history" },
  { quiz_score: 71, time_taken: 130, mistakes: 3, difficulty: 4, topic: "biology" },
  { quiz_score: 78, time_taken: 118, mistakes: 2, difficulty: 5, topic: "mathematics" },
  { quiz_score: 84, time_taken: 105, mistakes: 1, difficulty: 6, topic: "physics" },
  { quiz_score: 88, time_taken: 98, mistakes: 1, difficulty: 6, topic: "chemistry" },
]

export const mockLeaderboard = [
  { rank: 1, name: "Kai Soren", xp: 3400, level: 6, learning_style: "fast_learner", INT: 91, WIS: 78 },
  { rank: 2, name: "Aria Voss", xp: 1240, level: 2, learning_style: "conceptual", INT: 72, WIS: 58 },
  { rank: 3, name: "Leo Thane", xp: 980, level: 1, learning_style: "memorization", INT: 65, WIS: 82 },
  { rank: 4, name: "Mira Ashby", xp: 720, level: 1, learning_style: "slow_learner", INT: 58, WIS: 71 },
  { rank: 5, name: "Dex Okafor", xp: 540, level: 1, learning_style: "fast_learner", INT: 88, WIS: 60 },
]
