'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FIELD_LABEL_CLASS } from '@/components/ui/classNames'

interface FoodResult {
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

interface Props {
  onSelect: (food: {
    name: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }) => void
}

export default function FoodSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.foods ?? [])
      setOpen(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(food: FoodResult) {
    onSelect({
      name: food.description,
      calories: Math.round(food.calories),
      protein_g: Math.round(food.protein_g),
      carbs_g: Math.round(food.carbs_g),
      fat_g: Math.round(food.fat_g),
    })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <label className={FIELD_LABEL_CLASS}>
        Search food <span className="text-text-disabled">(USDA database)</span>
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Type a food... e.g. chicken breast"
        className="bg-card"
      />

      {loading && (
        <p className="text-sm font-medium text-text-secondary mt-1">Searching...</p>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-surface border-2 border-text-muted/40 rounded-lg max-h-64 overflow-y-auto shadow-lg">
          {results.map((food) => (
            <button
              key={food.fdcId}
              type="button"
              onClick={() => handleSelect(food)}
              className="w-full text-left px-3 py-2.5 hover:bg-card transition border-b-2 border-text-muted/40 last:border-0"
            >
              <p className="text-base font-bold text-text-primary truncate">
                {food.description}
              </p>
              <p className="text-sm font-semibold text-text-secondary mt-0.5">
                {food.calories} cal · {food.protein_g}P · {food.carbs_g}C · {food.fat_g}F
                {food.brandOwner ? ` · ${food.brandOwner}` : ''}
              </p>
            </button>
          ))}
        </div>
      )}

      {open && !loading && query.length >= 2 && results.length === 0 && (
        <p className="text-sm font-medium text-text-secondary mt-1">No results found</p>
      )}
    </div>
  )
}
