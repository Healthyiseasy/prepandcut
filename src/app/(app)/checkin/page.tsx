import { createClient } from '@/lib/supabase/server'
import CheckinForm, { type CheckinValues } from '@/components/checkin/CheckinForm'

interface RecentCheckin {
  checkin_date: string
  morning_weight_lbs: number | null
  evening_weight_lbs: number | null
  water_intake_oz: number | null
  calories_consumed: number | null
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default async function CheckinPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  const { data: todays } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .eq('checkin_date', today)
    .maybeSingle()

  const { data: recentData } = await supabase
    .from('checkins')
    .select(
      'checkin_date, morning_weight_lbs, evening_weight_lbs, water_intake_oz, calories_consumed'
    )
    .eq('user_id', user?.id ?? '')
    .order('checkin_date', { ascending: false })
    .limit(7)

  const recent = (recentData ?? []) as RecentCheckin[]

  const initial: CheckinValues = {
    checkin_date: today,
    ...(todays ?? {}),
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Daily check-in</h1>
      <p className="text-text-muted text-sm mb-6">
        {todays ? "Editing today's entry" : 'Log how today went'}
      </p>

      <CheckinForm initial={initial} />

      {recent.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xs uppercase tracking-wide text-text-muted mb-3">
            Recent
          </h2>
          <div className="space-y-2">
            {recent.map((c) => (
              <div
                key={c.checkin_date}
                className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center justify-between text-sm"
              >
                <span className="text-text-primary">{formatDate(c.checkin_date)}</span>
                <span className="text-text-muted">
                  {c.morning_weight_lbs != null ? `${c.morning_weight_lbs} lbs` : '—'}
                  {c.water_intake_oz != null ? ` · ${c.water_intake_oz} oz` : ''}
                  {c.calories_consumed != null ? ` · ${c.calories_consumed} cal` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
