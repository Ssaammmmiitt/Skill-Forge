import { create } from 'zustand'
import { mockStudent } from '../utils/mockData'

export const useStudentStore = create((set) => ({
  student: mockStudent,
  setStudent: (student) => set({ student }),
  updateAttributes: (delta) =>
    set((state) => ({
      student: {
        ...state.student,
        INT: Math.max(0, Math.min(100, state.student.INT + (delta.INT || 0))),
        WIS: Math.max(0, Math.min(100, state.student.WIS + (delta.WIS || 0))),
        energy: Math.max(0, Math.min(100, state.student.energy + (delta.energy || 0))),
      }
    }))
}))
