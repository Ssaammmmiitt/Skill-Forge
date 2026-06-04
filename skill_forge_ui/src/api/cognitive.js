import client from './client'

export const getCognitiveProfile = (studentId) =>
  client.get(`/cognitive/${studentId}`)
