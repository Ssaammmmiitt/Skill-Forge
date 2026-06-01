import client from './client'

export const getStudent = (id) => client.get(`/student/${id}`)

export const logActivity = (body) => client.post('/student/log-activity', body)
