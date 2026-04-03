// src/pages/JoinSession.js  (NEW - Task 2)
// ─────────────────────────────────────────────────────
// Student lands here when they click the invite link.
// URL: /join/:invite_code
// Flow:
//   1. Auto-fetches session details from invite_code in URL
//   2. Shows session title + mentor name
//   3. Student clicks "Join" → calls POST /api/sessions/join/:code
//   4. On success → navigates to /session/:id (editor, Task 3)
// ─────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { useAuth } from '../context/AuthContext'

export default function JoinSession() {
  const { invite_code } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getSessionByCode, joinSession, loading, error } = useSession()

  const [session, setSession]   = useState(null)
  const [fetching, setFetching] = useState(true)
  const [joining, setJoining]   = useState(false)
  const [joinError, setJoinError] = useState('')

  // Fetch session details on load
  useEffect(() => {
    getSessionByCode(invite_code)
      .then(setSession)
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [invite_code])

  async function handleJoin() {
    setJoining(true)
    setJoinError('')
    try {
      const joined = await joinSession(invite_code)
      navigate(`/session/${joined.id}`)
    } catch (err) {
      setJoinError(err.message)
    } finally {
      setJoining(false)
    }
  }

  // ── Loading state ─────────────────────────────────
  if (fetching) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Looking up session...</p>
        </div>
      </div>
    )
  }

  // ── Not found ─────────────────────────────────────
  if (!session) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.icon}>🔗</div>
          <h2 style={styles.title}>Invalid invite link</h2>
          <p style={styles.subtitle}>
            This session doesn't exist or the link has expired.
          </p>
          <button onClick={() => navigate('/dashboard')} style={styles.btn}>
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Session ended ────────────────────────────────
  if (session.status === 'ended') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.icon}>🔒</div>
          <h2 style={styles.title}>Session ended</h2>
          <p style={styles.subtitle}>This session is no longer active.</p>
          <button onClick={() => navigate('/dashboard')} style={styles.btn}>
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Ready to join ─────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>⌨</span>
          <span style={styles.logoText}>CodeCollab</span>
        </div>

        {/* Status */}
        <span style={session.status === 'active' ? styles.activeBadge : styles.waitingBadge}>
          {session.status === 'active' ? '● Live' : '◌ Waiting to start'}
        </span>

        {/* Session info */}
        <h2 style={styles.title}>{session.title}</h2>
        {session.description && (
          <p style={styles.desc}>{session.description}</p>
        )}

        <div style={styles.mentorRow}>
          <div style={styles.mentorAvatar}>
            {session.profiles?.full_name?.charAt(0)?.toUpperCase() || 'M'}
          </div>
          <div>
            <p style={styles.mentorLabel}>Hosted by</p>
            <p style={styles.mentorName}>{session.profiles?.full_name || 'Your mentor'}</p>
          </div>
        </div>

        {/* Logged in as */}
        <div style={styles.youRow}>
          <span style={styles.youLabel}>Joining as</span>
          <span style={styles.youEmail}>{user?.email}</span>
          <span style={styles.studentTag}>🎓 Student</span>
        </div>

        {/* Errors */}
        {(joinError || error) && (
          <div style={styles.errorBox}>{joinError || error}</div>
        )}

        {/* Join button */}
        <button onClick={handleJoin} style={styles.joinBtn} disabled={joining || loading}>
          {joining ? 'Joining...' : 'Join session →'}
        </button>

        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          Back to dashboard
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: 24 },
  card: { background: '#18181f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  logoIcon: { fontSize: 22 },
  logoText: { color: '#e2e8f0', fontWeight: 700, fontSize: 17 },
  activeBadge: { padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' },
  waitingBadge: { padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(234,179,8,0.12)', color: '#fde047' },
  icon: { fontSize: 40, marginBottom: 4 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' },
  subtitle: { margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.6 },
  desc: { margin: 0, color: '#94a3b8', fontSize: 14, lineHeight: 1.6 },
  mentorRow: { display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', width: '100%', textAlign: 'left' },
  mentorAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 },
  mentorLabel: { margin: '0 0 2px', color: '#64748b', fontSize: 11 },
  mentorName: { margin: 0, color: '#e2e8f0', fontSize: 14, fontWeight: 600 },
  youRow: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 16px', width: '100%', flexWrap: 'wrap' },
  youLabel: { color: '#64748b', fontSize: 12 },
  youEmail: { color: '#a5b4fc', fontSize: 13, flex: 1 },
  studentTag: { fontSize: 12, color: '#6ee7b7' },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13, width: '100%' },
  joinBtn: { width: '100%', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  backBtn: { background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', padding: 0 },
  btn: { background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  spinner: { width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  loadingText: { color: '#64748b', fontSize: 14, margin: 0 },
}
