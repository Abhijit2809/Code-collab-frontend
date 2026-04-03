// src/pages/SessionRoom.js

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'

import { SocketProvider, useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../hooks/useSession'
import api from '../utils/api'

import ChatPanel from '../components/ChatPanel'
import VideoCall from '../components/VideoCall'

/* ───────── WRAPPER ───────── */
export default function SessionRoomWrapper() {
  const { session_id } = useParams()

  return (
    <SocketProvider sessionId={session_id}>
      <SessionRoom sessionId={session_id} />
    </SocketProvider>
  )
}

/* ───────── MAIN ───────── */
function SessionRoom({ sessionId }) {
  const navigate = useNavigate()
  const socket = useSocket()

  const { user } = useAuth()
  const { startSession, endSession } = useSession()

  const editorRef = useRef(null)
  const updatingRef = useRef(false)
  const lastEmitRef = useRef(0)

  const [session, setSession] = useState(null)
  const [users, setUsers] = useState([])

  /* ✅ FIXED: removed setLanguage */
  const [language] = useState('javascript')

  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const isMentor = user?.role === 'mentor'

  /* ───────── FETCH SESSION ───────── */
  useEffect(() => {
    api.get(`/api/sessions/by-id/${sessionId}`)
      .then(res => setSession(res.data))
      .catch((err) => {
        console.log(err)
        setError('Could not load session')
      })
      .finally(() => setFetching(false))
  }, [sessionId])

  /* ───────── SOCKET EVENTS ───────── */
  useEffect(() => {
    if (!socket) return

    socket.on('session-ended', () => {
      alert("⏰ Session ended")
      navigate('/dashboard')
    })

    socket.on('user-joined', ({ username }) => {
      setUsers(prev => [...prev, { username }])
    })

    socket.on('user-left', ({ username }) => {
      setUsers(prev => prev.filter(u => u.username !== username))
    })

    return () => {
      socket.off('session-ended')
      socket.off('user-joined')
      socket.off('user-left')
    }

  }, [socket, navigate])

  /* ───────── EDITOR ───────── */
  const handleEditorMount = (editor) => {
    editorRef.current = editor
  }

  const handleEditorChange = () => {
    if (!editorRef.current || updatingRef.current) return

    const code = editorRef.current.getValue()
    const now = Date.now()

    if (now - lastEmitRef.current > 150) {
      lastEmitRef.current = now

      socket?.emit('code-change', {
        sessionId,
        code
      })
    }
  }

  /* ───────── RECEIVE CODE ───────── */
  useEffect(() => {
    if (!socket) return

    socket.on('code-update', (incomingCode) => {
      updatingRef.current = true

      if (editorRef.current && incomingCode !== editorRef.current.getValue()) {
        editorRef.current.setValue(incomingCode)
      }

      setTimeout(() => {
        updatingRef.current = false
      }, 50)
    })

    return () => socket.off('code-update')
  }, [socket])

  /* ───────── SESSION CONTROL ───────── */
  async function handleStart() {
    try {
      const updated = await startSession(sessionId)
      setSession(updated)
    } catch (err) {
      console.log(err)
      setError(err.message)
    }
  }

  async function handleEnd() {
    if (!window.confirm('End this session?')) return

    try {
      const updated = await endSession(sessionId)
      setSession(updated)
    } catch (err) {
      console.log(err)
      setError(err.message)
    }
  }

  /* ───────── STATES ───────── */
  if (fetching) return <div style={styles.center}>Loading...</div>

  if (!session) {
    return (
      <div style={styles.center}>
        <p style={{ color: '#f87171' }}>Session not found.</p>
        <button onClick={() => navigate('/dashboard')} style={styles.btn}>
          ← Dashboard
        </button>
      </div>
    )
  }

  const statusColor =
    session.status === 'active' ? '#22c55e' :
    session.status === 'waiting' ? '#facc15' :
    '#94a3b8'

  /* ───────── UI ───────── */
  return (
    <div style={styles.page}>

      {/* TOP BAR */}
      <div style={styles.topbar}>
        <div style={styles.left}>
          <button onClick={() => navigate('/dashboard')}>←</button>
          <span>{session.title}</span>
          <span style={{ color: statusColor }}>● {session.status}</span>
        </div>

        <div>
          {isMentor && session.status === 'waiting' && (
            <button onClick={handleStart}>Start</button>
          )}
          {isMentor && session.status === 'active' && (
            <button onClick={handleEnd}>End</button>
          )}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* MAIN */}
      <div style={styles.main}>

        {/* EDITOR */}
        <div style={styles.editor}>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            onMount={handleEditorMount}
            onChange={handleEditorChange}
          />
        </div>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>

          <div style={styles.videoBox}>
            <VideoCall sessionId={sessionId} />
          </div>

          <div style={styles.users}>
            <p>👥 Users ({users.length})</p>

            {users.map((u, i) => (
              <div key={i}>
                {u.username} {u.username === user?.email && '(You)'}
              </div>
            ))}
          </div>

          <div style={styles.chat}>
            <ChatPanel sessionId={sessionId} />
          </div>

        </div>
      </div>
    </div>
  )
}

/* ───────── STYLES ───────── */
const styles = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', color: '#fff' },
  topbar: { display: 'flex', justifyContent: 'space-between', padding: 10, borderBottom: '1px solid #1e293b' },
  left: { display: 'flex', gap: 10, alignItems: 'center' },
  error: { background: '#7f1d1d', padding: 8 },
  main: { display: 'flex', flex: 1 },
  editor: { flex: 3 },
  sidebar: { width: 380, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #1e293b' },
  videoBox: { height: 220 },
  users: { padding: 10, borderBottom: '1px solid #1e293b' },
  chat: { flex: 1 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  btn: { padding: 10 }
}