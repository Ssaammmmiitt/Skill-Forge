import { create } from 'zustand'
import { getStudent } from '../api/student'

export const useStudentStore = create((set, get) => ({
  student: null,

  setStudent: (student) => set({ student }),

  clearStudent: () => set({ student: null }),

  refreshStudent: async (studentId) => {
    if (!studentId) return
    const data = await getStudent(studentId)
    set({ student: data })
    return data
  },

  applyActivityResult: (updatedAttributes) => {
    const current = get().student
    if (!current || !updatedAttributes) return
    set({
      student: {
        ...current,
        INT: updatedAttributes.INT ?? current.INT,
        WIS: updatedAttributes.WIS ?? current.WIS,
        energy: updatedAttributes.energy ?? current.energy,
      },
    })
  },
}))
