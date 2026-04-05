// src/context/AuthContext.js

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async (session) => {
      if (!session) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const currentUser = session.user

        // Fetch profile via backend (avoids RLS issues)
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        )

        if (!response.ok) {
          console.log('Profile fetch failed:', response.status)
          setUser(null)
        } else {
          const data = await response.json()
          setUser({
            ...currentUser,
            role: data.user.role,
            full_name: data.user.full_name
          })
        }

      } catch (err) {
        console.log('loadUser error:', err)
        setUser(null)
      }

      setLoading(false)
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoading(true)
        loadUser(session)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // ✅ LOGIN — uses backend
  async function login(email, password) {
    setError('')
    setLoading(true)

    try {
      // Step 1: Authenticate via backend
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')

      // Step 2: Create Supabase session on frontend
      const { error: sessionError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (sessionError) throw sessionError

    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }

  // ✅ SIGNUP — uses backend
  async function signup(email, password, full_name, role) {
    setError('')
    setLoading(true)

    try {
      // Step 1: Backend creates user with admin key (bypasses RLS)
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name, role })
        }
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Signup failed')

      // Step 2: Sign in to create session
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) throw loginError

    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ✅ LOGOUT
  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      login,
      signup,
      logout,
      user,
      loading,
      error,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}