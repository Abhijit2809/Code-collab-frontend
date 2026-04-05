// src/pages/Login.js

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading, error, setError } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errs = {}

    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errs.email = 'Valid email required'
    }

    if (!form.password) {
      errs.password = 'Password is required'
    }

    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    const errs = validate()

    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }

    setFieldErrors({})

    try {
      await login(form.email, form.password)

      // ✅ wait for AuthContext to update user
      navigate('/dashboard')

    } catch (err) {
      console.log('Login Error:', err)
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })

    setFieldErrors({
      ...fieldErrors,
      [e.target.name]: ''
    })
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.panel}>
          <h1 style={styles.brand}>CodeCollab</h1>
          <p style={styles.tagline}>
            Welcome back. Your session is waiting.
          </p>
        </div>

        <div style={styles.form}>
          <h2 style={styles.title}>Sign in</h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.fields}>

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(fieldErrors.email && styles.inputError)
              }}
            />
            {fieldErrors.email && (
              <span style={styles.fieldError}>{fieldErrors.email}</span>
            )}

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(fieldErrors.password && styles.inputError)
              }}
            />
            {fieldErrors.password && (
              <span style={styles.fieldError}>{fieldErrors.password}</span>
            )}

            <button
              type="submit"
              disabled={loading}
              style={styles.button}
            >
              {loading ? 'Loading...' : 'Sign in'}
            </button>

          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// styles unchanged
const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f13' },
  card: { display: 'flex', width: '750px', height: '450px', borderRadius: '15px', overflow: 'hidden' },
  panel: { width: '40%', background: '#1e1b4b', color: 'white', padding: '40px' },
  form: { width: '60%', background: '#18181f', padding: '40px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#0f0f16', color: 'white' },
  button: { padding: '12px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white' },
  error: { color: 'red', marginBottom: '10px' },
  fieldError: { color: 'red', fontSize: '12px' }
}