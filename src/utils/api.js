// src/utils/api.js
import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: 'https://code-collab-backend-427n.onrender.com/api'
})

// ✅ Get token from Supabase session (not localStorage)
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})

// ✅ Handle 401 — but only redirect if truly no session
api.interceptors.response.use(
  res => res,
  async (err) => {
    if (err.response?.status === 401) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api