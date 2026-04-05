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

    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errs.email = 'Valid email required'

    if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters'

    if (!form.role)
      errs.role = 'Please select a role'

    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()

    console.log("SIGNUP CLICKED ✅")

    setError('')
    const errs = validate()

    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }

    setFieldErrors({})

    try {
      // ✅ FIXED CALL (THIS WAS YOUR BUG)
      await signup(
        form.email,
        form.password,
        form.full_name,
        form.role
      )

      console.log("SIGNUP SUCCESS ✅")

      navigate('/dashboard')

    } catch (err) {
      console.log('Signup error:', err)
    }
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFieldErrors(fe => ({ ...fe, [e.target.name]: '' }))
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* LEFT PANEL */}
        <div style={styles.panel}>
          <div style={styles.logo}>⌨</div>
          <h1 style={styles.brand}>CodeCollab</h1>
          <p style={styles.tagline}>
            Real-time collaborative coding for mentors and students
          </p>
        </div>

        {/* RIGHT FORM */}
        <div style={styles.form}>
          <h2 style={styles.title}>Create account</h2>

          {error && <div style={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.fields}>

            <input
              name="full_name"
              placeholder="Full name"
              value={form.full_name}
              onChange={handleChange}
              style={styles.input}
            />
            {fieldErrors.full_name && <span style={styles.fieldError}>{fieldErrors.full_name}</span>}

            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
            {fieldErrors.email && <span style={styles.fieldError}>{fieldErrors.email}</span>}

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
            />
            {fieldErrors.password && <span style={styles.fieldError}>{fieldErrors.password}</span>}

            {/* ROLE */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, role: 'student' }))}
                style={{
                  ...styles.roleBtn,
                  ...(form.role === 'student' ? styles.roleActive : {})
                }}
              >
                🎓 Student
              </button>

              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, role: 'mentor' }))}
                style={{
                  ...styles.roleBtn,
                  ...(form.role === 'mentor' ? styles.roleActive : {})
                }}
              >
                👨‍🏫 Mentor
              </button>
            </div>
            {fieldErrors.role && <span style={styles.fieldError}>{fieldErrors.role}</span>}

            <button type="submit" disabled={loading} style={styles.submit}>
              {loading ? 'Creating...' : 'Create account'}
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

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0f0f13'
  },
  card: {
    display: 'flex',
    width: 750
  },
  panel: {
    width: '40%',
    background: '#1e1b4b',
    color: 'white',
    padding: 30
  },
  form: {
    width: '60%',
    background: '#18181f',
    padding: 30
  },
  title: { color: 'white' },
  input: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    background: '#0f0f16',
    color: 'white'
  },
  fieldError: { color: 'red', fontSize: 12 },
  roleBtn: {
    flex: 1,
    padding: 10,
    background: '#0f0f16',
    color: 'white',
    border: '1px solid #333'
  },
  roleActive: {
    border: '1px solid #6366f1'
  },
  submit: {
    marginTop: 15,
    padding: 12,
    background: '#6366f1',
    color: 'white',
    border: 'none'
  },
  errorBanner: {
    color: 'red',
    marginBottom: 10
  },
  switchText: {
    marginTop: 15,
    color: '#aaa'
  },
  link: {
    color: '#6366f1'
  }
}