'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkinSchema } from '@/lib/safety/validators'
import { logAudit } from '@/lib/utils/audit'

export interface CheckinFormState {
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

export async function saveCheckin(
  _prevState: CheckinFormState,
  formData: FormData
): Promise<CheckinFormState> {
  const raw = {
    checkin_date: optionalString(formData.get('checkin_date')) ?? '',
    morning_weight_lbs: optionalNumber(formData.get('morning_weight_lbs')),
    evening_weight_lbs: optionalNumber(formData.get('evening_weight_lbs')),
    calories_consumed: optionalNumber(formData.get('calories_consumed')),
    protein_g: optionalNumber(formData.get('protein_g')),
    carbs_g: optionalNumber(formData.get('carbs_g')),
    fat_g: optionalNumber(formData.get('fat_g')),
    water_intake_oz: optionalNumber(formData.get('water_intake_oz')),
    sodium_mg: optionalNumber(formData.get('sodium_mg')),
    energy_level: optionalNumber(formData.get('energy_level')),
    sleep_hours: optionalNumber(formData.get('sleep_hours')),
    sleep_quality: optionalNumber(formData.get('sleep_quality')),
    training_intensity: optionalNumber(formData.get('training_intensity')),
    notes: optionalString(formData.get('notes')),
  }

  const parsed = checkinSchema.safeParse(raw)
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

  const { error: upsertError } = await supabase
    .from('checkins')
    .upsert(
      { ...parsed.data, user_id: user.id },
      { onConflict: 'user_id,checkin_date' }
    )

  if (upsertError) {
    return { error: 'Failed to save check-in: ' + upsertError.message }
  }

  try {
    await logAudit({
      userId: user.id,
      action: 'save_checkin',
      entityType: 'checkin',
      details: { checkin_date: parsed.data.checkin_date },
    })
  } catch {
    // best-effort
  }

  revalidatePath('/checkin')
  revalidatePath('/dashboard')
  return { success: true }
}
