/**
 * Client-side previews for activity gains — mirrors engine/attributes.py + config.py.
 */

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

export const previewStudyEffects = (minutes, energy = 50, intAlreadyToday = 0) => {
  const parsed = parseFloat(minutes)
  if (!parsed || parsed < STUDY_MIN_MINUTES) {
    return {
      intGain: 0,
      energyCost: 0,
      note: `Minimum ${STUDY_MIN_MINUTES} minutes required`,
    }
  }

  const effective = Math.min(parsed, STUDY_MAX_MINUTES)
  const primary = Math.min(effective, STUDY_PRIMARY_MINUTES)
  const secondary = Math.max(0, effective - STUDY_PRIMARY_MINUTES)
  const rawInt =
    (primary * STUDY_INT_RATE_PRIMARY + secondary * STUDY_INT_RATE_SECONDARY) *
    studyFocusMultiplier(energy)
  const remainingCap = Math.max(0, STUDY_DAILY_INT_CAP - intAlreadyToday)
  const intGain = Math.min(rawInt, remainingCap)
  const energyCost = effective * STUDY_ENERGY_COST_MIN

  return {
    intGain: Math.round(intGain),
    energyCost: Math.round(energyCost),
    note: energy < 20 ? 'Low energy reduces gains' : null,
  }
}

export const previewSleepEffects = (hours, currentEnergy = 50) => {
  const parsed = parseFloat(hours)
  if (!parsed || parsed <= 0) {
    return { energyGain: 0, note: null }
  }

  const effective = Math.min(parsed, SLEEP_MAX_HOURS)
  let rate = SLEEP_RATE_POOR
  if (effective >= SLEEP_OPTIMAL_LOW && effective <= SLEEP_OPTIMAL_HIGH) {
    rate = SLEEP_RATE_OPTIMAL
  } else if (
    (effective >= 6 && effective < SLEEP_OPTIMAL_LOW) ||
    (effective > SLEEP_OPTIMAL_HIGH && effective <= 10)
  ) {
    rate = SLEEP_RATE_NEAR
  }

  const rawGain = effective * rate
  const room = Math.max(0, 100 - currentEnergy)
  return {
    energyGain: Math.round(Math.min(rawGain, room)),
    note: parsed < SLEEP_MIN_HOURS ? 'Under 4 h — partial recovery' : null,
  }
}

export const previewTaskEffects = (taskCount, tasksAlreadyRewarded = 0) => {
  const count = Math.max(0, parseInt(taskCount, 10) || 0)
  const remaining = Math.max(0, TASK_MAX_PER_DAY - tasksAlreadyRewarded)
  const rewarded = Math.min(count, remaining)
  return {
    wisGain: rewarded * WIS_PER_TASK,
    rewardedTasks: rewarded,
    note: rewarded < count ? `Daily cap: ${TASK_MAX_PER_DAY} tasks` : null,
  }
}
