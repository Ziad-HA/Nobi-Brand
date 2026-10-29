import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error | confirm
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
    setMessage('')

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
        },
      })
      if (error) {
        setStatus('error')
        setMessage(error.message)
      } else if (!data.session) {
        setStatus('confirm')
      } else {
        setStatus('idle')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setStatus('error')
        setMessage(error.message)
      } else {
        setStatus('idle')
      }
    }
  }

  async function handleReset() {
    if (!email) {
      setStatus('error')
      setMessage('Enter your email first.')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + import.meta.env.BASE_URL + 'reset-password',
    })
    setStatus(error ? 'error' : 'idle')
    setMessage(error ? error.message : 'Password reset link sent. Check your inbox.')
  }

  if (user) {
    return (
      <section className="section auth-page">
        <div className="auth-box">
          <p className="eyebrow">Signed in</p>
          <h1>Welcome.</h1>
          <p className="muted" style={{ margin: '1rem 0' }}>{user.email}</p>
          <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
            Log out
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="section auth-page">
      <div className="auth-box">
        <p className="eyebrow">Members</p>
        <h1>{mode === 'login' ? 'Be With Us' : 'Join Us'}</h1>

        {status === 'confirm' ? (
          <p className="lede">
            Check your inbox. We sent a confirmation link to {email}.
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>

            <button className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading'
                ? 'Please wait...'
                : mode === 'login'
                ? 'Be With Us'
                : 'Create account'}
            </button>

            {message && <p className="muted">{message}</p>}

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

            {mode === 'login' && (
              <button type="button" className="text-link" onClick={handleReset}>
                Forgot password?
              </button>
            )}
          </form>
        )}
      </div>
    </section>
  )
}