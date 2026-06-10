import { NextResponse } from 'next/server'
import { searchFoods } from '@/lib/usda/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ foods: [] })
  }

  try {
    const foods = await searchFoods(query)
    return NextResponse.json({ foods })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ foods: [], error: message }, { status: 500 })
  }
}
