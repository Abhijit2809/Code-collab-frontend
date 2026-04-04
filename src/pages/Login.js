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
      // ✅ FIXED LOGIN CALL
      await login(form.email, form.password)

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

        {/* LEFT PANEL */}
        <div style={styles.panel}>
          <h1 style={styles.brand}>CodeCollab</h1>
          <p style={styles.tagline}>
            Welcome back. Your session is waiting.
          </p>
        </div>

        {/* RIGHT FORM */}
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
              <span style={styles.fieldError}>
                {fieldErrors.email}
              </span>
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
              <span style={styles.fieldError}>
                {fieldErrors.password}
              </span>
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

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f13',
    fontFamily: 'Segoe UI, sans-serif'
  },

  card: {
    display: 'flex',
    width: '750px',
    height: '450px',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
  },

  panel: {
    width: '40%',
    background: 'linear-gradient(160deg, #1e1b4b, #0f172a)',
    color: 'white',
    padding: '40px'
  },

  brand: {
    fontSize: '24px',
    marginBottom: '10px'
  },

  tagline: {
    fontSize: '14px',
    color: '#cbd5e1'
  },

  form: {
    width: '60%',
    background: '#18181f',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column'
  },

  title: {
    color: 'white',
    marginBottom: '20px'
  },

  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#0f0f16',
    color: 'white'
  },

  inputError: {
    border: '1px solid red'
  },

  fieldError: {
    color: 'red',
    fontSize: '12px'
  },

  button: {
    padding: '12px',
    background: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer'
  },

  error: {
    background: 'rgba(255,0,0,0.2)',
    color: 'red',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '6px'
  },

  switchText: {
    marginTop: '20px',
    color: '#aaa'
  },

  link: {
    color: '#6366f1'
  }
}