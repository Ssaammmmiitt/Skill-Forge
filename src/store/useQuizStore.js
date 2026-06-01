import { create } from 'zustand'

export const useQuizStore = create((set) => ({
  currentQuiz: null,
  questions: [],
  currentQuestion: 0,
  answers: [],
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setQuestions: (questions) => set({ questions }),
  nextQuestion: () => set((state) => ({ currentQuestion: state.currentQuestion + 1 })),
  addAnswer: (answer) => set((state) => ({ answers: [...state.answers, answer] })),
  reset: () => set({ currentQuiz: null, questions: [], currentQuestion: 0, answers: [] }),
}))
