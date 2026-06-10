'use client'

import { useActionState, useEffect, useState } from 'react'
import { saveCheckin, type CheckinFormState } from '@/app/(app)/checkin/actions'
import {
  CARD_CLASS,
  FIELD_LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
  UPPER_LABEL_CLASS,
} from '@/components/ui/classNames'

export interface CheckinValues {
  morning_weight_lbs?: number | null
  evening_weight_lbs?: number | null
  calories_consumed?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  fiber_g?: number | null
  water_intake_oz?: number | null
  sodium_mg?: number | null
  energy_level?: number | null
  sleep_hours?: number | null
  sleep_quality?: number | null
  training_intensity?: number | null
  notes?: string | null
}

interface Props {
  todayDate: string
  initial: CheckinValues
  hasToday: boolean
  yesterdayWeight: number | null
}

function nv(v: number | null | undefined): number | undefined {
  return v == null ? undefined : v
}

function WeightChange({
  current,
  yesterday,
}: {
  current: number | null
  yesterday: number | null
}) {
  if (current == null || yesterday == null || !Number.isFinite(current)) return null
  const diff = current - yesterday
  if (Math.abs(diff) < 0.05) {
    return <p className="text-text-secondary text-sm font-medium mt-2">No change from yesterday</p>
  }
  const down = diff < 0
  const sign = down ? '' : '+'
  return (
    <p className={`text-sm mt-2 font-medium ${down ? 'text-cyan' : 'text-danger'}`}>
      {sign}
      {diff.toFixed(1)} lbs from yesterday
    </p>
  )
}

export default function CheckinForm({
  todayDate,
  initial,
  hasToday,
  yesterdayWeight,
}: Props) {
  const [state, formAction, pending] = useActionState<CheckinFormState, FormData>(
    saveCheckin,
    {}
  )

  const [mode, setMode] = useState<'form' | 'summary'>(hasToday ? 'summary' : 'form')
  const [morningWeight, setMorningWeight] = useState<string>(
    initial.morning_weight_lbs != null ? String(initial.morning_weight_lbs) : ''
  )
  const [savedWeight, setSavedWeight] = useState<number | null>(
    hasToday ? initial.morning_weight_lbs ?? null : null
  )
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (state.success) {
      const w = Number(morningWeight)
      setSavedWeight(
        state.savedWeight ?? (Number.isFinite(w) && morningWeight !== '' ? w : null)
      )
      setMode('summary')
    }
  }, [state.success, state.savedWeight, morningWeight])

  if (mode === 'summary') {
    return (
      <div className={`${CARD_CLASS} p-6 text-center`}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
          <svg
            className="h-6 w-6 text-success"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-xl font-bold text-text-primary">Check-in logged</p>
        {savedWeight != null && (
          <p className="text-3xl font-bold text-text-primary mt-2">
            {savedWeight} lbs
          </p>
        )}
        <div className="flex justify-center">
          <WeightChange current={savedWeight} yesterday={yesterdayWeight} />
        </div>
        <button
          onClick={() => setMode('form')}
          className="mt-4 text-base font-semibold text-gold hover:text-gold-light transition"
        >
          Edit
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="checkin_date" value={todayDate} />

      <div className={`${CARD_CLASS} p-6 text-center`}>
        <label className={`${UPPER_LABEL_CLASS} block mb-3`}>
          Morning weight (lbs)
        </label>
        <input
          name="morning_weight_lbs"
          type="number"
          step="0.1"
          min="0"
          required
          autoFocus
          inputMode="decimal"
          value={morningWeight}
          onChange={(e) => setMorningWeight(e.target.value)}
          placeholder={yesterdayWeight != null ? String(yesterdayWeight) : 'Weight'}
          className="w-full bg-card text-3xl font-bold text-center"
        />
        <WeightChange
          current={morningWeight === '' ? null : Number(morningWeight)}
          yesterday={yesterdayWeight}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={FIELD_LABEL_CLASS}>Water (oz)</label>
          <input
            name="water_intake_oz"
            type="number"
            step="1"
            min="0"
            defaultValue={nv(initial.water_intake_oz)}
            className="bg-card"
          />
        </div>
        <div>
          <label className={FIELD_LABEL_CLASS}>Sleep (hrs)</label>
          <input
            name="sleep_hours"
            type="number"
            step="0.5"
            min="0"
            defaultValue={nv(initial.sleep_hours)}
            className="bg-card"
          />
        </div>
        <div>
          <label className={FIELD_LABEL_CLASS}>Energy 1–10</label>
          <input
            name="energy_level"
            type="number"
            min="1"
            max="10"
            defaultValue={nv(initial.energy_level)}
            className="bg-card"
          />
        </div>
      </div>

      <div className="border-2 border-text-muted/40 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetails((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 text-base font-semibold text-text-secondary hover:text-text-primary transition"
        >
          <span>More details</span>
          <span className="text-text-secondary">{showDetails ? '−' : '+'}</span>
        </button>

        {showDetails && (
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Sleep quality 1–10
                </label>
                <input
                  name="sleep_quality"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue={nv(initial.sleep_quality)}
                  className="bg-card"
                />
              </div>
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Training 1–10
                </label>
                <input
                  name="training_intensity"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue={nv(initial.training_intensity)}
                  className="bg-card"
                />
              </div>
              <div>
                <label className={FIELD_LABEL_CLASS}>Calories</label>
                <input
                  name="calories_consumed"
                  type="number"
                  min="0"
                  defaultValue={nv(initial.calories_consumed)}
                  className="bg-card"
                />
              </div>
              <div>
                <label className={FIELD_LABEL_CLASS}>Sodium (mg)</label>
                <input
                  name="sodium_mg"
                  type="number"
                  min="0"
                  defaultValue={nv(initial.sodium_mg)}
                  className="bg-card"
                />
              </div>
              <div>
                <label className={FIELD_LABEL_CLASS}>Protein (g)</label>
                <input
                  name="protein_g"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={nv(initial.protein_g)}
                  className="bg-card"
                />
              </div>
              <div>
                <label className={FIELD_LABEL_CLASS}>Carbs (g)</label>
                <input
                  name="carbs_g"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={nv(initial.carbs_g)}
                  className="bg-card"
                />
              </div>
              <div>
                <label className={FIELD_LABEL_CLASS}>Fat (g)</label>
                <input
                  name="fat_g"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={nv(initial.fat_g)}
                  className="bg-card"
                />
              </div>
              <div>
                <label className={FIELD_LABEL_CLASS}>Fiber (g)</label>
                <input
                  name="fiber_g"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={nv(initial.fiber_g)}
                  className="bg-card"
                />
              </div>
              <div className="col-span-2">
                <label className={FIELD_LABEL_CLASS}>
                  Evening weight (lbs)
                </label>
                <input
                  name="evening_weight_lbs"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={nv(initial.evening_weight_lbs)}
                  className="bg-card"
                />
              </div>
            </div>
            <div>
              <label className={FIELD_LABEL_CLASS}>Notes</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={initial.notes ?? undefined}
                className="bg-card"
              />
            </div>
          </div>
        )}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className={PRIMARY_BUTTON_CLASS}
      >
        {pending ? 'Logging...' : 'Log check-in'}
      </button>
    </form>
  )
}
