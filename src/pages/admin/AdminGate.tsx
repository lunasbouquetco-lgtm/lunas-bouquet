import { useState, type FormEvent } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { login } from '@/lib/adminApi'
import markGold from '@/assets/mark-gold.png'

// The password screen. Note it proves nothing on its own — the server re-checks the
// password on every single request, so getting past this box without the real password
// would still show an empty admin.
export default function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(pw)
      onUnlock()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That password is not right.')
      setPw('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-plum px-6">
      <div className="w-full max-w-sm text-center">
        <img src={markGold} alt="Luna's Bouquet" className="mx-auto h-16 w-auto opacity-90" />
        <p className="label mt-8 flex items-center justify-center gap-2 text-gold-light">
          <Lock size={13} /> Private
        </p>
        <h1 className="mt-4 font-display text-3xl text-ivory">Order book</h1>

        <form onSubmit={submit} className="mt-8">
          <label htmlFor="pw" className="sr-only">
            Password
          </label>
          <input
            id="pw"
            type="password"
            value={pw}
            autoFocus
            autoComplete="current-password"
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="w-full rounded-sm border border-gold/30 bg-plum-light px-4 py-3 text-center font-ui text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          {error && <p className="mt-3 font-ui text-sm text-rosewood">{error}</p>}
          <button
            type="submit"
            disabled={busy || pw.length === 0}
            className="label mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rosewood px-8 py-3.5 text-white transition-colors hover:bg-rosewood-dark disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
