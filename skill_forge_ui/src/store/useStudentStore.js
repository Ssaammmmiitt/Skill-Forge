import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getStudent } from '../api/student'

// Check for existing student data on init
const storedStudent = localStorage.getItem('sf_student')
const initialStudent = storedStudent ? JSON.parse(storedStudent) : null

export const useStudentStore = create(
  persist(
    (set, get) => ({
      student: initialStudent,

      setStudent: (student) => {
        // Persist to localStorage
        if (student) {
          localStorage.setItem('sf_student', JSON.stringify(student))
        }
        set({ student })
      },

      clearStudent: () => {
        localStorage.removeItem('sf_student')
        set({ student: null })
      },

      refreshStudent: async (studentId) => {
        if (!studentId) return
        try {
          const data = await getStudent(studentId)
          // Persist to localStorage
          localStorage.setItem('sf_student', JSON.stringify(data))
          set({ student: data })
          return data
        } catch (error) {
          console.error('Failed to refresh student:', error)
          return null
        }
      },

      applyActivityResult: (updatedAttributes) => {
        const current = get().student
        if (!current || !updatedAttributes) return
        
        const updatedStudent = {
          ...current,
          INT: updatedAttributes.INT ?? current.INT,
          WIS: updatedAttributes.WIS ?? current.WIS,
          energy: updatedAttributes.energy ?? current.energy,
          xp: updatedAttributes.xp ?? current.xp,
          level: updatedAttributes.level ?? current.level,
          attributes: updatedAttributes.attributes ?? current.attributes,
        }
        
        // Persist to localStorage
        localStorage.setItem('sf_student', JSON.stringify(updatedStudent))
        set({ student: updatedStudent })
      },
    }),
    {
      name: 'student-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
