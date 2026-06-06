import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface NextCompetition {
  name: string
  competition_date: string
  weighin_date: string
  target_weight_lbs: number
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function daysUntil(value: string): number {
  const target = new Date(`${value}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]
  const { data: next } = await supabase
    .from('competitions')
    .select('name, competition_date, weighin_date, target_weight_lbs')
    .eq('user_id', user?.id ?? '')
    .gte('competition_date', today)
    .order('competition_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  const nextComp = next as NextCompetition | null

  const { data: checkin } = await supabase
    .from('daily_checkins')
    .select('morning_weight_lbs, evening_weight_lbs, water_intake_oz')
    .eq('user_id', user?.id ?? '')
    .eq('checkin_date', today)
    .maybeSingle()

  const todaysCheckin = checkin as {
    morning_weight_lbs: number | null
    evening_weight_lbs: number | null
    water_intake_oz: number | null
  } | null

  const currentWeight =
    todaysCheckin?.evening_weight_lbs ?? todaysCheckin?.morning_weight_lbs ?? null

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="text-text-muted text-sm mb-8">
        Welcome back, {user?.user_metadata?.full_name ?? 'athlete'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/competition"
          className="bg-surface rounded-xl p-4 border border-border hover:border-gold/50 transition"
        >
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">
            Next competition
          </p>
          {nextComp ? (
            <>
              <p className="text-lg font-semibold text-text-primary truncate">
                {nextComp.name}
              </p>
              <p className="text-text-muted text-xs mt-0.5">
                {formatDate(nextComp.competition_date)} · {daysUntil(nextComp.competition_date)} days
              </p>
            </>
          ) : (
            <p className="text-lg font-semibold text-text-primary">No competition set</p>
          )}
        </Link>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">
            Target weight
          </p>
          <p className="text-lg font-semibold text-text-primary">
            {nextComp ? `${nextComp.target_weight_lbs} lbs` : '— lbs'}
          </p>
          {nextComp && (
            <p className="text-text-muted text-xs mt-0.5">
              weigh-in {formatDate(nextComp.weighin_date)}
            </p>
          )}
        </div>
        <Link
          href="/checkin"
          className="bg-surface rounded-xl p-4 border border-border hover:border-gold/50 transition"
        >
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">
            Today&apos;s check-in
          </p>
          {todaysCheckin ? (
            <p className="text-lg font-semibold text-success">
              {currentWeight != null ? `${currentWeight} lbs` : 'Logged'}
            </p>
          ) : (
            <p className="text-lg font-semibold text-danger">Not logged</p>
          )}
        </Link>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">
            Water intake
          </p>
          <p className="text-lg font-semibold text-text-primary">
            {todaysCheckin?.water_intake_oz != null
              ? `${todaysCheckin.water_intake_oz} oz`
              : '— oz'}
          </p>
        </div>
      </div>
    </div>
  )
}
