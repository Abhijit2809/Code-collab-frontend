// src/hooks/useSession.js

import { useState } from 'react'
import api from '../utils/api'

export function useSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  // ── createSession ───────────────────────────────────
  async function createSession({ title, description }) {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/sessions', { title, description })
      return res.data
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create session'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── getMySessions ───────────────────────────────────
  async function getMySessions() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/sessions/mine')
      return res.data.sessions
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch sessions'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── getSessionByCode (✅ FIXED) ─────────────────────
  async function getSessionByCode(invite_code) {
    setLoading(true)
    setError('')
    try {
      // ✅ FIX: match backend route
      const res = await api.get(`/api/sessions/code/${invite_code}`)
      return res.data.session
    } catch (err) {
      const msg = err.response?.data?.error || 'Session not found'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── getSessionById (🔥 ADD THIS) ─────────────────────
async function getSessionById(id) {
  setLoading(true)
  setError('')
  try {
    const res = await api.get(`/api/sessions/by-id/${id}`)
    return res.data
  } catch (err) {
    const msg = err.response?.data?.error || 'Session not found'
    setError(msg)
    throw new Error(msg)
  } finally {
    setLoading(false)
  }
}

  // ── joinSession ─────────────────────────────────────
  async function joinSession(invite_code) {
    setLoading(true)
    setError('')
    try {
      const res = await api.post(`/api/sessions/join/${invite_code}`)
      return res.data.session
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to join session'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── startSession ────────────────────────────────────
  async function startSession(session_id) {
    setLoading(true)
    setError('')
    try {
      const res = await api.patch(`/api/sessions/${session_id}/start`)
      return res.data.session
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to start session'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── endSession ──────────────────────────────────────
  async function endSession(session_id) {
    setLoading(true)
    setError('')
    try {
      const res = await api.patch(`/api/sessions/${session_id}/end`)
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