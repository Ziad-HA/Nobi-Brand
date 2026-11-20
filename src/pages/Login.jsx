import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Account features are unavailable until Supabase is configured.')
      return undefined
    }

    let active = true
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setMessage(error.message)
        setUser(data?.session?.user ?? null)
      })
      .catch(() => {
        if (active) setMessage('Could not connect to the account service. Please try again.')
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!supabase) {
      setStatus('error')
      setMessage('Account features are unavailable until Supabase is configured.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

        if (error) throw error

        setStatus('idle')
        setMessage(
          data.session
            ? 'Your account has been created.'
            : 'Check your email for a confirmation link to finish creating your account.',
        )
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    }
  }

  async function handleSignOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) setMessage(error.message)
  }

  if (user) {
    return (
      <section className="section auth-page">
        <div className="auth-box">
          <p className="eyebrow">Signed in</p>
          <h1>Welcome.</h1>
          <p className="muted" style={{ margin: '1rem 0' }}>{user.email}</p>
          <Link className="btn btn-primary" to="/account">View my orders ↗</Link>
          <button className="btn btn-ghost" type="button" onClick={handleSignOut}>
            Log out
          </button>
          {message && <p className="muted" role="status">{message}</p>}
        </div>
      </section>
    )
  }

  return (
    <section className="section auth-page">
      <div className="auth-box">
        <p className="eyebrow">Members</p>
        <h1>{mode === 'login' ? 'Be With Us' : 'Join Us'}</h1>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          <button className="btn btn-primary" disabled={status === 'loading' || !isSupabaseConfigured}>
            {status === 'loading'
              ? 'Please wait...'
              : mode === 'login'
              ? 'Be With Us'
              : 'Create account'}
          </button>

          {message && <p className="muted" role="status">{message}</p>}

          <button
            type="button"
            className="text-link"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setStatus('idle')
              setMessage('')
            }}
          >
            {mode === 'login' ? 'No account? Create one' : 'Have an account? Log in'}
          </button>
        </form>
      </div>
    </section>
  )
}
