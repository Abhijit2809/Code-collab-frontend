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

  const loadSessions = useCallback(async () => {
    if (!user) return
    try {
      const data = await getMySessions()
      setSessions(data || [])
    } catch (error) {
      console.log('Session fetch error:', error.message)
      setSessions([])
    }
  }, [user, getMySessions])

  useEffect(() => {
    if (user && isMentor) {
      loadSessions()
    }
  }, [user, isMentor, loadSessions])

  function handleLogout() {
    logout()
    navigate('/login')
  }

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

      if (data?.id) {
        setSessions(prev => [data, ...prev])
      }
    } catch (error) {
      setFormError(error.message)
    }
  }

  function copyLink() {
    const link = newSession?.invite_link || newSession?.invite_code
    navigator.clipboard.writeText(link)
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

  if (!user) {
    return <div style={{ color: 'white', padding: 20 }}>Loading...</div>
  }

  return (
    <div style={styles.page}>

      {/* TOPBAR */}
      <div style={styles.topbar}>
        <div style={styles.brand}>⌨ CodeCollab</div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>
      </div>

      <div style={styles.container}>

        {/* USER HERO */}
        <div style={styles.hero}>
          <div style={styles.avatar}>
            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          <div>
            <h2 style={{ margin: 0 }}>
              Welcome, {user.full_name?.split(' ')[0]}
            </h2>
            <p style={{ margin: 0, color: '#888' }}>{user.email}</p>
          </div>

          <div style={{
            ...styles.roleBadge,
            ...(isMentor ? styles.mentor : styles.student)
          }}>
            {isMentor ? '👨‍🏫 Mentor' : '🎓 Student'}
          </div>
        </div>

        {/* MENTOR */}
        {isMentor && (
          <>
            {newSession && (
              <div style={styles.banner}>
                <div>
                  <strong>Session Created</strong>
                  <p>Code: {newSession.invite_code}</p>
                </div>

                <button onClick={copyLink} style={styles.smallBtn}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>

                <button
                  onClick={() => navigate(`/session/${newSession.id}`)}
                  style={styles.smallBtn}
                >
                  Open →
                </button>
              </div>
            )}

            {!showForm ? (
              <button onClick={() => setShowForm(true)} style={styles.primaryBtn}>
                + Create Session
              </button>
            ) : (
              <form onSubmit={handleCreate}>
                {formError && <p style={{ color: 'red' }}>{formError}</p>}

                <input
                  placeholder="Session Title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={styles.input}
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={styles.input}
                />

                <button type="submit" style={styles.primaryBtn}>
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </form>
            )}

            <h3 style={{ marginTop: 30 }}>Your Sessions</h3>

            {sessions.length === 0 ? (
              <p style={{ color: '#777' }}>No sessions yet</p>
            ) : (
              sessions.map(s => (
                <div key={s.id} style={styles.card}>
                  <h4>{s.title}</h4>
                  <p style={{ color: '#aaa' }}>{s.description}</p>
                  <p style={{ color: '#888' }}>Code: {s.invite_code}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={statusStyle(s.status)}>{s.status}</span>

                    <button
                      onClick={() => navigate(`/session/${s.id}`)}
                      style={styles.smallBtn}
                    >
                      Open →
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* STUDENT */}
        {!isMentor && (
          <>
            <h3>Join Session</h3>

            <form onSubmit={handleJoinRedirect}>
              <input
                placeholder="Enter code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                style={styles.input}
              />

              <button type="submit" style={styles.primaryBtn}>
                Join →
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a12',
    color: 'white'
  },

  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 20,
    borderBottom: '1px solid #222'
  },

  brand: {
    fontWeight: 'bold',
    fontSize: 18
  },

  logoutBtn: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    padding: '8px 14px',
    color: 'white',
    borderRadius: 8
  },

  container: {
    maxWidth: 900,
    margin: 'auto',
    padding: 30
  },

  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    background: '#111120',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  roleBadge: {
    marginLeft: 'auto',
    padding: '6px 12px',
    borderRadius: 20
  },

  mentor: {
    background: 'rgba(99,102,241,0.2)',
    color: '#a5b4fc'
  },

  student: {
    background: 'rgba(16,185,129,0.2)',
    color: '#6ee7b7'
  },

  primaryBtn: {
    marginTop: 10,
    padding: 12,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: 'none',
    borderRadius: 10,
    color: 'white'
  },

  smallBtn: {
    padding: '6px 10px',
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: 6,
    color: 'white'
  },

  input: {
    width: '100%',
    padding: 12,
    marginTop: 10,
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: 8,
    color: 'white'
  },

  banner: {
    background: '#1e1b4b',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    display: 'flex',
    gap: 10,
    alignItems: 'center'
  },

  card: {
    background: '#111120',
    border: '1px solid #222',
    padding: 15,
    borderRadius: 10,
    marginTop: 10
  },

  badge: {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12
  }
}