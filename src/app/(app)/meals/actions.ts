'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { mealSchema } from '@/lib/safety/validators'
import { DEFAULT_PLAN_TARGETS, type MealEntry } from '@/lib/constants/meal-options'
import { logAudit } from '@/lib/utils/audit'

export interface MealFormState {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string>
}

interface PlanRow {
  id: string
  meals: MealEntry[] | null
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fat_g: number
  generated_by: string
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const s = typeof value === 'string' ? value.trim() : ''
  return s.length > 0 ? s : undefined
}

function numberOrZero(value: FormDataEntryValue | null): number {
  const s = typeof value === 'string' ? value.trim() : ''
  if (s.length === 0) return 0
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

export async function addMeal(
  _prevState: MealFormState,
  formData: FormData
): Promise<MealFormState> {
  const raw = {
    plan_date: optionalString(formData.get('plan_date')) ?? '',
    name: optionalString(formData.get('name')) ?? '',
    meal_type: optionalString(formData.get('meal_type')),
    calories: numberOrZero(formData.get('calories')),
    protein_g: numberOrZero(formData.get('protein_g')),
    carbs_g: numberOrZero(formData.get('carbs_g')),
    fat_g: numberOrZero(formData.get('fat_g')),
  }

  const parsed = mealSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) {
        fieldErrors[key] = issue.message
      }
    }
    return { error: 'Please fix the highlighted fields.', fieldErrors }
  }

  const data = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated. Please sign in again.' }
  }

  const { data: existing } = await supabase
    .from('meal_plans')
    .select(
      'id, meals, target_calories, target_protein_g, target_carbs_g, target_fat_g, generated_by'
    )
    .eq('user_id', user.id)
    .eq('plan_date', data.plan_date)
    .maybeSingle()

  const plan = existing as PlanRow | null

  const newMeal: MealEntry = {
    id: crypto.randomUUID(),
    name: data.name,
    meal_type: data.meal_type,
    calories: data.calories,
    protein_g: data.protein_g,
    carbs_g: data.carbs_g,
    fat_g: data.fat_g,
    source: 'manual',
  }

  const meals = [...(plan?.meals ?? []), newMeal]

  const row = {
    user_id: user.id,
    plan_date: data.plan_date,
    meals,
    // Preserve existing targets/generator on update; default for a new plan.
    target_calories: plan?.target_calories ?? DEFAULT_PLAN_TARGETS.target_calories,
    target_protein_g: plan?.target_protein_g ?? DEFAULT_PLAN_TARGETS.target_protein_g,
    target_carbs_g: plan?.target_carbs_g ?? DEFAULT_PLAN_TARGETS.target_carbs_g,
    target_fat_g: plan?.target_fat_g ?? DEFAULT_PLAN_TARGETS.target_fat_g,
    generated_by: plan?.generated_by ?? 'manual',
  }

  const { error: upsertError } = await supabase
    .from('meal_plans')
    .upsert(row, { onConflict: 'user_id,plan_date' })

  if (upsertError) {
    return { error: 'Failed to save meal: ' + upsertError.message }
  }

  try {
    await logAudit({
      userId: user.id,
      action: 'add_meal',
      entityType: 'meal_plan',
      details: { plan_date: data.plan_date, meal_type: data.meal_type },
    })
  } catch {
    // best-effort
  }

  revalidatePath('/meals')
  return { success: true }
}

export async function deleteMeal(formData: FormData): Promise<void> {
  const planDate = optionalString(formData.get('plan_date'))
  const mealId = optionalString(formData.get('meal_id'))
  if (!planDate || !mealId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('meal_plans')
    .select('id, meals')
    .eq('user_id', user.id)
    .eq('plan_date', planDate)
    .maybeSingle()

  const plan = existing as Pick<PlanRow, 'id' | 'meals'> | null
  if (!plan) return

  const meals = (plan.meals ?? []).filter((m) => m.id !== mealId)

  await supabase
    .from('meal_plans')
    .update({ meals })
    .eq('id', plan.id)
    .eq('user_id', user.id)

  revalidatePath('/meals')
}
