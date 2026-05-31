'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { window.location.href = '/dashboard' }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-void">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-text-primary mb-1">PrepAndCut</h1>
        <p className="text-text-muted text-sm mb-8">Sign in to your account</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full" placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full" placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-gold text-void font-semibold hover:bg-gold-light transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm text-text-muted mt-6 text-center">
          No account? <Link href="/signup" className="text-gold hover:text-gold-light">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
