import { createClient } from '@/lib/supabase/server'
import MealForm from '@/components/meals/MealForm'
import { mealTypeLabel, MEAL_TYPE_ORDER } from '@/lib/constants/meal-options'
import { deleteMeal } from './actions'

interface MealRow {
  id: string
  meal_date: string
  name: string
  meal_type: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  notes: string | null
}

interface DayTotals {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function emptyTotals(): DayTotals {
  return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
}

export default async function MealsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('meals')
    .select(
      'id, meal_date, name, meal_type, calories, protein_g, carbs_g, fat_g, notes'
    )
    .eq('user_id', user?.id ?? '')
    .order('meal_date', { ascending: false })

  const meals = (data ?? []) as MealRow[]

  const byDate = new Map<string, MealRow[]>()
  for (const meal of meals) {
    const list = byDate.get(meal.meal_date) ?? []
    list.push(meal)
    byDate.set(meal.meal_date, list)
  }

  const days = Array.from(byDate.entries()).map(([date, dayMeals]) => {
    const sorted = [...dayMeals].sort((a, b) => {
      const oa = a.meal_type ? MEAL_TYPE_ORDER[a.meal_type] ?? 99 : 99
      const ob = b.meal_type ? MEAL_TYPE_ORDER[b.meal_type] ?? 99 : 99
      return oa - ob
    })
    const totals = sorted.reduce<DayTotals>((acc, m) => {
      acc.calories += m.calories ?? 0
      acc.protein_g += m.protein_g ?? 0
      acc.carbs_g += m.carbs_g ?? 0
      acc.fat_g += m.fat_g ?? 0
      return acc
    }, emptyTotals())
    return { date, meals: sorted, totals }
  })

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Meals</h1>
      <p className="text-text-muted text-sm mb-6">Log meals and track daily macros</p>

      <MealForm defaultDate={today} />

      {days.length > 0 && (
        <div className="mt-8 space-y-6">
          {days.map((day) => (
            <div key={day.date}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-text-primary">
                  {formatDate(day.date)}
                </h2>
                <p className="text-xs text-text-muted">
                  {Math.round(day.totals.calories)} cal · {Math.round(day.totals.protein_g)}P ·{' '}
                  {Math.round(day.totals.carbs_g)}C · {Math.round(day.totals.fat_g)}F
                </p>
              </div>
              <div className="space-y-2">
                {day.meals.map((m) => (
                  <div
                    key={m.id}
                    className="bg-surface border border-border rounded-lg px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary">
                        <span className="text-gold">{mealTypeLabel(m.meal_type)}</span>
                        {' · '}
                        {m.name}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {m.calories != null ? `${m.calories} cal` : '—'}
                        {m.protein_g != null ? ` · ${m.protein_g}P` : ''}
                        {m.carbs_g != null ? ` · ${m.carbs_g}C` : ''}
                        {m.fat_g != null ? ` · ${m.fat_g}F` : ''}
                      </p>
                      {m.notes && (
                        <p className="text-xs text-text-disabled mt-0.5">{m.notes}</p>
                      )}
                    </div>
                    <form action={deleteMeal}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="text-xs text-text-muted hover:text-danger transition"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
