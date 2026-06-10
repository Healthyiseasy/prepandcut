'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  DISCIPLINES,
  ORGANIZATIONS,
  WEIGHIN_TYPES,
  type Discipline,
} from '@/lib/constants/competition-options'
import { analyzeCut, type CutSeverity } from '@/lib/safety/competition-checks'
import { createCompetition, type CompetitionFormState } from '../actions'
import {
  CARD_CLASS,
  FIELD_LABEL_CLASS,
  PAGE_TITLE_CLASS,
  PRIMARY_BUTTON_CLASS,
  UPPER_LABEL_CLASS,
} from '@/components/ui/classNames'

const SEVERITY_TEXT: Record<CutSeverity, string> = {
  ok: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}

export default function NewCompetitionPage() {
  const [state, formAction, pending] = useActionState<CompetitionFormState, FormData>(
    createCompetition,
    {}
  )

  const [discipline, setDiscipline] = useState<Discipline>('mma')
  const [weighinType, setWeighinType] = useState<string>('day_before')
  const [weighinDate, setWeighinDate] = useState('')
  const [startingWeight, setStartingWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')

  const orgs = ORGANIZATIONS[discipline]

  const preview = useMemo(() => {
    const start = Number(startingWeight)
    const target = Number(targetWeight)
    if (!Number.isFinite(start) || !Number.isFinite(target) || start <= 0 || target <= 0 || !weighinDate) {
      return null
    }
    return analyzeCut({
      startingWeightLbs: start,
      targetWeightLbs: target,
      weighinType,
      weighinDate,
    })
  }, [startingWeight, targetWeight, weighinType, weighinDate])

  const fieldError = (name: string) => state.fieldErrors?.[name]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/competition" className="text-text-secondary hover:text-text-primary text-base font-semibold">
          ← Back
        </Link>
        <h1 className={PAGE_TITLE_CLASS}>New competition</h1>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label className={FIELD_LABEL_CLASS}>Name</label>
          <input name="name" type="text" required placeholder="e.g. Regional Open" />
          {fieldError('name') && <p className="text-xs text-danger mt-1">{fieldError('name')}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={FIELD_LABEL_CLASS}>Discipline</label>
            <select
              name="discipline"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value as Discipline)}
            >
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={FIELD_LABEL_CLASS}>Organization</label>
            <select name="organization" defaultValue={orgs[0]?.value} key={discipline}>
              {orgs.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {fieldError('organization') && (
              <p className="text-xs text-danger mt-1">{fieldError('organization')}</p>
            )}
          </div>
        </div>

        <div>
          <label className={FIELD_LABEL_CLASS}>Weigh-in type</label>
          <select
            name="weighin_type"
            value={weighinType}
            onChange={(e) => setWeighinType(e.target.value)}
          >
            {WEIGHIN_TYPES.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={FIELD_LABEL_CLASS}>Competition date</label>
            <input name="competition_date" type="date" required />
            {fieldError('competition_date') && (
              <p className="text-xs text-danger mt-1">{fieldError('competition_date')}</p>
            )}
          </div>
          <div>
            <label className={FIELD_LABEL_CLASS}>Weigh-in date</label>
            <input
              name="weighin_date"
              type="date"
              required
              value={weighinDate}
              onChange={(e) => setWeighinDate(e.target.value)}
            />
            {fieldError('weighin_date') && (
              <p className="text-xs text-danger mt-1">{fieldError('weighin_date')}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={FIELD_LABEL_CLASS}>Starting weight (lbs)</label>
            <input
              name="starting_weight_lbs"
              type="number"
              step="0.1"
              required
              value={startingWeight}
              onChange={(e) => setStartingWeight(e.target.value)}
            />
            {fieldError('starting_weight_lbs') && (
              <p className="text-xs text-danger mt-1">{fieldError('starting_weight_lbs')}</p>
            )}
          </div>
          <div>
            <label className={FIELD_LABEL_CLASS}>Target weight (lbs)</label>
            <input
              name="target_weight_lbs"
              type="number"
              step="0.1"
              required
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
            {fieldError('target_weight_lbs') && (
              <p className="text-xs text-danger mt-1">{fieldError('target_weight_lbs')}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={FIELD_LABEL_CLASS}>
              Weight class <span className="text-text-disabled">(optional)</span>
            </label>
            <input name="weight_class_name" type="text" placeholder="e.g. Lightweight" />
          </div>
          <div>
            <label className={FIELD_LABEL_CLASS}>
              Division <span className="text-text-disabled">(optional)</span>
            </label>
            <input name="division" type="text" placeholder="e.g. Adult / Blue belt" />
          </div>
        </div>

        {preview && (
          <div className={`${CARD_CLASS} p-4`}>
            <p className={`${UPPER_LABEL_CLASS} mb-1`}>
              Cut preview
            </p>
            <p className={`text-base font-bold ${SEVERITY_TEXT[preview.severity]}`}>
              {preview.cutLbs.toFixed(1)} lbs ({preview.cutPercentage.toFixed(1)}%) over{' '}
              {preview.weeksUntilWeighin.toFixed(1)} weeks
            </p>
            <ul className="mt-2 space-y-1">
              {preview.messages.map((m, i) => (
                <li key={i} className="text-sm font-medium text-text-secondary">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.error && <p className="text-sm text-danger">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className={PRIMARY_BUTTON_CLASS}
        >
          {pending ? 'Saving...' : 'Save competition'}
        </button>
      </form>
    </div>
  )
}
