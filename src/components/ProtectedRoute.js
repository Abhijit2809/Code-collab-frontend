import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  // ✅ Wait for auth to load before deciding
  if (loading) {
    return <div style={{ color: 'white', padding: 20 }}>Loading...</div>
  }

  // ❌ Not authenticated
  if (!user) {
    return <Navigate to="/login" />
  }

  // 🔒 Role-based protection
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />
  }

  return children
}