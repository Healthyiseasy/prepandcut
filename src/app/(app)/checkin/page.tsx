import { createClient } from '@/lib/supabase/server'
import CheckinForm, { type CheckinValues } from '@/components/checkin/CheckinForm'

interface CheckinRow {
  checkin_date: string
  morning_weight_lbs: number | null
  evening_weight_lbs: number | null
  calories_consumed: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  water_intake_oz: number | null
  sodium_mg: number | null
  energy_level: number | null
  sleep_hours: number | null
  sleep_quality: number | null
  training_intensity: number | null
  notes: string | null
}

const FALLBACK = {
  water_intake_oz: 64,
  energy_level: 5,
  sleep_hours: 7,
  sleep_quality: 5,
  training_intensity: 5,
}

function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default async function CheckinPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = dateOffset(0)
  const yesterday = dateOffset(-1)

  const { data: rowsData } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .in('checkin_date', [today, yesterday])

  const rows = (rowsData ?? []) as CheckinRow[]
  const todayRow = rows.find((r) => r.checkin_date === today) ?? null
  const yesterdayRow = rows.find((r) => r.checkin_date === yesterday) ?? null

  // Prefill from today's row if it exists (editing), otherwise yesterday's values.
  const base = todayRow ?? yesterdayRow

  const initial: CheckinValues = {
    morning_weight_lbs: todayRow?.morning_weight_lbs ?? null,
    evening_weight_lbs: base?.evening_weight_lbs ?? null,
    calories_consumed: base?.calories_consumed ?? null,
    protein_g: base?.protein_g ?? null,
    carbs_g: base?.carbs_g ?? null,
    fat_g: base?.fat_g ?? null,
    fiber_g: base?.fiber_g ?? null,
    water_intake_oz: base?.water_intake_oz ?? FALLBACK.water_intake_oz,
    sodium_mg: base?.sodium_mg ?? null,
    energy_level: base?.energy_level ?? FALLBACK.energy_level,
    sleep_hours: base?.sleep_hours ?? FALLBACK.sleep_hours,
    sleep_quality: base?.sleep_quality ?? FALLBACK.sleep_quality,
    training_intensity: base?.training_intensity ?? FALLBACK.training_intensity,
    notes: todayRow?.notes ?? null,
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Daily check-in</h1>
      <p className="text-text-muted text-sm mb-6">
        {new Date(`${today}T00:00:00`).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })}
      </p>

      <CheckinForm
        todayDate={today}
        initial={initial}
        hasToday={!!todayRow}
        yesterdayWeight={yesterdayRow?.morning_weight_lbs ?? null}
      />
    </div>
  )
}
