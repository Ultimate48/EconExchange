import { Routes, Route, Navigate } from 'react-router-dom'
import PublicDashboard from './pages/PublicDashboard'
import PublicTrades from './pages/PublicTrades'
import Login from './pages/Login'
import MemberDashboard from './pages/MemberDashboard'
import StockDetail from './pages/StockDetail'
import NewTrade from './pages/NewTrade'
import Notifications from './pages/Notifications'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      {/* Public routes (Dedicated /public namespace) */}
      <Route path="/public/dashboard" element={<PublicDashboard />} />
      <Route path="/public/trades" element={<PublicTrades />} />

      {/* Legacy redirects for backwards compatibility */}
      <Route path="/" element={<Navigate to="/public/dashboard" replace />} />
      <Route path="/public" element={<Navigate to="/public/dashboard" replace />} />
      <Route path="/trades" element={<Navigate to="/public/trades" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated Member routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MemberDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock"
        element={
          <ProtectedRoute>
            <StockDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock/:ticker"
        element={
          <ProtectedRoute>
            <StockDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trade/new"
        element={
          <ProtectedRoute>
            <NewTrade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/public/dashboard" replace />} />
    </Routes>
  )
}
