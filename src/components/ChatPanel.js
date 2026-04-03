import React, { useState, useEffect, useRef } from 'react'
import { FaPaperPlane } from 'react-icons/fa'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

const ChatPanel = ({ sessionId }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const { user } = useAuth()
  const socket = useSocket()
  const messagesEndRef = useRef(null)

  /* ───────── LOAD OLD MESSAGES ───────── */
  useEffect(() => {
    if (!sessionId) return

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/chat/session/${sessionId}`)
        setMessages(res.data || [])
      } catch (err) {
        console.error('❌ Chat load error:', err)
      }
    }

    fetchMessages()
  }, [sessionId])

  /* ───────── SOCKET EVENTS ───────── */
  useEffect(() => {
    if (!socket) return

    const handleMessage = (message) => {
      setMessages(prev => [...prev, message])
    }

    const handleUserJoined = ({ username }) => {
      setMessages(prev => [
        ...prev,
        { message: `${username} joined`, system: true }
      ])
    }

    const handleUserLeft = ({ username }) => {
      setMessages(prev => [
        ...prev,
        { message: `${username} left`, system: true }
      ])
    }

    socket.on('chat-message', handleMessage)
    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)

    return () => {
      socket.off('chat-message', handleMessage)
      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
    }

  }, [socket])

  /* ───────── AUTO SCROLL ───────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ───────── SEND MESSAGE ───────── */
  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !user) return

    socket.emit('chat-message', {
      sessionId,
      message: newMessage
    })

    setNewMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  /* ───────── UI ───────── */
  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        💬 Live Chat
      </div>

      {/* MESSAGES */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>Start the conversation 🚀</div>
        )}

        {messages.map((msg, i) => {

          /* 🔥 SYSTEM MESSAGE */
          if (msg.system) {
            return (
              <div key={i} style={styles.systemMsg}>
                {msg.message}
              </div>
            )
          }

          const isMe = msg.username === user?.email

          return (
            <div
              key={msg.id || i}
              style={{
                ...styles.row,
                justifyContent: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  background: isMe
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : '#1e293b'
                }}
              >
                <div style={styles.username}>
                  {isMe ? 'You' : msg.username}
                </div>

                <div style={styles.text}>
                  {msg.message}
                </div>

                <div style={styles.time}>
                  {msg.created_at
                    ? new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : ''}
                </div>
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={styles.inputBox}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.send}>
          <FaPaperPlane />
        </button>
      </div>

    </div>
  )
}

export default ChatPanel


/* ───────────────────────── */
/* 🎨 STYLES (FIXED ERROR) */
/* ───────────────────────── */

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#020617',
    borderLeft: '1px solid #1e293b'
  },

  header: {
    padding: '14px',
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: '1px solid #1e293b',
    color: '#e2e8f0'
  },

  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px'
  },

  empty: {
    textAlign: 'center',
    marginTop: '40px',
    color: '#64748b'
  },

  row: {
    display: 'flex',
    marginBottom: '14px'
  },

  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '18px',
    color: '#fff',
    boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
  },

  username: {
    fontSize: '11px',
    color: '#cbd5f5',
    marginBottom: '4px'
  },

  text: {
    fontSize: '14px',
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },

  time: {
    fontSize: '11px',
    marginTop: '6px',
    color: '#94a3b8',
    textAlign: 'right'
  },

  systemMsg: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '10px',
    opacity: 0.8
  },

  inputBox: {
    display: 'flex',
    padding: '12px',
    borderTop: '1px solid #1e293b'
  },

  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    background: '#0f172a',
    color: '#fff',
    outline: 'none'
  },

  send: {
    marginLeft: '10px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    cursor: 'pointer'
  }
}