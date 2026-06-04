import client from './client'

export const getModelComparison = () => client.get('/ml/comparison')

export const confusionMatrixUrl = () => {
  const base = import.meta.env.VITE_API_URL || ''
  return base ? `${base}/api/ml/confusion-matrix` : '/api/ml/confusion-matrix'
}
