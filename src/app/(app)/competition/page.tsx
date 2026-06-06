import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { analyzeCut, type CutSeverity } from '@/lib/safety/competition-checks'
import {
  disciplineLabel,
  organizationLabel,
  weighinLabel,
} from '@/lib/constants/competition-options'
import { deleteCompetition } from './actions'

interface CompetitionRow {
  id: string
  name: string
  discipline: string
  organization: string
  weighin_type: string
  competition_date: string
  weighin_date: string
  target_weight_lbs: number
  starting_weight_lbs: number
  weight_class_name: string | null
}

const SEVERITY_STYLES: Record<CutSeverity, string> = {
  ok: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  danger: 'bg-danger/15 text-danger border border-danger/30',
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function CompetitionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('competitions')
    .select(
      'id, name, discipline, organization, weighin_type, competition_date, weighin_date, target_weight_lbs, starting_weight_lbs, weight_class_name'
    )
    .eq('user_id', user?.id ?? '')
    .order('competition_date', { ascending: true })

  const competitions = (data ?? []) as CompetitionRow[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Competitions</h1>
          <p className="text-text-muted text-sm mt-1">
            Track your events and weight cuts
          </p>
        </div>
        <Link
          href="/competition/new"
          className="px-4 py-2 rounded-lg bg-gold text-void font-semibold text-sm hover:bg-gold-light transition"
        >
          New
        </Link>
      </div>

      {competitions.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-text-secondary mb-4">No competitions yet.</p>
          <Link
            href="/competition/new"
            className="text-gold hover:text-gold-light font-medium"
          >
            Add your first competition
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {competitions.map((c) => {
            const cut = analyzeCut({
              startingWeightLbs: c.starting_weight_lbs,
              targetWeightLbs: c.target_weight_lbs,
              weighinType: c.weighin_type,
              weighinDate: c.weighin_date,
            })
            return (
              <div
                key={c.id}
                className="bg-surface border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-text-primary truncate">
                      {c.name}
                    </h2>
                    <p className="text-text-muted text-sm mt-0.5">
                      {disciplineLabel(c.discipline)} ·{' '}
                      {organizationLabel(c.organization)}
                      {c.weight_class_name ? ` · ${c.weight_class_name}` : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${SEVERITY_STYLES[cut.severity]}`}
                  >
                    {cut.cutPercentage.toFixed(1)}% cut
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wide">
                      Competes
                    </p>
                    <p className="text-text-primary">
                      {formatDate(c.competition_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wide">
                      Weigh-in
                    </p>
                    <p className="text-text-primary">
                      {formatDate(c.weighin_date)}
                    </p>
                    <p className="text-text-muted text-xs">
                      {weighinLabel(c.weighin_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wide">
                      Target
                    </p>
                    <p className="text-text-primary">
                      {c.target_weight_lbs} lbs
                    </p>
                    <p className="text-text-muted text-xs">
                      from {c.starting_weight_lbs} lbs
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <form action={deleteCompetition}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="text-xs text-text-muted hover:text-danger transition"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
