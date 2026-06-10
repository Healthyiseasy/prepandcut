import { createClient } from '@/lib/supabase/server'
import MealForm from '@/components/meals/MealForm'
import {
  mealTypeLabel,
  MEAL_TYPE_ORDER,
  type MealEntry,
} from '@/lib/constants/meal-options'
import { deleteMeal } from './actions'
import {
  CARD_CLASS,
  PAGE_SUBTITLE_CLASS,
  PAGE_TITLE_CLASS,
  UPPER_LABEL_CLASS,
  VALUE_TEXT_CLASS,
} from '@/components/ui/classNames'

interface PlanRow {
  id: string
  plan_date: string
  meals: MealEntry[] | null
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fat_g: number
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export default async function MealsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('meal_plans')
    .select(
      'id, plan_date, meals, target_calories, target_protein_g, target_carbs_g, target_fat_g'
    )
    .eq('user_id', user?.id ?? '')
    .eq('plan_date', today)
    .maybeSingle()

  const plan = data as PlanRow | null

  const meals = [...(plan?.meals ?? [])].sort((a, b) => {
    const oa = MEAL_TYPE_ORDER[a.meal_type] ?? 99
    const ob = MEAL_TYPE_ORDER[b.meal_type] ?? 99
    return oa - ob
  })

  const totals = meals.reduce(
    (acc, m) => {
      acc.calories += m.calories ?? 0
      acc.protein_g += m.protein_g ?? 0
      acc.carbs_g += m.carbs_g ?? 0
      acc.fat_g += m.fat_g ?? 0
      return acc
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  const targets = {
    calories: plan?.target_calories ?? null,
    protein_g: plan?.target_protein_g ?? null,
    carbs_g: plan?.target_carbs_g ?? null,
    fat_g: plan?.target_fat_g ?? null,
  }

  const macroRows: { label: string; total: number; target: number | null }[] = [
    { label: 'Calories', total: totals.calories, target: targets.calories },
    { label: 'Protein (g)', total: totals.protein_g, target: targets.protein_g },
    { label: 'Carbs (g)', total: totals.carbs_g, target: targets.carbs_g },
    { label: 'Fat (g)', total: totals.fat_g, target: targets.fat_g },
  ]

  return (
    <div>
      <h1 className={PAGE_TITLE_CLASS}>Meals</h1>
      <p className={`${PAGE_SUBTITLE_CLASS} mb-6`}>{formatDate(today)}</p>

      <MealForm defaultDate={today} />

      {meals.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-4 gap-3">
            {macroRows.map((row) => (
              <div
                key={row.label}
                className={`${CARD_CLASS} p-3 text-center`}
              >
                <p className={`${UPPER_LABEL_CLASS} mb-1`}>
                  {row.label}
                </p>
                <p className={VALUE_TEXT_CLASS}>
                  {Math.round(row.total)}
                </p>
                <p className="text-sm font-semibold text-text-secondary">
                  {row.target != null ? `/ ${Math.round(row.target)}` : '—'}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            {meals.map((m) => (
              <div
                key={m.id}
                className={`${CARD_CLASS} rounded-lg px-4 py-3 flex items-start justify-between gap-3`}
              >
                <div className="min-w-0">
                  <p className="text-base font-bold text-text-primary">
                    <span className="text-gold">{mealTypeLabel(m.meal_type)}</span>
                    {' · '}
                    {m.name}
                  </p>
                  <p className="text-sm font-semibold text-text-secondary mt-0.5">
                    {m.calories} cal · {m.protein_g}P · {m.carbs_g}C · {m.fat_g}F
                  </p>
                </div>
                <form action={deleteMeal}>
                  <input type="hidden" name="plan_date" value={today} />
                  <input type="hidden" name="meal_id" value={m.id} />
                  <button
                    type="submit"
                    className="text-sm font-semibold text-text-secondary hover:text-danger transition"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
