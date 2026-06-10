import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { analyzeCut, type CutSeverity } from '@/lib/safety/competition-checks'
import {
  disciplineLabel,
  organizationLabel,
  weighinLabel,
} from '@/lib/constants/competition-options'
import { deleteCompetition } from './actions'
import {
  CARD_CLASS,
  PAGE_SUBTITLE_CLASS,
  PAGE_TITLE_CLASS,
  PRIMARY_BUTTON_CLASS,
  UPPER_LABEL_CLASS,
  VALUE_TEXT_CLASS,
} from '@/components/ui/classNames'

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
  ok: 'bg-success/15 text-success border-2 border-success/50',
  warning: 'bg-warning/15 text-warning border-2 border-warning/50',
  danger: 'bg-danger/15 text-danger border-2 border-danger/50',
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
          <h1 className={PAGE_TITLE_CLASS}>Competitions</h1>
          <p className={`${PAGE_SUBTITLE_CLASS} mt-1 mb-0`}>
            Track your events and weight cuts
          </p>
        </div>
        <Link
          href="/competition/new"
          className={`${PRIMARY_BUTTON_CLASS} w-auto px-4 py-2.5`}
        >
          New
        </Link>
      </div>

      {competitions.length === 0 ? (
        <div className={`${CARD_CLASS} p-8 text-center`}>
          <p className="text-text-secondary text-base font-medium mb-4">No competitions yet.</p>
          <Link
            href="/competition/new"
            className="text-gold hover:text-gold-light text-base font-semibold"
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
                className={`${CARD_CLASS} p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className={`${VALUE_TEXT_CLASS} truncate`}>
                      {c.name}
                    </h2>
                    <p className="text-text-secondary text-base font-medium mt-0.5">
                      {disciplineLabel(c.discipline)} ·{' '}
                      {organizationLabel(c.organization)}
                      {c.weight_class_name ? ` · ${c.weight_class_name}` : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-sm font-semibold ${SEVERITY_STYLES[cut.severity]}`}
                  >
                    {cut.cutPercentage.toFixed(1)}% cut
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                  <div>
                    <p className={UPPER_LABEL_CLASS}>
                      Competes
                    </p>
                    <p className="text-lg font-bold text-text-primary">
                      {formatDate(c.competition_date)}
                    </p>
                  </div>
                  <div>
                    <p className={UPPER_LABEL_CLASS}>
                      Weigh-in
                    </p>
                    <p className="text-lg font-bold text-text-primary">
                      {formatDate(c.weighin_date)}
                    </p>
                    <p className="text-sm font-medium text-text-secondary">
                      {weighinLabel(c.weighin_type)}
                    </p>
                  </div>
                  <div>
                    <p className={UPPER_LABEL_CLASS}>
                      Target
                    </p>
                    <p className="text-lg font-bold text-text-primary">
                      {c.target_weight_lbs} lbs
                    </p>
                    <p className="text-sm font-medium text-text-secondary">
                      from {c.starting_weight_lbs} lbs
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <form action={deleteCompetition}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="text-sm font-semibold text-text-secondary hover:text-danger transition"
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
