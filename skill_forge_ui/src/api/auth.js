import client from './client'

// Register new user
export const register = (data) => client.post('/auth/register', data)

// Login with email/password  
export const login = (data) => client.post('/auth/login', data)

// Google OAuth login
export const googleLogin = (token) => client.post('/auth/google', { token })

// Verify token
export const verifyToken = () => client.get('/auth/verify')

// Logout
export const logout = () => client.post('/auth/logout')
