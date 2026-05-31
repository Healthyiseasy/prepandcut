'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAccept() {
    if (!accepted) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      setError('Not authenticated. Please sign in again.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        has_accepted_disclaimer: true,
        disclaimer_accepted_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Failed to save: ' + updateError.message)
      setLoading(false)
      return
    }

    // Full page reload forces server layout to re-check profile
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-void">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Before you continue</h1>
        <p className="text-text-secondary text-sm mb-6">Please read and accept the following disclaimer to use PrepAndCut.</p>

        <div className="bg-surface border border-border rounded-xl p-5 mb-6 max-h-64 overflow-y-auto text-sm text-text-secondary leading-relaxed space-y-3">
          <p>PrepAndCut provides general information for competition preparation. It is <strong className="text-text-primary">not medical advice</strong>.</p>
          <p>Weight cutting carries inherent risks including dehydration, impaired performance, and in extreme cases, serious health consequences. By using this app, you acknowledge and accept these risks.</p>
          <p>You should consult a physician before starting any weight management program. If you experience dizziness, fainting, extreme fatigue, or other concerning symptoms, stop immediately and seek medical attention.</p>
          <p>PrepAndCut is a tool to assist your preparation. All final decisions regarding your health and competition readiness are your responsibility.</p>
          <p>You must be at least 16 years old to use this app. Users under 18 require parental or guardian consent.</p>
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-border accent-gold" />
          <span className="text-sm text-text-secondary">
            I have read and accept the disclaimer. I understand that PrepAndCut is not a substitute for professional medical advice and that I use this app at my own risk.
          </span>
        </label>

        {error && <p className="text-sm text-danger mb-4">{error}</p>}

        <button onClick={handleAccept} disabled={!accepted || loading}
          className="w-full py-2.5 rounded-lg bg-gold text-void font-semibold hover:bg-gold-light transition disabled:opacity-30 disabled:cursor-not-allowed">
          {loading ? 'Saving...' : 'Accept & continue'}
        </button>
      </div>
    </div>
  )
}
