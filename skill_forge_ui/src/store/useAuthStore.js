import { create } from 'zustand'

// Check for existing token on init
const token = localStorage.getItem('sf_token')
const userStr = localStorage.getItem('sf_user')
const initialUser = userStr ? JSON.parse(userStr) : null

export const useAuthStore = create((set) => ({
  user: initialUser,
  token: token,
  isAuthenticated: !!token,
  
  setAuth: (token, user) => {
    localStorage.setItem('sf_token', token)
    localStorage.setItem('sf_user', JSON.stringify(user))
    set({ 
      token, 
      user: { ...user, student_id: user.user_id }, // Map user_id to student_id
      isAuthenticated: true 
    })
  },
  
  setUser: (user) => {
    localStorage.setItem('sf_user', JSON.stringify(user))
    set({ user: { ...user, student_id: user.user_id } })
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
