function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}
export const env = {
  supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),
  anthropicApiKey: requireEnv('ANTHROPIC_API_KEY'),
  upstashRedisUrl: requireEnv('UPSTASH_REDIS_REST_URL'),
  upstashRedisToken: requireEnv('UPSTASH_REDIS_REST_TOKEN'),
  appUrl: requireEnv('NEXT_PUBLIC_APP_URL'),
} as const
