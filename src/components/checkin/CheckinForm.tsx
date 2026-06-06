'use client'

import { useActionState } from 'react'
import { saveCheckin, type CheckinFormState } from '@/app/(app)/checkin/actions'

export interface CheckinValues {
  checkin_date: string
  morning_weight_lbs?: number | null
  evening_weight_lbs?: number | null
  calories_consumed?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  water_intake_oz?: number | null
  sodium_mg?: number | null
  energy_level?: number | null
  sleep_hours?: number | null
  sleep_quality?: number | null
  training_intensity?: number | null
  notes?: string | null
}

function val(v: number | string | null | undefined): string | number | undefined {
  if (v === null || v === undefined) return undefined
  return v
}

export default function CheckinForm({ initial }: { initial: CheckinValues }) {
  const [state, formAction, pending] = useActionState<CheckinFormState, FormData>(
    saveCheckin,
    {}
  )

  const fieldError = (name: string) => state.fieldErrors?.[name]

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="block text-sm text-text-secondary mb-1">Date</label>
        <input
          name="checkin_date"
          type="date"
          required
          defaultValue={initial.checkin_date}
        />
        {fieldError('checkin_date') && (
          <p className="text-xs text-danger mt-1">{fieldError('checkin_date')}</p>
        )}
      </div>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-text-muted mb-2">Weight</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Morning (lbs)</label>
            <input
              name="morning_weight_lbs"
              type="number"
              step="0.1"
              defaultValue={val(initial.morning_weight_lbs)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Evening (lbs)</label>
            <input
              name="evening_weight_lbs"
              type="number"
              step="0.1"
              defaultValue={val(initial.evening_weight_lbs)}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-text-muted mb-2">Nutrition</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Calories</label>
            <input
              name="calories_consumed"
              type="number"
              defaultValue={val(initial.calories_consumed)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Water (oz)</label>
            <input
              name="water_intake_oz"
              type="number"
              step="0.1"
              defaultValue={val(initial.water_intake_oz)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Protein (g)</label>
            <input name="protein_g" type="number" step="0.1" defaultValue={val(initial.protein_g)} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Carbs (g)</label>
            <input name="carbs_g" type="number" step="0.1" defaultValue={val(initial.carbs_g)} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Fat (g)</label>
            <input name="fat_g" type="number" step="0.1" defaultValue={val(initial.fat_g)} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Sodium (mg)</label>
            <input name="sodium_mg" type="number" defaultValue={val(initial.sodium_mg)} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-text-muted mb-2">Recovery</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Energy (1–10)</label>
            <input name="energy_level" type="number" min="1" max="10" defaultValue={val(initial.energy_level)} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Sleep (hours)</label>
            <input name="sleep_hours" type="number" step="0.1" defaultValue={val(initial.sleep_hours)} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Sleep quality (1–10)</label>
            <input name="sleep_quality" type="number" min="1" max="10" defaultValue={val(initial.sleep_quality)} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Training intensity (1–10)</label>
            <input name="training_intensity" type="number" min="1" max="10" defaultValue={val(initial.training_intensity)} />
          </div>
        </div>
      </section>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Notes</label>
        <textarea name="notes" rows={3} defaultValue={initial.notes ?? undefined} />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Check-in saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-lg bg-gold text-void font-semibold hover:bg-gold-light transition disabled:opacity-50"
      >
        {pending ? 'Saving...' : 'Save check-in'}
      </button>
    </form>
  )
}
