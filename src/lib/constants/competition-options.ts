export const DISCIPLINES = [
  { value: 'mma', label: 'MMA' },
  { value: 'bjj', label: 'Brazilian Jiu-Jitsu' },
  { value: 'wrestling', label: 'Wrestling' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
] as const

export type Discipline = (typeof DISCIPLINES)[number]['value']

export const ORGANIZATIONS: Record<Discipline, { value: string; label: string }[]> = {
  mma: [
    { value: 'ufc', label: 'UFC' },
    { value: 'bellator', label: 'Bellator' },
    { value: 'pfl', label: 'PFL' },
    { value: 'one_fc', label: 'ONE Championship' },
    { value: 'other_mma', label: 'Other (MMA)' },
  ],
  bjj: [
    { value: 'ibjjf', label: 'IBJJF' },
    { value: 'adcc', label: 'ADCC' },
    { value: 'naga', label: 'NAGA' },
    { value: 'other_bjj', label: 'Other (BJJ)' },
  ],
  wrestling: [
    { value: 'ncaa', label: 'NCAA' },
    { value: 'nfhs', label: 'NFHS (High School)' },
    { value: 'usaw', label: 'USA Wrestling' },
    { value: 'uww', label: 'United World Wrestling' },
    { value: 'other_wrestling', label: 'Other (Wrestling)' },
  ],
  bodybuilding: [
    { value: 'npc', label: 'NPC' },
    { value: 'ifbb', label: 'IFBB' },
    { value: 'other_bodybuilding', label: 'Other (Bodybuilding)' },
  ],
}

export const WEIGHIN_TYPES = [
  { value: 'day_before', label: 'Day before' },
  { value: 'same_day', label: 'Same day' },
  { value: 'two_hour_window', label: '2-hour window' },
  { value: 'certified_minimum', label: 'Certified minimum' },
] as const

export type WeighinType = (typeof WEIGHIN_TYPES)[number]['value']

const DISCIPLINE_LABELS = Object.fromEntries(
  DISCIPLINES.map((d) => [d.value, d.label])
) as Record<string, string>

const ORG_LABELS = Object.fromEntries(
  Object.values(ORGANIZATIONS).flat().map((o) => [o.value, o.label])
) as Record<string, string>

const WEIGHIN_LABELS = Object.fromEntries(
  WEIGHIN_TYPES.map((w) => [w.value, w.label])
) as Record<string, string>

export function disciplineLabel(value: string): string {
  return DISCIPLINE_LABELS[value] ?? value
}

export function organizationLabel(value: string): string {
  return ORG_LABELS[value] ?? value
}

export function weighinLabel(value: string): string {
  return WEIGHIN_LABELS[value] ?? value
}
