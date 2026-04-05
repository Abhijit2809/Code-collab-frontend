// src/pages/Dashboard.js

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../hooks/useSession'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { createSession, getMySessions, loading } = useSession()

  const [sessions, setSessions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [newSession, setNewSession] = useState(null)
  const [copied, setCopied] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [formError, setFormError] = useState('')

  const isMentor = user?.role === 'mentor'

  // ✅ SAFE LOAD (ONLY WHEN USER EXISTS)
  const loadSessions = useCallback(async () => {
    if (!user) return

    try {
      const data = await getMySessions()
      setSessions(data || [])
    } catch (error) {
      console.log('Session fetch error:', error)
    }
  }, [getMySessions, user])

  useEffect(() => {
    if (user && isMentor) {
      loadSessions()
    }
  }, [user, isMentor, loadSessions])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  /* ── CREATE SESSION ── */
  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')

    if (!form.title.trim()) {
      return setFormError('Title is required')
    }

    try {
      const data = await createSession(form)

      setNewSession(data)
      setShowForm(false)
      setForm({ title: '', description: '' })

      // ✅ SAFE UPDATE
      if (data?.session) {
        setSessions(prev => [data.session, ...prev])
      }

    } catch (error) {
      console.log(error)
      setFormError(error.message)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(newSession.invite_link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleJoinRedirect(e) {
    e.preventDefault()
    if (!joinCode.trim()) return

    const code = joinCode.trim().split('/').pop()
    navigate(`/join/${code}`)
  }

  function statusStyle(status) {
    if (status === 'active') return { ...styles.badge, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }
    if (status === 'waiting') return { ...styles.badge, background: 'rgba(234,179,8,0.15)', color: '#fde047' }
    return { ...styles.badge, background: 'rgba(100,116,139,0.15)', color: '#94a3b8' }
  }

  // ❗ CRITICAL SAFETY GUARD
  if (!user) {
    return <div style={{ padding: 20 }}>Loading user...</div>
  }

  return (
    <div style={styles.page}>
      {/* TOPBAR */}
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <span style={styles.logo}>⌨</span>
          <span style={styles.brandName}>CodeCollab</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>
      </div>

      <div style={styles.content}>
        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.avatarCircle}>
            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          <div>
            <h1 style={styles.welcome}>
              Welcome, {user.full_name?.split(' ')[0]}
            </h1>
            <p style={styles.welcomeSub}>{user.email}</p>
          </div>

          <span style={{
            ...styles.roleBadge,
            ...(isMentor ? styles.mentorBadge : styles.studentBadge)
          }}>
            {isMentor ? '👨‍🏫 Mentor' : '🎓 Student'}
          </span>
        </div>

        {/* ───────── MENTOR VIEW ───────── */}
        {isMentor && (
          <>
            {/* INVITE BANNER */}
            {newSession && (
              <div style={styles.inviteBanner}>
                <div>
                  <p>Session created!</p>
                  <p><strong>{newSession.invite_link}</strong></p>
                </div>

                <button onClick={copyLink}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>

                <button
                  onClick={() => navigate(`/session/${newSession.session.id}`)}
                >
                  Open →
                </button>
              </div>
            )}

            {/* CREATE FORM */}
            {!showForm ? (
              <button onClick={() => setShowForm(true)} style={styles.createBtn}>
                + Create session
              </button>
            ) : (
              <form onSubmit={handleCreate}>
                {formError && <p style={{ color: 'red' }}>{formError}</p>}

                <input
                  placeholder="Title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />

                <button type="submit">
                  {loading ? 'Creating...' : 'Create'}
                </button>

                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </form>
            )}

            {/* SESSION LIST */}
            <h2>Your Sessions</h2>

            {sessions.length === 0 ? (
              <p>No sessions yet</p>
            ) : (
              sessions.map(s => (
                <div key={s.id} style={styles.sessionCard}>
                  <p>{s.title}</p>
                  <p>{s.description}</p>
                  <p>Code: {s.invite_code}</p>

                  <span style={statusStyle(s.status)}>
                    {s.status}
                  </span>

                  <button onClick={() => navigate(`/session/${s.id}`)}>
                    Open →
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* ───────── STUDENT VIEW ───────── */}
        {!isMentor && (
          <>
            <h2>Join a session</h2>

            <form onSubmit={handleJoinRedirect}>
              <input
                placeholder="Enter code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
              />
              <button type="submit">Join →</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/* styles unchanged */
const styles = {
  page: { minHeight: '100vh', background: '#0f0f13', color: '#fff' },
  topbar: { display: 'flex', justifyContent: 'space-between', padding: 16 },
  topbarLeft: { display: 'flex', gap: 10 },
  content: { padding: 20 },
  hero: { display: 'flex', gap: 20, alignItems: 'center' },
  avatarCircle: { width: 50, height: 50, borderRadius: '50%', background: '#6366f1' },
  createBtn: { marginTop: 20, padding: 10, background: '#6366f1' },
  sessionCard: { border: '1px solid #333', padding: 10, marginTop: 10 }
}