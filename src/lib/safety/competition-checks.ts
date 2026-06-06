import { SAFETY_LIMITS } from '@/lib/constants/safety-limits'

export type CutSeverity = 'ok' | 'warning' | 'danger'

export interface CutAnalysis {
  cutLbs: number
  cutPercentage: number
  weeksUntilWeighin: number
  weeklyLossPercentage: number
  maxAllowedPercentage: number
  severity: CutSeverity
  messages: string[]
}

const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7

export function analyzeCut(params: {
  startingWeightLbs: number
  targetWeightLbs: number
  weighinType: string
  weighinDate: string
  today?: Date
}): CutAnalysis {
  const { startingWeightLbs, targetWeightLbs, weighinType, weighinDate } = params
  const today = params.today ?? new Date()

  const cutLbs = Math.max(0, startingWeightLbs - targetWeightLbs)
  const cutPercentage =
    startingWeightLbs > 0 ? (cutLbs / startingWeightLbs) * 100 : 0

  const weighin = new Date(`${weighinDate}T00:00:00`)
  const weeksUntilWeighin = Math.max(
    0,
    (weighin.getTime() - today.getTime()) / MS_PER_WEEK
  )

  const weeklyLossPercentage =
    weeksUntilWeighin > 0 ? cutPercentage / weeksUntilWeighin : cutPercentage

  const maxAllowedPercentage =
    weighinType === 'same_day'
      ? SAFETY_LIMITS.MAX_CUT_PERCENTAGE_SAME_DAY
      : SAFETY_LIMITS.MAX_CUT_PERCENTAGE

  const messages: string[] = []
  let severity: CutSeverity = 'ok'

  if (targetWeightLbs >= startingWeightLbs) {
    messages.push('Target weight is at or above starting weight — no cut required.')
    return {
      cutLbs,
      cutPercentage,
      weeksUntilWeighin,
      weeklyLossPercentage,
      maxAllowedPercentage,
      severity: 'ok',
      messages,
    }
  }

  if (cutPercentage > maxAllowedPercentage) {
    severity = 'danger'
    messages.push(
      `This ${cutPercentage.toFixed(1)}% cut exceeds the safe maximum of ${maxAllowedPercentage}% for a ${weighinType.replace(
        /_/g,
        ' '
      )} weigh-in.`
    )
  }

  if (weeklyLossPercentage > SAFETY_LIMITS.MAX_WEEKLY_LOSS_PERCENTAGE) {
    if (severity !== 'danger') severity = 'warning'
    messages.push(
      `Projected weekly loss of ${weeklyLossPercentage.toFixed(
        1
      )}% exceeds the recommended ${SAFETY_LIMITS.MAX_WEEKLY_LOSS_PERCENTAGE}% per week. Consider starting earlier.`
    )
  }

  if (weeksUntilWeighin > SAFETY_LIMITS.MAX_CUT_DURATION_WEEKS) {
    if (severity === 'ok') severity = 'warning'
    messages.push(
      `Weigh-in is more than ${SAFETY_LIMITS.MAX_CUT_DURATION_WEEKS} weeks out — a structured cut shouldn't run that long.`
    )
  }

  if (severity === 'ok') {
    messages.push(
      `A ${cutPercentage.toFixed(1)}% cut over ${weeksUntilWeighin.toFixed(
        1
      )} weeks is within safe limits.`
    )
  }

  return {
    cutLbs,
    cutPercentage,
    weeksUntilWeighin,
    weeklyLossPercentage,
    maxAllowedPercentage,
    severity,
    messages,
  }
}
