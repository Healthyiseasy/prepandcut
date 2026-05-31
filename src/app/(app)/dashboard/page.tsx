import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="text-text-muted text-sm mb-8">Welcome back, {user?.user_metadata?.full_name ?? 'athlete'}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl p-4 border border-border">
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">Next competition</p>
          <p className="text-lg font-semibold text-text-primary">No competition set</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">Current weight</p>
          <p className="text-lg font-semibold text-text-primary">— lbs</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">Today's check-in</p>
          <p className="text-lg font-semibold text-danger">Not logged</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">Water intake</p>
          <p className="text-lg font-semibold text-text-primary">— oz</p>
        </div>
      </div>
    </div>
  )
}
