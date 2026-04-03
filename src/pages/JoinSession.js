import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { useAuth } from '../context/AuthContext'

export default function JoinSession() {
  const { invite_code } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getSessionByCode, joinSession, loading, error } = useSession()

  const [session, setSession]     = useState(null)
  const [fetching, setFetching]   = useState(true)
  const [joining, setJoining]     = useState(false)
  const [joinError, setJoinError] = useState('')

  /* ✅ FIX: wrap in useCallback */
  const fetchSession = useCallback(async () => {
    try {
      const data = await getSessionByCode(invite_code)
      setSession(data)
    } catch (error) {
      console.log(error)
    } finally {
      setFetching(false)
    }
  }, [invite_code, getSessionByCode])

  /* ✅ FIX: proper dependency */
  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  async function handleJoin() {
    setJoining(true)
    setJoinError('')

    try {
      const joined = await joinSession(invite_code)
      navigate(`/session/${joined.id}`)
    } catch (error) {
      console.log(error)
      setJoinError(error.message)
    } finally {
      setJoining(false)
    }
  }

  /* ───────── LOADING ───────── */
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

  /* ───────── NOT FOUND ───────── */
  if (!session) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.icon}>🔗</div>
          <h2 style={styles.title}>Invalid invite link</h2>
          <button onClick={() => navigate('/dashboard')} style={styles.btn}>
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  /* ───────── ENDED ───────── */
  if (session.status === 'ended') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.icon}>🔒</div>
          <h2 style={styles.title}>Session ended</h2>
          <button onClick={() => navigate('/dashboard')} style={styles.btn}>
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  /* ───────── MAIN UI ───────── */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>{session.title}</h2>

        {session.description && (
          <p style={styles.desc}>{session.description}</p>
        )}

        <p style={styles.subtitle}>
          Hosted by {session.profiles?.full_name || 'Mentor'}
        </p>

        <p style={styles.subtitle}>
          Joining as: {user?.email}
        </p>

        {(joinError || error) && (
          <div style={styles.errorBox}>{joinError || error}</div>
        )}

        <button
          onClick={handleJoin}
          style={styles.joinBtn}
          disabled={joining || loading}
        >
          {joining ? 'Joining...' : 'Join session →'}
        </button>

        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          Back
        </button>
      </div>
    </div>
  )
}

/* ───────── STYLES ───────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f0f13',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    background: '#18181f',
    padding: 30,
    borderRadius: 12,
    width: 400,
    textAlign: 'center'
  },
  title: { color: '#fff' },
  subtitle: { color: '#aaa' },
  desc: { color: '#ccc' },
  joinBtn: {
    marginTop: 10,
    padding: 10,
    width: '100%',
    background: '#6366f1',
    color: '#fff',
    border: 'none'
  },
  backBtn: {
    marginTop: 10,
    background: 'none',
    border: 'none',
    color: '#aaa'
  },
  btn: {
    marginTop: 10,
    padding: 10,
    background: '#6366f1',
    color: '#fff',
    border: 'none'
  },
  errorBox: {
    color: 'red',
    marginTop: 10
  },
  spinner: {
    width: 30,
    height: 30,
    border: '3px solid #444',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: { color: '#aaa' },
  icon: { fontSize: 30 }
}