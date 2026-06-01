import { create } from 'zustand'
import { mockStudent } from '../utils/mockData'

export const useStudentStore = create((set) => ({
  student: mockStudent,
  setStudent: (student) => set({ student }),
  updateAttributes: (delta) => set((state) => ({
    student: {
      ...state.student,
      ...delta,
    }
  })),
}))
