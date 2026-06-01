import { create } from 'zustand'

export const useQuizStore = create((set) => ({
  currentQuestion: null,
  quizHistory: [],
  isLoading: false,
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  addToHistory: (result) =>
    set((state) => ({
      quizHistory: [...state.quizHistory, result]
    })),
  setLoading: (isLoading) => set({ isLoading })
}))
