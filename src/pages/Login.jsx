import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import usePageMeta from '../lib/usePageMeta'

export default function Login() {
  const [mode, setMode] = useState(() => window.location.hash.includes('type=recovery') ? 'update' : 'login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  usePageMeta(mode === 'signup' ? 'Create account' : mode === 'reset' || mode === 'update' ? 'Reset password' : 'Login')

  const redirectTo = location.state?.from?.pathname || '/account'

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Account services are unavailable. Please try again later.')
      setMessageType('error')
      return undefined
    }

    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setMessage(error.message)
        setMessageType('error')
      }
      const sessionUser = data?.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser && mode !== 'update') navigate(redirectTo, { replace: true })
    }).catch(() => {
      if (active) {
        setMessage('Could not connect to the account service. Please try again.')
        setMessageType('error')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser && mode !== 'update') navigate(redirectTo, { replace: true })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [navigate, redirectTo, mode])

  function switchMode(nextMode) {
    setMode(nextMode)
    setStatus('idle')
    setMessage('')
    setMessageType('info')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!supabase || !isSupabaseConfigured) {
      setStatus('error')
      setMessage('Account services are unavailable. Please try again later.')
      setMessageType('error')
      return
    }

    setStatus('loading')
    setMessage('')
    setMessageType('info')
    const cleanEmail = email.trim().toLowerCase()

    try {
      if (mode === 'update') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setStatus('idle')
        setMessage('Your password has been updated successfully.')
        setMessageType('success')
        navigate('/account', { replace: true })
        return
      }

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        })
        if (error) throw error

        setStatus('idle')
        if (data.session) {
          setMessage('Your account is ready. Redirecting to your account…')
          setMessageType('success')
          navigate(redirectTo, { replace: true })
        } else {
          setMessage('Account created. Check your inbox and confirm your email before logging in.')
          setMessageType('success')
          setMode('login')
          setPassword('')
        }
        return
      }

      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/login`,
        })
        if (error) throw error
        setStatus('idle')
        setMessage('If an account exists for this email, a password reset link has been sent.')
        setMessageType('success')
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })
      if (error) throw error
      if (!data.session) throw new Error('Login could not be completed. Please try again.')
      setStatus('idle')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setStatus('error')
      setMessage(error?.message || 'Something went wrong. Please try again.')
      setMessageType('error')
    }
  }

  async function handleSignOut() {
    if (!supabase) return
    setStatus('loading')
    const { error } = await supabase.auth.signOut()
    setStatus('idle')
    if (error) {
      setMessage(error.message)
      setMessageType('error')
    } else {
      setUser(null)
      setMessage('You have been signed out.')
      setMessageType('success')
    }
  }

  if (user) {
    return (
      <section className="section auth-page">
        <div className="auth-box">
          <p className="eyebrow">UNSEEN / MEMBERS</p>
          <h1>YOU’RE IN<span>.</span></h1>
          <p className="muted" style={{ margin: '1rem 0' }}>{user.email}</p>
          <Link className="btn btn-primary" to="/account">View my account ↗</Link>
          <button className="btn btn-ghost" type="button" onClick={handleSignOut} disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="section auth-page">
      <div className="auth-box">
        <p className="eyebrow">UNSEEN / MEMBERS</p>
        <h1>{mode === 'signup' ? 'JOIN THE COMMUNITY' : mode === 'reset' ? 'RESET PASSWORD' : mode === 'update' ? 'CHOOSE A NEW PASSWORD' : 'WELCOME BACK'}<span>.</span></h1>
        <p className="muted" style={{ margin: '0 0 1.5rem' }}>
          {mode === 'signup' ? 'Create an account to keep track of your orders.' : mode === 'reset' ? 'We’ll send you a secure password reset link.' : mode === 'update' ? 'Choose a new password for your account.' : 'Sign in to view your account and orders.'}
        </p>

        <form className="checkout-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label>Full name
              <input type="text" required minLength={2} maxLength={80} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" />
            </label>
          )}
          <label>Email
            <input type="email" required autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          {mode !== 'reset' && mode !== 'update' && (
            <label>Password
              <input type="password" required minLength={6} autoComplete={mode === 'signup' || mode === 'update' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'signup' || mode === 'update' ? 'At least 6 characters' : 'Your password'} />
            </label>
          )}

          <button className="btn btn-primary" type="submit" disabled={status === 'loading' || !isSupabaseConfigured}>
            {status === 'loading' ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : mode === 'update' ? 'Update password' : 'Log in'}
          </button>

          {message && <p className="muted" role="status" aria-live="polite" style={{ color: messageType === 'error' ? '#ff7777' : undefined }}>{message}</p>}

          {mode === 'login' && <button type="button" className="text-link" onClick={() => switchMode('reset')}>Forgot your password?</button>}
          {(mode === 'reset' || mode === 'update') && <button type="button" className="text-link" onClick={() => switchMode('login')}>Back to login</button>}
          {mode !== 'reset' && (
            <button type="button" className="text-link" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'New to UNSEEN? Create an account' : 'Already have an account? Log in'}
            </button>
          )}
          <Link className="text-link" to="/shop">Continue shopping</Link>
        </form>
      </div>
    </section>
  )
}
