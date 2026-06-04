import { create } from 'zustand'

// Check for existing token on init
const token = localStorage.getItem('sf_token')
const userStr = localStorage.getItem('sf_user')
const normalizeUser = (user) => {
  if (!user) return null
  const id = user.student_id || user.user_id
  return id ? { ...user, student_id: id, user_id: user.user_id || id } : user
}

const initialUser = normalizeUser(userStr ? JSON.parse(userStr) : null)
if (initialUser) {
  localStorage.setItem('sf_user', JSON.stringify(initialUser))
}

export const useAuthStore = create((set) => ({
  user: initialUser,
  token: token,
  isAuthenticated: !!token,
  
  setAuth: (token, user) => {
    const normalized = normalizeUser(user)
    localStorage.setItem('sf_token', token)
    localStorage.setItem('sf_user', JSON.stringify(normalized))
    set({
      token,
      user: normalized,
      isAuthenticated: true,
    })
  },

  setUser: (user) => {
    const normalized = normalizeUser(user)
    localStorage.setItem('sf_user', JSON.stringify(normalized))
    set({ user: normalized })
  },
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('sf_token', token)
      set({ token, isAuthenticated: true })
    } else {
      localStorage.removeItem('sf_token')
      set({ token: null, isAuthenticated: false })
    }
  },
  
  logout: () => {
    localStorage.removeItem('sf_token')
    localStorage.removeItem('sf_user')
    set({ user: null, token: null, isAuthenticated: false })
  }
}))
