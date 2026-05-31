'use client'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/competition', label: 'Competitions' },
  { href: '/checkin', label: 'Check-in' },
  { href: '/meals', label: 'Meals' },
]

export default function AppNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-gold font-bold text-lg">P&C</Link>
          <div className="flex gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition ${
                  pathname.startsWith(item.href)
                    ? 'bg-card text-gold'
                    : 'text-text-muted hover:text-text-primary'
                }`}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleSignOut} className="text-sm text-text-muted hover:text-text-primary transition">
          Sign out
        </button>
      </div>
    </nav>
  )
}
