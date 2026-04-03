import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../hooks/useSession'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { createSession, getMySessions, loading } = useSession()

  const [sessions, setSessions]     = useState([])
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState({ title: '', description: '' })
  const [newSession, setNewSession] = useState(null)
  const [copied, setCopied]         = useState(false)
  const [joinCode, setJoinCode]     = useState('')
  const [formError, setFormError]   = useState('')

  const isMentor = user?.role === 'mentor'

  /* ✅ FIXED: wrap in useCallback */
  const loadSessions = useCallback(async () => {
    try {
      const data = await getMySessions()
      setSessions(data)
    } catch (error) {
      console.log(error)
    }
  }, [getMySessions])

  /* ✅ FIXED dependency */
  useEffect(() => {
    if (isMentor) {
      loadSessions()
    }
  }, [isMentor, loadSessions])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  /* ── Create session ── */
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
      setSessions(prev => [data.session, ...prev])

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

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <span style={styles.logo}>⌨</span>
          <span style={styles.brandName}>CodeCollab</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>
      </div>

      <div style={styles.content}>
        <div style={styles.hero}>
          <div style={styles.avatarCircle}>
            {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 style={styles.welcome}>Welcome, {user?.full_name?.split(' ')[0]}</h1>
            <p style={styles.welcomeSub}>{user?.email}</p>
          </div>
          <span style={{ ...styles.roleBadge, ...(isMentor ? styles.mentorBadge : styles.studentBadge) }}>
            {isMentor ? '👨‍🏫 Mentor' : '🎓 Student'}
          </span>
        </div>

        {isMentor && (
          <>
            {newSession && (
              <div style={styles.inviteBanner}>
                <div>
                  <p style={styles.inviteTitle}>Session created!</p>
                  <p style={styles.inviteCode}>
                    Invite link: <strong>{newSession.invite_link}</strong>
                  </p>
                </div>

                <button onClick={copyLink} style={styles.copyBtn}>
                  {copied ? '✓ Copied' : 'Copy link'}
                </button>

                <button
                  onClick={() => navigate(`/session/${newSession.session.id}`)}
                  style={styles.openBtn}
                >
                  Open session →
                </button>
              </div>
            )}

            {!showForm ? (
              <button onClick={() => setShowForm(true)} style={styles.createBtn}>
                + Create new session
              </button>
            ) : (
              <form onSubmit={handleCreate} style={styles.createForm}>
                <h3 style={styles.formTitle}>New session</h3>

                {formError && <p style={styles.formError}>{formError}</p>}

                <input
                  placeholder="Session title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={styles.input}
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ ...styles.input, height: 80 }}
                />

                <div style={styles.formBtns}>
                  <button type="submit" style={styles.submitBtn}>
                    {loading ? 'Creating...' : 'Create session'}
                  </button>

                  <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <h2 style={styles.sectionTitle}>Your sessions</h2>

            {sessions.length === 0 ? (
              <p style={styles.emptyText}>No sessions yet.</p>
            ) : (
              <div style={styles.sessionList}>
                {sessions.map(s => (
                  <div key={s.id} style={styles.sessionCard}>
                    <div>
                      <p style={styles.sessionTitle}>{s.title}</p>
                      <p style={styles.sessionDesc}>{s.description}</p>
                      <p style={styles.sessionCode}>Code: {s.invite_code}</p>
                    </div>

                    <div>
                      <span style={statusStyle(s.status)}>{s.status}</span>

                      <button
                        onClick={() => navigate(`/session/${s.id}`)}
                        style={styles.openSessionBtn}
                      >
                        Open →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!isMentor && (
          <>
            <h2 style={styles.sectionTitle}>Join a session</h2>

            <form onSubmit={handleJoinRedirect} style={styles.joinForm}>
              <input
                placeholder="Enter code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.submitBtn}>Join →</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}