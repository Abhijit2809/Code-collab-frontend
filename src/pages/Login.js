// src/pages/Login.js

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
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      console.log('Login Error:', err)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
  }

  return (
    <div style={styles.page}>

      {/* Glow blobs */}
      <div style={styles.glowTopLeft} />
      <div style={styles.glowBottomRight} />

      <div style={styles.card}>

        {/* LEFT PANEL */}
        <div style={styles.panel}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>⌨️</span>
            <span style={styles.logoText}>CodeCollab</span>
          </div>

          <div style={styles.panelCenter}>
            <h2 style={styles.panelHeading}>Welcome back.</h2>
            <p style={styles.panelSub}>Your session is waiting for you.</p>

            <div style={styles.divider} />

            <div style={styles.featureList}>
              {[
                { icon: '⚡', text: 'Real-time collaboration' },
                { icon: '🎥', text: 'Video & audio calls' },
                { icon: '🔒', text: 'Secure role-based access' },
              ].map(f => (
                <div key={f.text} style={styles.featureRow}>
                  <span style={styles.featureIcon}>{f.icon}</span>
                  <span style={styles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div style={styles.formPanel}>
          <div style={styles.formInner}>

            <h2 style={styles.formTitle}>Sign in</h2>
            <p style={styles.formSub}>Enter your credentials to continue</p>

            {error && (
              <div style={styles.errorBanner}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(fieldErrors.email ? styles.inputError : {})
                  }}
                />
                {fieldErrors.email && (
                  <span style={styles.fieldError}>⚠ {fieldErrors.email}</span>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(fieldErrors.password ? styles.inputError : {})
                  }}
                />
                {fieldErrors.password && (
                  <span style={styles.fieldError}>⚠ {fieldErrors.password}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={styles.button}
              >
                {loading ? '⏳ Signing in...' : 'Sign in →'}
              </button>

            </form>

            <div style={styles.switchRow}>
              <span style={styles.switchText}>Don't have an account?</span>
              <Link to="/signup" style={styles.link}>Create one</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a12 0%, #0f0f1e 60%, #0a0a12 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  glowTopLeft: {
    position: 'absolute', top: -150, left: -150,
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glowBottomRight: {
    position: 'absolute', bottom: -150, right: -150,
    width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    display: 'flex',
    width: '820px',
    minHeight: '500px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
    position: 'relative',
    zIndex: 1,
  },

  // LEFT PANEL
  panel: {
    width: '42%',
    background: 'linear-gradient(160deg, #1e1b4b 0%, #2d2a6e 50%, #1e1b4b 100%)',
    padding: '44px 36px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoIcon: { fontSize: 26 },
  logoText: {
    fontSize: 20, fontWeight: 700, color: 'white',
    letterSpacing: '-0.3px',
  },
  panelCenter: {
    flex: 1, display: 'flex', flexDirection: 'column',
    justifyContent: 'center', marginTop: 20,
  },
  panelHeading: {
    fontSize: 28, fontWeight: 800, color: 'white',
    margin: '0 0 10px', lineHeight: 1.2,
  },
  panelSub: {
    color: '#a5b4fc', fontSize: 15,
    margin: '0 0 28px', lineHeight: 1.6,
  },
  divider: {
    height: 1, background: 'rgba(165,180,252,0.15)',
    marginBottom: 28,
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: 14 },
  featureRow: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 36, height: 36,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 16, flexShrink: 0,
    textAlign: 'center', lineHeight: '36px',
  },
  featureText: { color: '#c7d2fe', fontSize: 14 },

  // RIGHT FORM
  formPanel: {
    width: '58%',
    background: '#111120',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '44px 48px',
  },
  formInner: { width: '100%', maxWidth: 340 },
  formTitle: {
    fontSize: 24, fontWeight: 700, color: 'white',
    margin: '0 0 6px',
  },
  formSub: {
    color: '#6b7280', fontSize: 14,
    margin: '0 0 28px',
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5', padding: '11px 16px',
    borderRadius: 10, fontSize: 14, marginBottom: 22,
  },
  fieldGroup: { marginBottom: 20 },
  label: {
    display: 'block', color: '#9ca3af',
    fontSize: 13, fontWeight: 500, marginBottom: 8,
  },
  input: {
    width: '100%', padding: '12px 14px',
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: 10, color: 'white', fontSize: 15,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: 'rgba(239,68,68,0.4)',
  },
  fieldError: {
    display: 'block', color: '#f87171',
    fontSize: 12, marginTop: 6,
  },
  button: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none', borderRadius: 10,
    color: 'white', fontSize: 16, fontWeight: 600,
    cursor: 'pointer', marginTop: 6,
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
    letterSpacing: '0.2px',
  },
  switchRow: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', gap: 6, marginTop: 24,
  },
  switchText: { color: '#6b7280', fontSize: 14 },
  link: {
    color: '#818cf8', fontWeight: 600,
    textDecoration: 'none', fontSize: 14,
  },
}