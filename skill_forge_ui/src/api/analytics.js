import client from './client'

export const getAnalytics = (id) => client.get(`/analytics/${id}`)

export const getLeaderboard = (sortBy = 'xp') => client.get(`/leaderboard?sort_by=${sortBy}`)
