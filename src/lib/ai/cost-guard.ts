import { supabaseAdmin } from '@/lib/supabase/admin'
import { AI_PRICING } from '@/lib/constants/ai-pricing'

interface BudgetTotals {
  daily_total: number
  monthly_total: number
}

export class CostGuard {
  static async logUsage(record: {
    service: string; endpoint?: string;
    input_tokens?: number; output_tokens?: number;
    estimated_cost_cents: number; user_id?: string;
  }) {
    await supabaseAdmin.from('api_usage').insert(record)
  }

  static async checkBudget(service: string): Promise<{
    allowed: boolean; usage_pct: number; message?: string;
  }> {
    const { data: budget } = await supabaseAdmin
      .from('cost_budgets').select('*')
      .eq('service', service).eq('is_active', true).single()
    if (!budget) return { allowed: true, usage_pct: 0 }
    const { data } = await supabaseAdmin
      .rpc('check_budget_totals', { p_service: service }).single()
    if (!data) return { allowed: true, usage_pct: 0 }
    const { daily_total, monthly_total } = data as BudgetTotals
    const pct = Math.max(
      Math.round((daily_total / budget.daily_limit_cents) * 100),
      Math.round((monthly_total / budget.monthly_limit_cents) * 100)
    )
    if (daily_total >= budget.daily_limit_cents ||
        monthly_total >= budget.monthly_limit_cents) {
      return { allowed: false, usage_pct: pct, message: 'Budget exceeded' }
    }
    return { allowed: true, usage_pct: pct }
  }

  static estimateCost(model: 'haiku' | 'sonnet', inputTokens: number, outputTokens: number): number {
    const p = AI_PRICING[model]
    return Math.ceil(
      (inputTokens * p.input_per_mtok_cents + outputTokens * p.output_per_mtok_cents) / 1_000_000
    )
  }
}
