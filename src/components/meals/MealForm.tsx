'use client'

import { useActionState, useEffect, useRef } from 'react'
import { MEAL_TYPES } from '@/lib/constants/meal-options'
import { addMeal, type MealFormState } from '@/app/(app)/meals/actions'

export default function MealForm({ defaultDate }: { defaultDate: string }) {
  const [state, formAction, pending] = useActionState<MealFormState, FormData>(
    addMeal,
    {}
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  const fieldError = (name: string) => state.fieldErrors?.[name]

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-surface border border-border rounded-xl p-4 space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Date</label>
          <input name="meal_date" type="date" required defaultValue={defaultDate} />
          {fieldError('meal_date') && (
            <p className="text-xs text-danger mt-1">{fieldError('meal_date')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Type</label>
          <select name="meal_type" defaultValue="breakfast">
            {MEAL_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Meal</label>
        <input name="name" type="text" required placeholder="e.g. Chicken & rice" />
        {fieldError('name') && (
          <p className="text-xs text-danger mt-1">{fieldError('name')}</p>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Cal</label>
          <input name="calories" type="number" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">P (g)</label>
          <input name="protein_g" type="number" step="0.1" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">C (g)</label>
          <input name="carbs_g" type="number" step="0.1" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">F (g)</label>
          <input name="fat_g" type="number" step="0.1" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">
          Notes <span className="text-text-disabled">(optional)</span>
        </label>
        <input name="notes" type="text" placeholder="prep, timing, etc." />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Meal added.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-lg bg-gold text-void font-semibold hover:bg-gold-light transition disabled:opacity-50"
      >
        {pending ? 'Adding...' : 'Add meal'}
      </button>
    </form>
  )
}
