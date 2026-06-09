/**
 * Client-side previews for activity gains — mirrors engine/attributes.py + config.py.
 */

export const ATTR_MAX = 100
export const ATTR_MIN = 0

export const STUDY_MIN_MINUTES = 15
export const STUDY_MAX_MINUTES = 120
export const STUDY_DAILY_INT_CAP = 15
export const STUDY_INT_RATE_PRIMARY = 0.25
export const STUDY_INT_RATE_SECONDARY = 0.12
export const STUDY_PRIMARY_MINUTES = 45
export const STUDY_ENERGY_COST_MIN = 0.15

export const SLEEP_MIN_HOURS = 4
export const SLEEP_MAX_HOURS = 12
export const SLEEP_OPTIMAL_LOW = 7
export const SLEEP_OPTIMAL_HIGH = 9
export const SLEEP_RATE_OPTIMAL = 10
export const SLEEP_RATE_NEAR = 7
export const SLEEP_RATE_POOR = 4

export const WIS_PER_TASK = 4
export const TASK_MAX_PER_DAY = 5

const studyFocusMultiplier = (energy) => {
  if (energy >= 40) return 1
  if (energy >= 20) return 0.75
  if (energy >= 10) return 0.5
  return 0.25
}

const sleepRateForHours = (effectiveHours) => {
  if (effectiveHours >= SLEEP_OPTIMAL_LOW && effectiveHours <= SLEEP_OPTIMAL_HIGH) {
    return {
      rate: SLEEP_RATE_OPTIMAL,
      label: '7–9 h optimal window (10 energy/h)',
    }
  }
  if (
    (effectiveHours >= 6 && effectiveHours < SLEEP_OPTIMAL_LOW) ||
    (effectiveHours > SLEEP_OPTIMAL_HIGH && effectiveHours <= 10)
  ) {
    return {
      rate: SLEEP_RATE_NEAR,
      label: '6–7 h or 9–10 h (7 energy/h)',
    }
  }
  return {
    rate: SLEEP_RATE_POOR,
    label: 'Under 6 h or over 10 h (4 energy/h)',
  }
}

export const previewStudyEffects = (
  minutes,
  energy = 50,
  intAlreadyToday = 0
) => {
  const parsed = parseFloat(minutes)
  const notes = []

  if (!parsed || parsed < STUDY_MIN_MINUTES) {
    return {
      intGain: 0,
      energyCost: 0,
      notes: [`Study at least ${STUDY_MIN_MINUTES} minutes to earn INT.`],
      note: `Minimum ${STUDY_MIN_MINUTES} minutes required`,
    }
  }

  const effective = Math.min(parsed, STUDY_MAX_MINUTES)
  if (parsed > STUDY_MAX_MINUTES) {
    notes.push(`Only the first ${STUDY_MAX_MINUTES} minutes count per session.`)
  }

  const primary = Math.min(effective, STUDY_PRIMARY_MINUTES)
  const secondary = Math.max(0, effective - STUDY_PRIMARY_MINUTES)
  const rawInt =
    (primary * STUDY_INT_RATE_PRIMARY + secondary * STUDY_INT_RATE_SECONDARY) *
    studyFocusMultiplier(energy)

  if (energy < 20) {
    notes.push('Low energy reduced study gains — rest or sleep first.')
  }

  const remainingCap = Math.max(0, STUDY_DAILY_INT_CAP - intAlreadyToday)
  const intGain = Math.min(rawInt, remainingCap)

  if (rawInt > remainingCap && remainingCap <= 0) {
    notes.push(`Daily INT cap (${STUDY_DAILY_INT_CAP}) reached — try again tomorrow.`)
  } else if (rawInt > remainingCap) {
    notes.push(`Daily INT cap applied (${STUDY_DAILY_INT_CAP} max per day).`)
  }

  const energyCost = effective * STUDY_ENERGY_COST_MIN

  return {
    intGain: Math.round(intGain),
    energyCost: Math.round(energyCost),
    notes,
    note: notes[0] || null,
  }
}

export const previewSleepEffects = (
  hours,
  currentEnergy = 50,
  { sleepLoggedToday = false } = {}
) => {
  const parsed = parseFloat(hours)
  const notes = []

  if (sleepLoggedToday) {
    return {
      energyGain: 0,
      rate: 0,
      rateLabel: null,
      notes: ['Sleep already logged today — one entry per day.'],
      note: 'Sleep already logged today — one entry per day.',
    }
  }

  if (!parsed || parsed <= 0) {
    return {
      energyGain: 0,
      rate: 0,
      rateLabel: null,
      notes: ['Enter valid sleep hours.'],
      note: null,
    }
  }

  if (parsed < SLEEP_MIN_HOURS) {
    notes.push(`Under ${SLEEP_MIN_HOURS} h — partial recovery only.`)
  }

  const effective = Math.min(parsed, SLEEP_MAX_HOURS)
  if (parsed > SLEEP_MAX_HOURS) {
    notes.push(`Only the first ${SLEEP_MAX_HOURS} hours count toward recovery.`)
  }

  const { rate, label: rateLabel } = sleepRateForHours(effective)
  const rawGain = effective * rate
  const room = Math.max(0, ATTR_MAX - currentEnergy)
  const energyGain = Math.min(rawGain, room)

  if (currentEnergy >= ATTR_MAX) {
    notes.push('Energy already full.')
  }

  return {
    energyGain: Math.round(energyGain),
    rate,
    rateLabel,
    notes,
    note: notes[0] || null,
  }
}

export const previewTaskEffects = (taskCount, tasksAlreadyRewarded = 0) => {
  const count = Math.max(0, parseInt(taskCount, 10) || 0)
  const remaining = Math.max(0, TASK_MAX_PER_DAY - tasksAlreadyRewarded)
  const rewarded = Math.min(count, remaining)
  const notes = []

  if (rewarded < count) {
    notes.push(`Daily task WIS cap (${TASK_MAX_PER_DAY} tasks) reached for today.`)
  }
  if (rewarded === 0 && count > 0) {
    notes.push('Tasks for this day were already synced.')
  }

  return {
    wisGain: rewarded * WIS_PER_TASK,
    rewardedTasks: rewarded,
    remainingToday: remaining,
    notes,
    note: notes[0] || null,
  }
}

const taskWisStorageKey = (studentId, taskDate) =>
  `sf_task_wis_${studentId}_${taskDate}`

/** Persist how many task WIS syncs were recorded today (browser session hint for UI caps). */
export const loadTasksRewardedToday = (studentId, taskDate) => {
  if (!studentId || !taskDate) return 0
  try {
    return Number(sessionStorage.getItem(taskWisStorageKey(studentId, taskDate)) || 0)
  } catch {
    return 0
  }
}

export const saveTasksRewardedToday = (studentId, taskDate, count) => {
  if (!studentId || !taskDate) return
  try {
    sessionStorage.setItem(taskWisStorageKey(studentId, taskDate), String(count))
  } catch {
    /* ignore quota errors */
  }
}

export const emptyActivityTotals = () => ({
  study_int_today: 0,
  study_minutes_today: 0,
  tasks_wis_today: 0,
  tasks_rewarded_today: 0,
  sleep_logged_today: false,
})
