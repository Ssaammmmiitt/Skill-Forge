import client from './client'

export const getTodos = (studentId, date) =>
  client.get(`/todos/${studentId}`, { params: { date } })

export const createTodo = (payload) => client.post('/todos', payload)

export const updateTodo = (todoId, payload) =>
  client.patch(`/todos/${todoId}`, payload)

export const deleteTodo = (todoId) => client.delete(`/todos/${todoId}`)

export const copyIncompleteTodos = (payload) =>
  client.post('/todos/copy-incomplete', payload)
