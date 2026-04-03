import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading, error, setError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  async function handleSubmit(e) {
  e.preventDefault()
  console.log("Form Submitted")

  setError('')
  const errs = validate()

  if (Object.keys(errs).length) {
    setFieldErrors(errs)
    return
  }

  setFieldErrors({})

  try {
    const user = await login(form)

    console.log("login success", user)

    // ⏳ wait for React state update
    setTimeout(() => {
      console.log("Navigating to dashboard...")
      navigate('/dashboard')
    }, 100)

  } catch (err) {
    console.log("Login Error", err)
  }
}

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFieldErrors(fe => ({ ...fe, [e.target.name]: '' }))
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Left panel */}
        <div style={styles.panel}>
          <div style={styles.logo}>⌨</div>
          <h1 style={styles.brand}>CodeCollab</h1>
          <p style={styles.tagline}>Welcome back. Your session is waiting.</p>
          <div style={styles.quote}>
            <p style={styles.quoteText}>"The best way to learn is to teach."</p>
            <span style={styles.quoteAuthor}>— Richard Feynman</span>
          </div>
        </div>

        {/* Right form */}
        <div style={styles.form}>
          <div style={styles.formHeader}>
            <h2 style={styles.title}>Sign in</h2>
            <p style={styles.subtitle}>Enter your credentials to continue</p>
          </div>

          {error && <div style={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.fields} noValidate>
            <Field
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              error={fieldErrors.email}
            />
            <Field
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              error={fieldErrors.password}
            />

            <button type="submit" style={styles.submit} disabled={loading}>
              {loading ? <span style={styles.spinner} /> : 'Sign in'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...styles.input,
          ...(focused ? styles.inputFocused : {}),
          ...(error ? styles.inputError : {})
        }}
      />
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f13',
    padding: '24px',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  card: {
    display: 'flex',
    width: '100%',
    maxWidth: 780,
    minHeight: 480,
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
  },
  panel: {
    flex: '0 0 280px',
    background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 100%)',
    padding: '48px 36px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
    borderRight: '1px solid rgba(23, 17, 17, 0.06)',
  },
  logo: { fontSize: 36 },
  brand: { color: '#e2e8f0', fontSize: 24, fontWeight: 700, margin: 0 },
  tagline: { color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 },
  quote: {
    marginTop: 24,
    padding: '16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderLeft: '3px solid #6366f1',
  },
  quoteText: { color: '#cbd5e1', fontSize: 13, fontStyle: 'italic', margin: '0 0 6px' },
  quoteAuthor: { color: '#64748b', fontSize: 12 },
  form: {
    flex: 1,
    background: '#18181f',
    padding: '48px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  formHeader: { marginBottom: 32 },
  title: { color: '#f1f5f9', fontSize: 26, fontWeight: 700, margin: '0 0 6px' },
  subtitle: { color: '#64748b', fontSize: 14, margin: 0 },
  errorBanner: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
  fields: { display: 'flex', flexDirection: 'column', gap: 20 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: 500 },
  input: {
    background: '#0f0f16',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  inputFocused: { borderColor: '#6366f1' },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#f87171', fontSize: 12 },
  submit: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '13px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    transition: 'opacity 0.15s',
  },
  spinner: {
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  switchText: { color: '#64748b', fontSize: 14, marginTop: 24, textAlign: 'center' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
}
