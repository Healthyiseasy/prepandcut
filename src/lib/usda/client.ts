import { readFileSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1'

function getUsdaKey(): string {
  const envPath = join(process.cwd(), '.env.local')
  const content = readFileSync(envPath, 'utf8')
  const match = content.match(/^USDA_API_KEY=(.+)$/m)
  if (!match?.[1]) throw new Error('USDA_API_KEY not found in .env.local')
  return match[1].trim()
}

const NUTRIENT_IDS = {
  calories: 1008,
  protein_g: 1003,
  carbs_g: 1005,
  fat_g: 1004,
  fiber_g: 1079,
} as const

export interface FoodResult {
  fdcId: number
  description: string
  brandOwner: string | null
  servingSize: number | null
  servingSizeUnit: string | null
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
}

interface SearchFoodNutrient {
  nutrientId?: number
  nutrientNumber?: string
  value?: number
  amount?: number
}

interface SearchFood {
  fdcId: number
  description: string
  brandOwner?: string
  servingSize?: number
  servingSizeUnit?: string
  foodNutrients?: SearchFoodNutrient[]
}

function extractNutrient(nutrients: SearchFoodNutrient[], id: number): number {
  const match = nutrients.find(
    (n) => n.nutrientId === id || n.nutrientNumber === String(id)
  )
  if (!match) return 0
  return Math.round((match.value ?? match.amount ?? 0) * 10) / 10
}

export async function searchFoods(query: string, apiKeyOverride?: string): Promise<FoodResult[]> {
  const apiKey = apiKeyOverride ?? getUsdaKey()

  const url = `${BASE_URL}/foods/search?api_key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      pageSize: 8,
      dataType: ['Foundation', 'SR Legacy', 'Branded'],
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`USDA API error: ${res.status} ${body}`)
  }

  const data = (await res.json()) as { foods?: SearchFood[] }
  const foods = data.foods ?? []

  return foods.map((f) => {
    const nutrients = f.foodNutrients ?? []
    return {
      fdcId: f.fdcId,
      description: f.description,
      brandOwner: f.brandOwner ?? null,
      servingSize: f.servingSize ?? null,
      servingSizeUnit: f.servingSizeUnit ?? null,
      calories: extractNutrient(nutrients, NUTRIENT_IDS.calories),
      protein_g: extractNutrient(nutrients, NUTRIENT_IDS.protein_g),
      carbs_g: extractNutrient(nutrients, NUTRIENT_IDS.carbs_g),
      fat_g: extractNutrient(nutrients, NUTRIENT_IDS.fat_g),
      fiber_g: extractNutrient(nutrients, NUTRIENT_IDS.fiber_g),
    }
  })
}
