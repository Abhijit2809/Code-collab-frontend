// src/context/SocketContext.js

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children, sessionId }) => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!sessionId) return

    const token = localStorage.getItem('access_token')

    if (!token) {
      console.log("❌ No token found")
      return
    }

    console.log("🚀 Creating socket connection...")

    const newSocket = io('http://localhost:4000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'] // 🔥 more stable
    })

    /* ───────── CONNECT ───────── */
    newSocket.on('connect', () => {
      console.log("✅ Connected:", newSocket.id)

      newSocket.emit('join-room', { sessionId })
    })

    /* ───────── DISCONNECT ───────── */
    newSocket.on('disconnect', (reason) => {
      console.log("❌ Disconnected:", reason)
    })

    /* ───────── RECONNECT ───────── */
    newSocket.on('reconnect', (attempt) => {
      console.log("🔄 Reconnected after", attempt, "attempts")

      newSocket.emit('join-room', { sessionId })
    })

    /* ───────── ERROR HANDLING ───────── */
    newSocket.on('connect_error', (err) => {
      console.log("❌ Socket error:", err.message)
    })

    setSocket(newSocket)

    /* ───────── CLEANUP ───────── */
    return () => {
      console.log("🧹 Cleaning socket...")
      newSocket.disconnect()
    }

  }, [sessionId])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}