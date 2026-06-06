export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
] as const

export type MealType = (typeof MEAL_TYPES)[number]['value']

export interface MealEntry {
  id: string
  name: string
  meal_type: MealType
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  source: string
}

export const DEFAULT_PLAN_TARGETS = {
  target_calories: 2000,
  target_protein_g: 150,
  target_carbs_g: 200,
  target_fat_g: 65,
} as const

const MEAL_TYPE_LABELS = Object.fromEntries(
  MEAL_TYPES.map((m) => [m.value, m.label])
) as Record<string, string>

export const MEAL_TYPE_ORDER: Record<string, number> = Object.fromEntries(
  MEAL_TYPES.map((m, i) => [m.value, i])
)

export function mealTypeLabel(value: string | null | undefined): string {
  if (!value) return 'Meal'
  return MEAL_TYPE_LABELS[value] ?? value
}
