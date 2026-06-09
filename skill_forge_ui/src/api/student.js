import client from './client'

export const getStudent = (id) => client.get(`/student/${id}`)

export const getActivityTotals = (studentId, activityDate) =>
  client.get(`/student/${studentId}/activity-totals`, {
    params: activityDate ? { activity_date: activityDate } : undefined,
  })

export const logActivity = (body) => client.post('/student/log-activity', body)
