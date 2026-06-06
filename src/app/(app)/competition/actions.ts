'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { competitionSchema } from '@/lib/safety/validators'
import { analyzeCut } from '@/lib/safety/competition-checks'
import { logAudit } from '@/lib/utils/audit'

export interface CompetitionFormState {
  error?: string
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

export async function createCompetition(
  _prevState: CompetitionFormState,
  formData: FormData
): Promise<CompetitionFormState> {
  const raw = {
    name: optionalString(formData.get('name')) ?? '',
    discipline: formData.get('discipline'),
    organization: optionalString(formData.get('organization')) ?? '',
    weighin_type: formData.get('weighin_type'),
    competition_date: optionalString(formData.get('competition_date')) ?? '',
    weighin_date: optionalString(formData.get('weighin_date')) ?? '',
    target_weight_lbs: optionalNumber(formData.get('target_weight_lbs')),
    starting_weight_lbs: optionalNumber(formData.get('starting_weight_lbs')),
    weight_class_name: optionalString(formData.get('weight_class_name')),
    gi_weight_lbs: optionalNumber(formData.get('gi_weight_lbs')),
    jurisdiction: optionalString(formData.get('jurisdiction')),
    ncaa_certified_minimum: optionalNumber(formData.get('ncaa_certified_minimum')),
    division: optionalString(formData.get('division')),
  }

  const parsed = competitionSchema.safeParse(raw)
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

  if (new Date(data.weighin_date) > new Date(data.competition_date)) {
    return {
      error: 'Weigh-in date must be on or before the competition date.',
      fieldErrors: { weighin_date: 'Must be on or before competition date.' },
    }
  }

  const cut = analyzeCut({
    startingWeightLbs: data.starting_weight_lbs,
    targetWeightLbs: data.target_weight_lbs,
    weighinType: data.weighin_type,
    weighinDate: data.weighin_date,
  })

  if (cut.severity === 'danger') {
    return { error: cut.messages.join(' ') }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated. Please sign in again.' }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('competitions')
    .insert({ ...data, user_id: user.id })
    .select('id')
    .single()

  if (insertError) {
    return { error: 'Failed to save competition: ' + insertError.message }
  }

  try {
    await logAudit({
      userId: user.id,
      action: 'create_competition',
      entityType: 'competition',
      entityId: inserted?.id,
      details: {
        discipline: data.discipline,
        organization: data.organization,
        cut_percentage: Number(cut.cutPercentage.toFixed(2)),
        cut_severity: cut.severity,
      },
    })
  } catch {
    // Audit logging is best-effort; don't block the user on failure.
  }

  revalidatePath('/competition')
  revalidatePath('/dashboard')
  redirect('/competition')
}

export async function deleteCompetition(formData: FormData): Promise<void> {
  const id = optionalString(formData.get('id'))
  if (!id) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('competitions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (!error) {
    try {
      await logAudit({
        userId: user.id,
        action: 'delete_competition',
        entityType: 'competition',
        entityId: id,
      })
    } catch {
      // best-effort
    }
  }

  revalidatePath('/competition')
  revalidatePath('/dashboard')
}
