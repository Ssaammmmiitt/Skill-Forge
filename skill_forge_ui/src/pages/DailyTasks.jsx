import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
import {
  previewTaskEffects,
  loadTasksRewardedToday,
  saveTasksRewardedToday,
  TASK_MAX_PER_DAY,
  WIS_PER_TASK,
} from '../utils/activityPreview'
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
  const [syncingTodoId, setSyncingTodoId] = useState(null)
  const [tasksRewardedToday, setTasksRewardedToday] = useState(0)

  useEffect(() => {
    document.title = 'SKILL FORGE // DAILY TASKS'
  }, [])

  useEffect(() => {
    if (studentId && taskDate) {
      setTasksRewardedToday(loadTasksRewardedToday(studentId, taskDate))
    }
  }, [studentId, taskDate])

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

  const wisRemainingToday = Math.max(0, TASK_MAX_PER_DAY - tasksRewardedToday)
  const atDailyCap = wisRemainingToday === 0

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

  const handleSyncTaskWis = async (todo) => {
    if (!todo.completed || !studentId || syncingTodoId) return

    const preview = previewTaskEffects(1, tasksRewardedToday)
    if (preview.rewardedTasks === 0) {
      addToast({
        message: `Daily WIS cap reached (${TASK_MAX_PER_DAY} syncs per day)`,
        type: 'error',
      })
      return
    }

    setSyncingTodoId(todo.todo_id)
    try {
      const result = await logActivity({
        student_id: studentId,
        activity: 'task_done',
        value: 1,
        activity_date: taskDate,
      })
      await refreshStudent(studentId)

      const wis = result.delta?.WIS ?? 0
      if (wis > 0) {
        const rewarded = Math.max(1, Math.round(wis / WIS_PER_TASK))
        const nextCount = Math.min(TASK_MAX_PER_DAY, tasksRewardedToday + rewarded)
        setTasksRewardedToday(nextCount)
        saveTasksRewardedToday(studentId, taskDate, nextCount)

        await deleteTodo(todo.todo_id)
        await loadTodos()

        addToast({
          message: `+${wis} WIS · "${todo.label}" synced and removed`,
          type: 'info',
        })
      } else {
        const note =
          result.notes?.[0] || 'No WIS gained — daily cap may already be reached'
        setTasksRewardedToday(TASK_MAX_PER_DAY)
        saveTasksRewardedToday(studentId, taskDate, TASK_MAX_PER_DAY)
        addToast({ message: note, type: 'error' })
      }
    } catch (err) {
      addToast({ message: err.message || 'Could not sync WIS', type: 'error' })
    } finally {
      setSyncingTodoId(null)
    }
  }

  const total = todos.length
  const progress = total > 0 ? (completedCount / total) * 100 : 0

  return (
    <motion.div
      className="min-h-screen bg-raw-bg p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="max-w-3xl mx-auto">
        <PageIntro
          title="DAILY TASKS"
          purpose="Build your own checklist for each day. Complete a task, sync WIS for that task, and it is removed from the list. You can add the same task again anytime to log it once more."
          steps={[
            'Pick a date with the arrows or date picker',
            'Add tasks — duplicate names are allowed',
            'Check off a task when done, then press Sync WIS on that row',
            `Up to ${TASK_MAX_PER_DAY} syncs per day (+${WIS_PER_TASK} WIS each); synced tasks are removed automatically`,
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
          <div className="h-3 bg-raw-bg border-[2px] border-raw-link">
            <div
              className="h-full bg-raw-border transition-all duration-300"
              style={{ backgroundColor: 'var(--raw-border)', width: `${progress}%` }}
            />
          </div>
          <p className="font-mono text-[11px] text-raw-text-secondary mt-3">
            WIS syncs today: {tasksRewardedToday} / {TASK_MAX_PER_DAY}
            {atDailyCap && (
              <span className="text-raw-text-tertiary"> · daily cap reached</span>
            )}
          </p>
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
          <p className="font-mono text-[11px] text-raw-text-tertiary mt-3">
            Same task name can be added again after you sync and remove it.
          </p>
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
              {todos.map((todo) => {
                const isSyncing = syncingTodoId === todo.todo_id
                const canSync = todo.completed && !atDailyCap && !isSyncing
                const singlePreview = previewTaskEffects(1, tasksRewardedToday)

                return (
                  <li
                    key={todo.todo_id}
                    className="border-b-[2px] border-raw-border py-3 flex items-start gap-3 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(todo)}
                      disabled={Boolean(syncingTodoId)}
                      className={`mt-0.5 w-5 h-5 shrink-0 border-[2px] border-raw-border flex items-center justify-center ${todo.completed ? 'bg-raw-border' : 'bg-raw-bg'
                        }`}
                      style={{ borderRadius: 0 }}
                      aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {todo.completed && (
                        <span className="font-raw text-raw-bg text-[10px]">✓</span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`font-raw text-[11px] uppercase tracking-wide leading-relaxed block ${todo.completed
                          ? 'text-raw-text-tertiary line-through'
                          : 'text-raw-text'
                          }`}
                      >
                        {todo.label}
                      </span>
                      {todo.completed && (
                        <p className="font-mono text-[10px] text-raw-text-tertiary mt-1">
                          Done — sync WIS to claim reward and remove this task
                        </p>
                      )}
                    </div>
                    {todo.completed && (
                      <ButtonOffset
                        size="sm"
                        onClick={() => handleSyncTaskWis(todo)}
                        disabled={!canSync}
                        className="shrink-0"
                      >
                        {isSyncing
                          ? 'SYNCING…'
                          : atDailyCap
                            ? 'CAP FULL'
                            : `SYNC WIS (+${singlePreview.wisGain})`}
                      </ButtonOffset>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(todo.todo_id)}
                      disabled={Boolean(syncingTodoId)}
                      className="font-mono text-[10px] text-raw-text-tertiary hover:text-raw-error uppercase opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>
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
    </motion.div>
  )
}

export default DailyTasks
