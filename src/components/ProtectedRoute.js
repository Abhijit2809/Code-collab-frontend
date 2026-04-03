import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()   // 👈 ADD loading
  console.log("ProtectedRoute:", { user, loading })

  // ⏳ WAIT until auth state is restored
  if (loading) {
    return <div>Loading...</div>
  }

  // ❌ Only redirect AFTER loading finishes
  if (!user) {
    console.log("Redirecting: User is null ");
    
    return <Navigate to="/login" replace />
  }

  // 🔒 Role-based protection
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}