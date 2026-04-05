// src/pages/Signup.js

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup, loading, error, setError } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required'
    if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (!form.role) errs.role = 'Select role'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) return setFieldErrors(errs)

    setFieldErrors({})

    try {
      await signup(form.email, form.password, form.full_name, form.role)
      navigate('/dashboard')
    } catch (err) {
      console.log(err)
    }
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFieldErrors(fe => ({ ...fe, [e.target.name]: '' }))
  }

  return (
    <div style={styles.page}>

      <div style={styles.glowTopLeft} />
      <div style={styles.glowBottomRight} />

      <div style={styles.card}>

        {/* LEFT PANEL */}
        <div style={styles.panel}>
          <h2 style={styles.heading}>Join CodeCollab</h2>
          <p style={styles.sub}>Start collaborating in real-time.</p>
        </div>

        {/* FORM */}
        <div style={styles.formPanel}>
          <div style={styles.formInner}>
            <h2 style={styles.title}>Create account</h2>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>

              <input name="full_name" placeholder="Full name"
                value={form.full_name} onChange={handleChange}
                style={styles.input} />
              {fieldErrors.full_name && <span style={styles.err}>{fieldErrors.full_name}</span>}

              <input name="email" placeholder="Email"
                value={form.email} onChange={handleChange}
                style={styles.input} />
              {fieldErrors.email && <span style={styles.err}>{fieldErrors.email}</span>}

              <input type="password" name="password" placeholder="Password"
                value={form.password} onChange={handleChange}
                style={styles.input} />
              {fieldErrors.password && <span style={styles.err}>{fieldErrors.password}</span>}

              {/* ROLE */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'student' }))}
                  style={{
                    ...styles.roleBtn,
                    ...(form.role === 'student' && styles.roleActive)
                  }}>
                  🎓 Student
                </button>

                <button type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'mentor' }))}
                  style={{
                    ...styles.roleBtn,
                    ...(form.role === 'mentor' && styles.roleActive)
                  }}>
                  👨‍🏫 Mentor
                </button>
              </div>
              {fieldErrors.role && <span style={styles.err}>{fieldErrors.role}</span>}

              <button type="submit" style={styles.btn}>
                {loading ? 'Creating...' : 'Create account →'}
              </button>

            </form>

            <p style={styles.switch}>
              Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
            </p>

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
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0a0a12',
    position: 'relative'
  },
  glowTopLeft: {
    position: 'absolute', width: 500, height: 500,
    background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)',
    top: -150, left: -150
  },
  glowBottomRight: {
    position: 'absolute', width: 600, height: 600,
    background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent)',
    bottom: -150, right: -150
  },
  card: {
    display: 'flex',
    width: 820,
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)'
  },
  panel: {
    width: '40%',
    background: 'linear-gradient(160deg,#1e1b4b,#2d2a6e)',
    padding: 40,
    color: 'white'
  },
  heading: { fontSize: 26 },
  sub: { color: '#c7d2fe' },

  formPanel: {
    width: '60%',
    background: '#111120',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formInner: { width: '80%' },
  title: { color: 'white', marginBottom: 20 },

  input: {
    width: '100%',
    padding: 12,
    marginTop: 12,
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    color: 'white',
    borderRadius: 10
  },
  err: { color: '#f87171', fontSize: 12 },

  roleBtn: {
    flex: 1,
    padding: 10,
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    color: 'white',
    borderRadius: 8
  },
  roleActive: {
    border: '1px solid #6366f1',
    background: 'rgba(99,102,241,0.2)'
  },

  btn: {
    marginTop: 20,
    padding: 12,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: 'none',
    color: 'white',
    borderRadius: 10
  },

  switch: { marginTop: 20, color: '#aaa' },
  link: { color: '#818cf8' },
  error: { color: '#f87171' }
}