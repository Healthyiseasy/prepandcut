'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return }
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setSuccess(true) }
  }

  if (success) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 bg-void">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Check your email</h1>
          <p className="text-text-secondary">We sent a confirmation link to <span className="text-gold">{email}</span></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-void">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-text-primary mb-1">PrepAndCut</h1>
        <p className="text-text-muted text-sm mb-8">Create your account</p>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full" placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full" placeholder="Min 8 characters" />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-gold text-void font-semibold hover:bg-gold-light transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-text-muted mt-6 text-center">
          Already have an account? <Link href="/login" className="text-gold hover:text-gold-light">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
