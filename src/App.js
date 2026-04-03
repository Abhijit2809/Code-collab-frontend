// src/App.js

import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SocketProvider } from './context/SocketContext'

import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import JoinSession from './pages/JoinSession'
import SessionRoom from './pages/SessionRoom'

import './App.css'

/* ✅ WRAPPER FOR SOCKET (VERY IMPORTANT) */
const WrappedSessionRoom = () => {
  const { session_id } = useParams()

  return (
    <SocketProvider sessionId={session_id}>
      <SessionRoom />
    </SocketProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public Routes ───────────────────────── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* ── Protected Routes ───────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/join/:invite_code"
            element={
              <ProtectedRoute>
                <JoinSession />
              </ProtectedRoute>
            }
          />

          {/* 🔥 FIXED SESSION ROUTE */}
          <Route
            path="/session/:session_id"
            element={
              <ProtectedRoute>
                <WrappedSessionRoom />
              </ProtectedRoute>
            }
          />

          {/* ── Fallback ───────────────────────────── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}