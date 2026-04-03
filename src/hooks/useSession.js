import { useState } from 'react'
import api from '../utils/api'

export function useSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ CREATE SESSION
  async function createSession({ title, description }) {
    try {
      setLoading(true)
      setError('')
      const res = await api.post('/sessions', { title, description })
      return res.data.session || res.data
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create session'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ GET MY SESSIONS
  async function getMySessions() {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/sessions/mine')
      return res.data.sessions
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch sessions'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ GET SESSION BY CODE
  async function getSessionByCode(invite_code) {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/sessions/code/${invite_code}`)
      return res.data.session
    } catch (err) {
      const msg = err.response?.data?.error || 'Session not found'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 🔥 FIXED (IMPORTANT)
  async function getSessionById(id) {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/sessions/by-id/${id}`)
      return res.data.session   // ✅ FIXED
    } catch (err) {
      const msg = err.response?.data?.error || 'Session not found'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ JOIN SESSION
  async function joinSession(invite_code) {
    try {
      setLoading(true)
      setError('')
      const res = await api.post(`/sessions/join/${invite_code}`)
      return res.data.session
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to join session'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ START SESSION
  async function startSession(session_id) {
    try {
      setLoading(true)
      setError('')
      const res = await api.patch(`/sessions/${session_id}/start`)
      return res.data.session
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to start session'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ END SESSION
  async function endSession(session_id) {
    try {
      setLoading(true)
      setError('')
      const res = await api.patch(`/sessions/${session_id}/end`)
      return res.data.session
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to end session'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createSession,
    getMySessions,
    getSessionByCode,
    getSessionById,
    joinSession,
    startSession,
    endSession
  }
}