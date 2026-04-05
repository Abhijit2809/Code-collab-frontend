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

  // ✅ FIXED: getMySessions added to deps
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

  // ✅ FIXED: loadSessions added to deps
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

        {/* MENTOR VIEW */}
        {isMentor && (
          <>
            {newSession && (
              <div style={styles.inviteBanner}>
                <div>
                  <p style={{ margin: 0 }}>Session created!</p>
                  <p style={{ margin: 0 }}>
                    <strong>Code: {newSession.invite_code}</strong>
                  </p>
                </div>
                <button onClick={copyLink} style={styles.copyBtn}>
                  {copied ? '✓ Copied' : 'Copy Code'}
                </button>
                <button
                  onClick={() => navigate(`/session/${newSession.id}`)}
                  style={styles.copyBtn}
                >
                  Open →
                </button>
              </div>
            )}

            {!showForm ? (
              <button onClick={() => setShowForm(true)} style={styles.createBtn}>
                + Create session
              </button>
            ) : (
              <form onSubmit={handleCreate} style={{ marginTop: 20 }}>
                {formError && <p style={{ color: 'red' }}>{formError}</p>}
                <input
                  placeholder="Title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={styles.input}
                />
                <textarea
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={styles.input}
                />
                <button type="submit" style={styles.createBtn}>
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ ...styles.createBtn, background: '#333', marginLeft: 10 }}
                >
                  Cancel
                </button>
              </form>
            )}

            <h2 style={{ marginTop: 30 }}>Your Sessions</h2>
            {sessions.length === 0 ? (
              <p style={{ color: '#aaa' }}>
                No sessions yet. Create your first one above.
              </p>
            ) : (
              sessions.map(s => (
                <div key={s.id} style={styles.sessionCard}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>{s.title}</p>
                  {s.description && (
                    <p style={{ color: '#aaa', margin: '4px 0' }}>{s.description}</p>
                  )}
                  <p style={{ color: '#888', margin: '4px 0' }}>
                    Code: {s.invite_code}
                  </p>
                  <span style={statusStyle(s.status)}>{s.status}</span>
                  <button
                    onClick={() => navigate(`/session/${s.id}`)}
                    style={{ marginLeft: 10, padding: '4px 12px', cursor: 'pointer' }}
                  >
                    Open →
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* STUDENT VIEW */}
        {!isMentor && (
          <>
            <h2>Join a Session</h2>
            <form onSubmit={handleJoinRedirect} style={{ marginTop: 10 }}>
              <input
                placeholder="Enter invite code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.createBtn}>
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
    background: '#0f0f13',
    color: '#fff'
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #222'
  },
  topbarLeft: {
    display: 'flex',
    gap: 10,
    alignItems: 'center'
  },
  logo: { fontSize: 20 },
  brandName: { fontWeight: 'bold', fontSize: 18 },
  logoutBtn: {
    padding: '8px 16px',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  },
  content: {
    padding: '30px 20px',
    maxWidth: 800,
    margin: '0 auto'
  },
  hero: {
    display: 'flex',
    gap: 20,
    alignItems: 'center',
    background: '#18181f',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 0
  },
  welcome: { margin: 0, fontSize: 22 },
  welcomeSub: { margin: 0, color: '#aaa' },
  roleBadge: {
    marginLeft: 'auto',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    flexShrink: 0
  },
  mentorBadge: {
    background: 'rgba(99,102,241,0.2)',
    color: '#a5b4fc'
  },
  studentBadge: {
    background: 'rgba(16,185,129,0.2)',
    color: '#6ee7b7'
  },
  createBtn: {
    padding: '10px 20px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    marginTop: 10
  },
  copyBtn: {
    padding: '8px 14px',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  },
  input: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    background: '#18181f',
    color: 'white',
    border: '1px solid #333',
    borderRadius: 6,
    boxSizing: 'border-box'
  },
  inviteBanner: {
    background: '#1e1b4b',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    display: 'flex',
    gap: 10,
    alignItems: 'center'
  },
  sessionCard: {
    border: '1px solid #333',
    padding: 16,
    marginTop: 10,
    borderRadius: 8,
    background: '#18181f'
  },
  badge: {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12
  }
}