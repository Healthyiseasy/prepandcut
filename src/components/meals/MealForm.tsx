'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { MEAL_TYPES } from '@/lib/constants/meal-options'
import { addMeal, type MealFormState } from '@/app/(app)/meals/actions'
import FoodSearch from './FoodSearch'
import { CARD_CLASS, FIELD_LABEL_CLASS, PRIMARY_BUTTON_CLASS } from '@/components/ui/classNames'

export default function MealForm({ defaultDate }: { defaultDate: string }) {
  const [state, formAction, pending] = useActionState<MealFormState, FormData>(
    addMeal,
    {}
  )
  const formRef = useRef<HTMLFormElement>(null)
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [proteinG, setProteinG] = useState('')
  const [carbsG, setCarbsG] = useState('')
  const [fatG, setFatG] = useState('')

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      setName('')
      setCalories('')
      setProteinG('')
      setCarbsG('')
      setFatG('')
    }
  }, [state.success])

  function handleFoodSelect(food: {
    name: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }) {
    setName(food.name)
    setCalories(String(food.calories))
    setProteinG(String(food.protein_g))
    setCarbsG(String(food.carbs_g))
    setFatG(String(food.fat_g))
  }

  const fieldError = (field: string) => state.fieldErrors?.[field]

  return (
    <form
      ref={formRef}
      action={formAction}
      className={`${CARD_CLASS} p-4 space-y-4`}
    >
      <FoodSearch onSelect={handleFoodSelect} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={FIELD_LABEL_CLASS}>Date</label>
          <input name="plan_date" type="date" required defaultValue={defaultDate} />
          {fieldError('plan_date') && (
            <p className="text-xs text-danger mt-1">{fieldError('plan_date')}</p>
          )}
        </div>
        <div>
          <label className={FIELD_LABEL_CLASS}>Type</label>
          <select name="meal_type" defaultValue="breakfast">
            {MEAL_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {fieldError('meal_type') && (
            <p className="text-xs text-danger mt-1">{fieldError('meal_type')}</p>
          )}
        </div>
      </div>

      <div>
        <label className={FIELD_LABEL_CLASS}>Meal name</label>
        <input
          name="name"
          type="text"
          required
          placeholder="e.g. Chicken & rice"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {fieldError('name') && (
          <p className="text-xs text-danger mt-1">{fieldError('name')}</p>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className={FIELD_LABEL_CLASS}>Cal</label>
          <input
            name="calories"
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
        <div>
          <label className={FIELD_LABEL_CLASS}>P (g)</label>
          <input
            name="protein_g"
            type="number"
            step="0.1"
            min="0"
            value={proteinG}
            onChange={(e) => setProteinG(e.target.value)}
          />
        </div>
        <div>
          <label className={FIELD_LABEL_CLASS}>C (g)</label>
          <input
            name="carbs_g"
            type="number"
            step="0.1"
            min="0"
            value={carbsG}
            onChange={(e) => setCarbsG(e.target.value)}
          />
        </div>
        <div>
          <label className={FIELD_LABEL_CLASS}>F (g)</label>
          <input
            name="fat_g"
            type="number"
            step="0.1"
            min="0"
            value={fatG}
            onChange={(e) => setFatG(e.target.value)}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Meal added.</p>}

      <button
        type="submit"
        disabled={pending}
        className={PRIMARY_BUTTON_CLASS}
      >
        {pending ? 'Adding...' : 'Add meal'}
      </button>
    </form>
  )
}
