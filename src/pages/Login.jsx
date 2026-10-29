import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [step, setStep] = useState('email') // email | code
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function sendCode(e) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('idle')
      setStep('code')
      setMessage('We sent a code to your email.')
    }
  }

  async function verifyCode(e) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    })

    if (error) {
      setStatus('error')
      setMessage('Invalid or expired code.')
    } else {
      setStatus('idle')
    }
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
        <h1>Be With Us</h1>

        {step === 'email' ? (
          <form className="checkout-form" onSubmit={sendCode}>
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
            <button className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send code'}
            </button>
            {message && <p className="muted">{message}</p>}
          </form>
        ) : (
          <form className="checkout-form" onSubmit={verifyCode}>
            <p className="muted">Code sent to {email}</p>
            <label>
              Code
              <input
                type="text"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the code"
                autoComplete="one-time-code"
              />
            </label>
            <button className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Checking...' : 'Be With Us'}
            </button>
            {message && <p className="muted">{message}</p>}
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setStep('email')
                setCode('')
                setMessage('')
                setStatus('idle')
              }}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </section>
  )
}