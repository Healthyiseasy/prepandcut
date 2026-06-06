export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'pre_workout', label: 'Pre-workout' },
  { value: 'post_workout', label: 'Post-workout' },
] as const

export type MealType = (typeof MEAL_TYPES)[number]['value']

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
