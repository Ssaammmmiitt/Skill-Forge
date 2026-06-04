import client from './client'

export const getQuiz = (difficulty, topic) => {
  const config = topic ? { params: { topic } } : {}
  return client.get(`/quiz/${difficulty}`, config)
}

export const submitQuiz = (body) => client.post('/quiz/submit', body)
