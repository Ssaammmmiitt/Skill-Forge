import client from './client'

export const getMetrics = () => client.get('/admin/metrics')

export const triggerRetrain = () => client.post('/admin/retrain')
