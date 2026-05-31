import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNav from '@/components/ui/AppNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('has_accepted_disclaimer, full_name')
    .eq('id', user.id)
    .single()

  // If no profile exists yet or disclaimer not accepted, send to onboarding
  // But don't redirect if already on onboarding page
  const isOnboarding = false // layout can't read pathname; we handle this via the onboarding page itself

  if (!profile?.has_accepted_disclaimer) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-dvh bg-void">
      <AppNav userEmail={user.email ?? ''} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
