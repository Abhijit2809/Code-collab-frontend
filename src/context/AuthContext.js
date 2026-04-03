import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
 import { createClient } from '@supabase/supabase-js'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Verify token is still valid on mount
useEffect(() => {
  const token = localStorage.getItem('access_token')
  const storedUser = localStorage.getItem('user')

  console.log("INIT AUTH:", { token, storedUser }) // 👈 debug

  if (token && storedUser) {
    setUser(JSON.parse(storedUser))
  }else{
    setUser(null)
  }

  // ✅ IMPORTANT: delay to prevent early redirect
  setTimeout(() => {
    setLoading(false)
  }, 300)

}, [])

  async function signup({ email, password, full_name, role }) {
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/signup', { email, password, full_name, role })
      // After signup, auto-login
      await login({ email, password })
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
      throw err
    } finally {
      setLoading(false)
    }
  }



const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

async function login({ email, password }) {
  setLoading(true)
  setError('')

  try {
    // ✅ Step 1: Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    const token = data.session.access_token

    // ✅ Step 2: Get full user (WITH ROLE) from backend
    const res = await api.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const userData = res.data.user

    console.log("✅ Full user from backend:", userData)

    // ✅ Step 3: Store correct user
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(userData))

    setUser(userData)

    return userData

  } catch (err) {
    console.error("❌ Login error:", err.message)
    setError(err.message || 'Login failed')
    throw err
  } finally {
    setLoading(false)
  }
}
  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
