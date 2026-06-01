import client from './client'

export const getQuiz = (difficulty) => client.get(`/quiz/${difficulty}`)

export const submitQuiz = (body) => client.post('/quiz/submit', body)
