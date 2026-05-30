export const AI_PRICING = {
  haiku: { input_per_mtok_cents: 25, output_per_mtok_cents: 125 },
  sonnet: { input_per_mtok_cents: 300, output_per_mtok_cents: 1500 },
} as const
export type AIPricing = typeof AI_PRICING
