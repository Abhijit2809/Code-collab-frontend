// src/hooks/useSession.js

import { useState } from 'react'
import api from '../utils/api'

export function useSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ CREATE SESSION
  async function createSession({ title, description }) {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/sessions', { title, description }) // ✅ FIXED
      return res.data
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
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/sessions/mine') // ✅ FIXED
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
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/sessions/code/${invite_code}`) // ✅ FIXED
      return res.data.session
    } catch (err) {
      const msg = err.response?.data?.error || 'Session not found'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ GET SESSION BY ID
  async function getSessionById(id) {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/sessions/by-id/${id}`) // ✅ FIXED
      return res.data
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
    setLoading(true)
    setError('')
    try {
      const res = await api.post(`/sessions/join/${invite_code}`) // ✅ FIXED
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
    setLoading(true)
    setError('')
    try {
      const res = await api.patch(`/sessions/${session_id}/start`) // ✅ FIXED
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
    setLoading(true)
    setError('')
    try {
      const res = await api.patch(`/sessions/${session_id}/end`) // ✅ FIXED
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