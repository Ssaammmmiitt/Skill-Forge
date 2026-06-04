import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import ButtonOffset from '../components/ui/ButtonOffset'
import PageIntro from '../components/layout/PageIntro'
import { useAuthStore } from '../store/useAuthStore'
import { useStudentStore } from '../store/useStudentStore'
import { useNotifStore } from '../store/useNotifStore'
import { resolveStudentId } from '../utils/resolveStudentId'
import { todayDateString, shiftDateString, formatDateLabel } from '../utils/localDate'
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  copyIncompleteTodos,
} from '../api/todos'
import { logActivity } from '../api/student'
import Spinner from '../components/ui/Spinner'

const DailyTasks = () => {
  const user = useAuthStore((s) => s.user)
  const student = useStudentStore((s) => s.student)
  const refreshStudent = useStudentStore((s) => s.refreshStudent)
  const addToast = useNotifStore((s) => s.addToast)
  const studentId = resolveStudentId(user, student)

  const [taskDate, setTaskDate] = useState(todayDateString())
  const [todos, setTodos] = useState([])
  const [completedCount, setCompletedCount] = useState(0)
  const [newLabel, setNewLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [rewarding, setRewarding] = useState(false)

  useEffect(() => {
    document.title = 'SKILL FORGE // DAILY TASKS'
  }, [])

  const loadTodos = useCallback(async () => {
    if (!studentId) {
      setError('Sign in to manage your daily tasks.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getTodos(studentId, taskDate)
      setTodos(data.todos || [])
      setCompletedCount(data.completed ?? 0)
    } catch (err) {
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [studentId, taskDate])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  const handleAdd = async () => {
    const label = newLabel.trim()
    if (!label || !studentId) return
    setSaving(true)
    try {
      await createTodo({ student_id: studentId, task_date: taskDate, label })
      setNewLabel('')
      await loadTodos()
      addToast({ message: 'TASK ADDED', type: 'info' })
    } catch (err) {
      addToast({ message: err.message || 'Could not add task', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (todo) => {
    try {
      await updateTodo(todo.todo_id, { completed: !todo.completed })
      await loadTodos()
    } catch (err) {
      addToast({ message: err.message || 'Update failed', type: 'error' })
    }
  }

  const handleDelete = async (todoId) => {
    try {
      await deleteTodo(todoId)
      await loadTodos()
    } catch (err) {
      addToast({ message: err.message || 'Delete failed', type: 'error' })
    }
  }

  const handleCopyYesterday = async () => {
    if (!studentId) return
    const yesterday = shiftDateString(taskDate, -1)
    try {
      const data = await copyIncompleteTodos({
        student_id: studentId,
        from_date: yesterday,
        to_date: taskDate,
      })
      setTodos(data.todos || [])
      addToast({
        message: data.copied ? `COPIED ${data.copied} TASK(S)` : 'NOTHING TO COPY',
        type: 'info',
      })
    } catch (err) {
      addToast({ message: err.message || 'Copy failed', type: 'error' })
    }
  }

  const handleRewardWis = async () => {
    const done = todos.filter((t) => t.completed).length
    if (done === 0 || !studentId) return
    setRewarding(true)
    try {
      const result = await logActivity({
        student_id: studentId,
        activity: 'task_done',
        value: done,
      })
      await refreshStudent(studentId)
      const wis = result.delta?.WIS ?? 0
      addToast({ message: `+${wis} WIS FROM ${done} TASK(S)`, type: 'info' })
    } catch (err) {
      addToast({ message: err.message || 'Could not log rewards', type: 'error' })
    } finally {
      setRewarding(false)
    }
  }

  const total = todos.length
  const progress = total > 0 ? (completedCount / total) * 100 : 0

  return (
    <div className="min-h-screen bg-raw-bg p-6">
      <div className="max-w-3xl mx-auto">
        <PageIntro
          title="DAILY TASKS"
          purpose="Build your own checklist for each day. Tasks are saved per date so you can plan tomorrow or review yesterday. Completing items can earn WIS when you sync rewards."
          steps={[
            'Pick a date with the arrows or date picker',
            'Add tasks - they stay on that day only',
            'Check off work as you go',
            'Use “Sync WIS” to apply completed tasks to your character (same as Log Activity)',
          ]}
        />

        <div
          className="border-[3px] border-raw-border bg-raw-surface p-5 mb-6 flex flex-wrap items-center gap-4"
          style={{ borderRadius: 0 }}
        >
          <ButtonOffset size="sm" onClick={() => setTaskDate(shiftDateString(taskDate, -1))}>
            ← PREV
          </ButtonOffset>
          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="bg-raw-bg border-[2px] border-raw-border font-mono text-sm px-3 py-2 text-raw-text"
            style={{ borderRadius: 0 }}
          />
          <ButtonOffset size="sm" onClick={() => setTaskDate(shiftDateString(taskDate, 1))}>
            NEXT →
          </ButtonOffset>
          <ButtonOffset size="sm" onClick={() => setTaskDate(todayDateString())}>
            TODAY
          </ButtonOffset>
          <span className="font-mono text-xs text-raw-text-secondary uppercase tracking-wide">
            {formatDateLabel(taskDate)}
          </span>
        </div>

        <div
          className="border-[3px] border-raw-border bg-raw-surface p-4 mb-6"
          style={{ borderRadius: 0 }}
        >
          <div className="flex justify-between font-raw text-xs uppercase tracking-wider text-raw-text-secondary mb-2">
            <span>Daily progress</span>
            <span>
              {completedCount} / {total} done
            </span>
          </div>
          <div className="h-3 bg-raw-bg border-[2px] border-raw-border">
            <div
              className="h-full bg-raw-border transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div
          className="border-[3px] border-raw-border bg-raw-surface p-6 mb-6"
          style={{ borderRadius: 0 }}
        >
          <h2 className="font-raw text-lg uppercase tracking-wide text-raw-text mb-4">
            Add task
          </h2>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Review chapter 4, Submit lab report"
              maxLength={200}
              className="flex-1 min-w-[200px] bg-raw-bg border-[2px] border-raw-border font-mono text-sm px-3 py-2 text-raw-text placeholder:text-raw-text-tertiary focus:outline-none focus:border-[3px]"
              style={{ borderRadius: 0 }}
            />
            <ButtonOffset size="md" onClick={handleAdd} disabled={saving || !newLabel.trim()}>
              {saving ? 'ADDING…' : 'ADD'}
            </ButtonOffset>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <ButtonOffset size="sm" onClick={handleCopyYesterday}>
              Copy incomplete from yesterday
            </ButtonOffset>
          </div>
        </div>

        <div
          className="border-[3px] border-raw-border bg-raw-surface p-6"
          style={{ borderRadius: 0 }}
        >
          <h2 className="font-raw text-lg uppercase tracking-wide text-raw-text mb-4">
            Your list
          </h2>

          {loading && (
            <div className="py-8 flex justify-center">
              <Spinner variant="raw" size="md" />
            </div>
          )}

          {error && !loading && (
            <p className="font-mono text-sm text-raw-error border-[2px] border-raw-error p-3">
              {error}
            </p>
          )}

          {!loading && !error && todos.length === 0 && (
            <p className="font-mono text-sm text-raw-text-secondary py-6 text-center">
              No tasks for this day yet. Add one above or copy from yesterday.
            </p>
          )}

          {!loading && todos.length > 0 && (
            <ul className="space-y-0">
              {todos.map((todo) => (
                <li
                  key={todo.todo_id}
                  className="border-b-[2px] border-raw-border py-3 flex items-start gap-3 group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(todo)}
                    className={`mt-0.5 w-5 h-5 shrink-0 border-[2px] border-raw-border flex items-center justify-center ${todo.completed ? 'bg-raw-border' : 'bg-raw-bg'
                      }`}
                    style={{ borderRadius: 0 }}
                    aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {todo.completed && (
                      <span className="font-raw text-raw-bg text-[10px]">✓</span>
                    )}
                  </button>
                  <span
                    className={`flex-1 font-raw text-[11px] uppercase tracking-wide leading-relaxed ${todo.completed
                        ? 'text-raw-text-tertiary line-through'
                        : 'text-raw-text'
                      }`}
                  >
                    {todo.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(todo.todo_id)}
                    className="font-mono text-[10px] text-raw-text-tertiary hover:text-raw-error uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {completedCount > 0 && (
            <div className="mt-6 pt-6 border-t-[2px] border-raw-border">
              <p className="font-mono text-xs text-raw-text-secondary mb-3">
                Log completed tasks to gain WIS (once per sync).
              </p>
              <ButtonOffset
                size="md"
                onClick={handleRewardWis}
                disabled={rewarding}
              >
                {rewarding ? 'SYNCING…' : `SYNC WIS (+${completedCount * 5} max)`}
              </ButtonOffset>
            </div>
          )}
        </div>

        <p className="font-mono text-[11px] text-raw-text-tertiary mt-6">
          Also track study and sleep on{' '}
          <Link to="/app/log" className="underline text-raw-link">
            Log Activity
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export default DailyTasks
