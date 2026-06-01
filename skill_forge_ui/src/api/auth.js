import client from './client'

// Register new user
export const register = (data) => client.post('/auth/register', data)

// Login with username/email and password  
export const login = (data) => client.post('/auth/login', data)

// Google OAuth login
export const googleLogin = (token) => client.post('/auth/google', { token })

// Verify token
export const verifyToken = () => client.get('/auth/verify')

// Logout
export const logout = () => client.post('/auth/logout')

// Get username suggestions
export const getUsernameSuggestions = (firstName) => 
  client.post('/auth/username/suggestions', { first_name: firstName })

// Check username availability
export const checkUsername = (username) => 
  client.post('/auth/username/check', { username })
