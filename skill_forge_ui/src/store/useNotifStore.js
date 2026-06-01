import { create } from 'zustand'

export const useNotifStore = create((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), type: 'info', ...toast }]
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),
  levelUpPending: false,
  levelUpData: null,
  setLevelUp: (data) => set({ levelUpPending: true, levelUpData: data }),
  clearLevelUp: () => set({ levelUpPending: false, levelUpData: null })
}))
