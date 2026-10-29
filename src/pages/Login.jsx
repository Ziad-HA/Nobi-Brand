import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('sent')
    }
  }

  if (user) {
    return (
      <section className="section">
        <p className="eyebrow">Signed in</p>
        <h1>Welcome.</h1>
        <p className="muted" style={{ margin: '1rem 0' }}>{user.email}</p>
        <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
          Log out
        </button>
      </section>
    )
  }

  return (
    <section className="section">
      <p className="eyebrow">Members</p>
      <h1>Log in.</h1>

      {status === 'sent' ? (
        <p className="lede" style={{ marginTop: '1.5rem' }}>
          Check your inbox. We sent a login link to {email}.
        </p>
      ) : (
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <button className="btn btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending...' : 'Send me a link'}
          </button>
          {status === 'error' && <p className="muted">{message}</p>}
        </form>
      )}
    </section>
  )
}