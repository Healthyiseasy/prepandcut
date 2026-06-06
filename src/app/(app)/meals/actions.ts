'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { mealSchema } from '@/lib/safety/validators'
import { logAudit } from '@/lib/utils/audit'

export interface MealFormState {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string>
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const s = typeof value === 'string' ? value.trim() : ''
  return s.length > 0 ? s : undefined
}

function optionalNumber(value: FormDataEntryValue | null): number | undefined {
  const s = typeof value === 'string' ? value.trim() : ''
  if (s.length === 0) return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

export async function addMeal(
  _prevState: MealFormState,
  formData: FormData
): Promise<MealFormState> {
  const raw = {
    meal_date: optionalString(formData.get('meal_date')) ?? '',
    name: optionalString(formData.get('name')) ?? '',
    meal_type: optionalString(formData.get('meal_type')),
    calories: optionalNumber(formData.get('calories')),
    protein_g: optionalNumber(formData.get('protein_g')),
    carbs_g: optionalNumber(formData.get('carbs_g')),
    fat_g: optionalNumber(formData.get('fat_g')),
    notes: optionalString(formData.get('notes')),
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated. Please sign in again.' }
  }

  // `source` distinguishes manual entries from future AI-generated meals.
  const { error: insertError } = await supabase
    .from('meals')
    .insert({ ...parsed.data, user_id: user.id, source: 'manual' })

  if (insertError) {
    return { error: 'Failed to save meal: ' + insertError.message }
  }

  try {
    await logAudit({
      userId: user.id,
      action: 'add_meal',
      entityType: 'meal',
      details: { meal_date: parsed.data.meal_date, meal_type: parsed.data.meal_type },
    })
  } catch {
    // best-effort
  }

  revalidatePath('/meals')
  return { success: true }
}

export async function deleteMeal(formData: FormData): Promise<void> {
  const id = optionalString(formData.get('id'))
  if (!id) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('meals').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/meals')
}
