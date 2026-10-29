
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        console.error('Get session error:', error.message)
        return
      }

      setUser(data.session?.user ?? null)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo:
              window.location.origin + import.meta.env.BASE_URL,
          },
        })

        console.log('Signup result:', data)
        console.log('Signup error:', error)

        if (error) {
          setStatus('error')
          setMessage(error.message)
          return
        }

        if (!data.user) {
          setStatus('error')
          setMessage('No user was returned. Please try again.')
          return
        }

        if (!data.session) {
          setStatus('confirm')
          setMessage(
            `Signup accepted for ${email}. Check your inbox and spam folder for the confirmation email.`
          )
        } else {
          setStatus('idle')
          setMessage('Your account has been created successfully.')
        }

        return
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }

      setUser(data.user)
      setStatus('idle')
      setMessage('')
    } catch (err) {
      console.error('Authentication error:', err)
      setStatus('error')
      setMessage(err.message || 'Something went wrong.')
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setStatus('error')
      setMessage('Enter your email address first.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const redirectUrl =
        window.location.origin +
        import.meta.env.BASE_URL +
        'reset-password'

      const { error } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl,
        })

      if (error) {
        setStatus('error')
        setMessage(error.message)
      } else {
        setStatus('idle')
        setMessage(
          'If the email can receive a reset link, check your inbox and spam folder.'
        )
      }
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Could not request a password reset.')
    }
  }

  async function handleLogout() {
    setStatus('loading')
    setMessage('')

    const { error } = await supabase.auth.signOut()

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setUser(null)
      setStatus('idle')
    }
  }

  if (user) {
    return (
      <section className="section auth-page">
        <div className="auth-box">
          <p className="eyebrow">Signed in</p>
          <h1>Welcome.</h1>

          <p className="muted" style={{ margin: '1rem 0' }}>
            {user.email}
          </p>

          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Please wait...' : 'Log out'}
          </button>

          {message && <p className="muted">{message}</p>}
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
          <div>
            <p className="lede">{message}</p>

            <button
              type="button"
              className="text-link"
              onClick={() => {
                setStatus('idle')
                setMessage('')
                setMode('login')
              }}
            >
              Back to login
            </button>
          </div>
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
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
              />
            </label>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading'
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Be With Us'
                  : 'Create account'}
            </button>

            {message && (
              <p
                className="muted"
                role="status"
                style={{ overflowWrap: 'anywhere' }}
              >
                {message}
              </p>
            )}

            <button
              type="button"
              className="text-link"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setStatus('idle')
                setMessage('')
              }}
            >
              {mode === 'login'
                ? 'No account? Create one'
                : 'Have an account? Log in'}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                className="text-link"
                onClick={handleReset}
                disabled={status === 'loading'}
              >
                Forgot password?
              </button>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
