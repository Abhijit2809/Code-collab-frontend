import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup, loading, error, setError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required'
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!form.role) errs.role = 'Please select a role'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) return setFieldErrors(errs)
    setFieldErrors({})
    try {
      await signup(form)
      navigate('/dashboard')
    } catch (_) {}
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
          <p style={styles.tagline}>Real-time collaborative coding for mentors and students</p>
          <div style={styles.features}>
            {['Live code editing', 'Video & audio calls', 'Role-based access', 'Instant feedback'].map(f => (
              <div key={f} style={styles.feature}>
                <span style={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div style={styles.form}>
          <div style={styles.formHeader}>
            <h2 style={styles.title}>Create account</h2>
            <p style={styles.subtitle}>Join thousands of learners and mentors</p>
          </div>

          {error && <div style={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.fields} noValidate>
            <Field
              label="Full name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Jane Smith"
              error={fieldErrors.full_name}
            />
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
              placeholder="Min. 6 characters"
              error={fieldErrors.password}
            />

            {/* Role selector */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>I am a</label>
              <div style={styles.roleRow}>
                {['student', 'mentor'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, role: r })); setFieldErrors(fe => ({ ...fe, role: '' })) }}
                    style={{
                      ...styles.roleBtn,
                      ...(form.role === r ? styles.roleBtnActive : {})
                    }}
                  >
                    <span style={styles.roleIcon}>{r === 'student' ? '🎓' : '👨‍🏫'}</span>
                    <span style={styles.roleLabel}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                    <span style={styles.roleDesc}>{r === 'student' ? 'I want to learn' : 'I want to teach'}</span>
                  </button>
                ))}
              </div>
              {fieldErrors.role && <span style={styles.fieldError}>{fieldErrors.role}</span>}
            </div>

            <button type="submit" style={styles.submit} disabled={loading}>
              {loading ? <span style={styles.spinner} /> : 'Create account'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
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
    maxWidth: 880,
    minHeight: 580,
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
  },
  panel: {
    flex: '0 0 300px',
    background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 100%)',
    padding: '48px 36px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  logo: { fontSize: 36 },
  brand: { color: '#e2e8f0', fontSize: 24, fontWeight: 700, margin: 0 },
  tagline: { color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 },
  features: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 },
  feature: { display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 14 },
  featureDot: { width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 },
  form: {
    flex: 1,
    background: '#18181f',
    padding: '40px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  formHeader: { marginBottom: 28 },
  title: { color: '#f1f5f9', fontSize: 24, fontWeight: 700, margin: '0 0 6px' },
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
  fields: { display: 'flex', flexDirection: 'column', gap: 18 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: 500 },
  input: {
    background: '#0f0f16',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '11px 14px',
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  inputFocused: { borderColor: '#6366f1' },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#f87171', fontSize: 12 },
  roleRow: { display: 'flex', gap: 12 },
  roleBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '14px 12px',
    background: '#0f0f16',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  roleBtnActive: {
    borderColor: '#6366f1',
    background: 'rgba(99,102,241,0.12)',
  },
  roleIcon: { fontSize: 22 },
  roleLabel: { color: '#e2e8f0', fontSize: 14, fontWeight: 600 },
  roleDesc: { color: '#64748b', fontSize: 12 },
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
  switchText: { color: '#64748b', fontSize: 14, marginTop: 20, textAlign: 'center' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
}
