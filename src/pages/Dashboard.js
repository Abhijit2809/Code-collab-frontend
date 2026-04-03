// src/pages/Dashboard.js  (UPDATED for Task 2)
// ─────────────────────────────────────────────────────
// Changes from Task 1:
//   Mentor sees:  Create Session form + their session list
//   Student sees: Join session input + recent sessions
// Task 1 welcome header/role badge kept exactly as-is.
// ─────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../hooks/useSession'
import api from '../utils/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { createSession, getMySessions, loading, error } = useSession()

  const [sessions, setSessions]         = useState([])
  const [showForm, setShowForm]         = useState(false)
  const [form, setForm]                 = useState({ title: '', description: '' })
  const [newSession, setNewSession]     = useState(null)   // freshly created session
  const [copied, setCopied]             = useState(false)
  const [joinCode, setJoinCode]         = useState('')
  const [formError, setFormError]       = useState('')

  const isMentor = user?.role === 'mentor'

  // Load sessions on mount
  useEffect(() => {
    if (isMentor) {
      getMySessions().then(setSessions).catch(() => {})
    }
  }, [isMentor])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // ── Create session (mentor) ─────────────────────────
  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    if (!form.title.trim()) return setFormError('Title is required')
    try {
      const data = await createSession(form)
      setNewSession(data)                          // shows invite link
      setShowForm(false)
      setForm({ title: '', description: '' })
      setSessions(prev => [data.session, ...prev]) // add to list immediately
    } catch (err) {
      setFormError(err.message)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(newSession.invite_link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Join session (student) ──────────────────────────
  function handleJoinRedirect(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    // Extract code from full URL or use raw code
    const code = joinCode.trim().split('/').pop()
    navigate(`/join/${code}`)
  }

  // ── Status badge color ──────────────────────────────
  function statusStyle(status) {
    if (status === 'active')  return { ...styles.badge, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }
    if (status === 'waiting') return { ...styles.badge, background: 'rgba(234,179,8,0.15)',  color: '#fde047' }
    return { ...styles.badge, background: 'rgba(100,116,139,0.15)', color: '#94a3b8' }
  }

  return (
    <div style={styles.page}>
      {/* ── Topbar (same as Task 1) ── */}
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <span style={styles.logo}>⌨</span>
          <span style={styles.brandName}>CodeCollab</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>
      </div>

      <div style={styles.content}>
        {/* ── Welcome hero (same as Task 1) ── */}
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

        {/* ════════════════════════════════════════════ */}
        {/*  MENTOR SECTION                             */}
        {/* ════════════════════════════════════════════ */}
        {isMentor && (
          <>
            {/* New session invite banner */}
            {newSession && (
              <div style={styles.inviteBanner}>
                <div>
                  <p style={styles.inviteTitle}>Session created!</p>
                  <p style={styles.inviteCode}>Invite link: <strong>{newSession.invite_link}</strong></p>
                </div>
                <button onClick={copyLink} style={styles.copyBtn}>
                  {copied ? '✓ Copied' : 'Copy link'}
                </button>
                <button onClick={() => navigate(`/session/${newSession.session.id}`)} style={styles.openBtn}>
                  Open session →
                </button>
              </div>
            )}

            {/* Create session button / form */}
            {!showForm ? (
              <button onClick={() => setShowForm(true)} style={styles.createBtn}>
                + Create new session
              </button>
            ) : (
              <form onSubmit={handleCreate} style={styles.createForm}>
                <h3 style={styles.formTitle}>New session</h3>
                {formError && <p style={styles.formError}>{formError}</p>}
                <input
                  placeholder="Session title e.g. React Hooks Deep Dive"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={styles.input}
                />
                <textarea
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ ...styles.input, height: 80, resize: 'vertical' }}
                />
                <div style={styles.formBtns}>
                  <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading ? 'Creating...' : 'Create session'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Sessions list */}
            <h2 style={styles.sectionTitle}>Your sessions</h2>
            {sessions.length === 0 ? (
              <p style={styles.emptyText}>No sessions yet. Create your first one above.</p>
            ) : (
              <div style={styles.sessionList}>
                {sessions.map(s => (
                  <div key={s.id} style={styles.sessionCard}>
                    <div style={styles.sessionLeft}>
                      <p style={styles.sessionTitle}>{s.title}</p>
                      <p style={styles.sessionDesc}>{s.description || 'No description'}</p>
                      <p style={styles.sessionCode}>
                        Code: <code style={styles.code}>{s.invite_code}</code>
                      </p>
                    </div>
                    <div style={styles.sessionRight}>
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

        {/* ════════════════════════════════════════════ */}
        {/*  STUDENT SECTION                            */}
        {/* ════════════════════════════════════════════ */}
        {!isMentor && (
          <>
            <h2 style={styles.sectionTitle}>Join a session</h2>
            <form onSubmit={handleJoinRedirect} style={styles.joinForm}>
              <input
                placeholder="Paste invite link or enter 8-character code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
              <button type="submit" style={styles.submitBtn}>
                Join →
              </button>
            </form>
            <p style={styles.emptyText}>Ask your mentor to share their invite link.</p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────
const styles = {
  page: { minHeight: '100vh', background: '#0f0f13', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: '#f1f5f9' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#18181f' },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: { fontSize: 22 },
  brandName: { color: '#e2e8f0', fontWeight: 700, fontSize: 17 },
  logoutBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '7px 16px', fontSize: 14, cursor: 'pointer' },
  content: { maxWidth: 900, margin: '0 auto', padding: '40px 24px' },
  hero: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: '24px 28px', background: '#18181f', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' },
  avatarCircle: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 },
  welcome: { margin: 0, fontSize: 19, fontWeight: 700 },
  welcomeSub: { margin: '4px 0 0', color: '#64748b', fontSize: 13 },
  roleBadge: { marginLeft: 'auto', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  mentorBadge: { background: 'rgba(99,102,241,0.18)', color: '#a5b4fc' },
  studentBadge: { background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' },
  inviteBanner: { display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, flexWrap: 'wrap' },
  inviteTitle: { margin: '0 0 4px', fontWeight: 600, color: '#6ee7b7', fontSize: 14 },
  inviteCode: { margin: 0, color: '#94a3b8', fontSize: 13, wordBreak: 'break-all' },
  copyBtn: { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' },
  openBtn: { background: '#6366f1', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' },
  createBtn: { display: 'block', width: '100%', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 28 },
  createForm: { background: '#18181f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '24px', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 },
  formTitle: { margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' },
  formError: { margin: 0, color: '#f87171', fontSize: 13 },
  input: { background: '#0f0f16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', width: '100%' },
  formBtns: { display: 'flex', gap: 10 },
  submitBtn: { background: '#6366f1', border: 'none', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' },
  sectionTitle: { fontSize: 17, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' },
  emptyText: { color: '#64748b', fontSize: 14, margin: '8px 0 0' },
  sessionList: { display: 'flex', flexDirection: 'column', gap: 12 },
  sessionCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#18181f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px', gap: 16 },
  sessionLeft: { flex: 1 },
  sessionTitle: { margin: '0 0 4px', fontWeight: 600, fontSize: 15, color: '#e2e8f0' },
  sessionDesc: { margin: '0 0 6px', color: '#64748b', fontSize: 13 },
  sessionCode: { margin: 0, color: '#64748b', fontSize: 12 },
  code: { background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', color: '#a5b4fc' },
  sessionRight: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  openSessionBtn: { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' },
  joinForm: { display: 'flex', gap: 12, marginBottom: 12 },
}
