import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { logout, getNotifications, getDashboard } from '../lib/api'

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function LogoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M2 12L12 2l10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 17L12 12l5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function StocksIcon() {
  return (
    <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function TradeIcon() {
  return (
    <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function LogIcon() {
  return (
    <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function TerminalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

const roleLabels = {
  exec_board: 'Exec Board',
  core: 'Core Team',
  junior: 'Junior Analyst',
}

export default function TopNav({ variant = 'app' }) {
  const { session, user } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [memberInfo, setMemberInfo] = useState(null)

  useEffect(() => {
    if (session) {
      getNotifications({ limit: 50 })
        .then(data => {
          const unread = (data.notifications || []).filter(n => !n.is_read).length
          setUnreadCount(unread)
        })
        .catch(() => { })

      getDashboard()
        .then(d => {
          if (d?.member && d?.team) {
            setMemberInfo({
              name: d.member.name,
              teamName: d.team.name,
              role: d.member.role,
            })
          }
        })
        .catch(() => { })
    }
  }, [session])

  // Close profile dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.user-profile-container')) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setProfileMenuOpen(false)
    try {
      await logout()
      navigate('/login')
    } catch (e) {
      console.error('Logout failed:', e)
    }
  }

  return (
    <>
      <header className="kite-header">
        <Link to={session ? '/dashboard' : '/public/dashboard'} className="logo">
          <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span className="logo-text">Econ Exchange</span>
        </Link>

        <nav className={`desktop-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {variant === 'public' || !session ? (
            <>
              <NavLink to="/public/dashboard" end onClick={() => setMobileMenuOpen(false)}>
                <DashboardIcon />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/public/trades" onClick={() => setMobileMenuOpen(false)}>
                <LogIcon />
                <span>Trade Log</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <DashboardIcon />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/stock" onClick={() => setMobileMenuOpen(false)}>
                <StocksIcon />
                <span>Stocks</span>
              </NavLink>
              <NavLink to="/trade/new" onClick={() => setMobileMenuOpen(false)}>
                <TradeIcon />
                <span>New Trade</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="header-right">
          {/* Terminal View Switcher Pill */}
          {variant === 'public' ? (
            session ? (
              <Link to="/dashboard" className="view-switcher-btn" title="Switch to Personal Trading Terminal">
                <TerminalIcon />
                <span>My Terminal</span>
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Member Login</Link>
            )
          ) : (
            <Link to="/public/dashboard" className="view-switcher-btn" title="View Public Leaderboard & Trades">
              <GlobeIcon />
              <span>Public View</span>
            </Link>
          )}

          {session && (
            <>
              <Link to="/notifications" className="notif-bell" title="Notifications">
                <BellIcon />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>

              {/* Profile Dropdown Container */}
              <div className="user-profile-container" style={{ position: 'relative' }}>
                <div
                  className="flex items-center gap-2"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  style={{ cursor: 'pointer', padding: '4px 2px' }}
                  title="Profile & Options"
                >
                  <div className="user-avatar-badge">
                    {(user?.email?.split('@')[0] || 'US').slice(0, 2).toUpperCase()}
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#666"
                    strokeWidth="2"
                    style={{
                      transform: profileMenuOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                {/* Profile Dropdown Card */}
                {profileMenuOpen && (
                  <div className="profile-dropdown-card">
                    <div className="profile-dropdown-header">
                      <div className="profile-user-name">{memberInfo?.name || user?.email?.split('@')[0]}</div>
                      <div className="profile-user-email">{user?.email}</div>
                      {memberInfo?.teamName && (
                        <div className="profile-team-badge">
                          <span className="profile-team-name">{memberInfo.teamName}</span>
                          <span className="profile-role-tag">{roleLabels[memberInfo.role] || memberInfo.role}</span>
                        </div>
                      )}
                    </div>
                    <div className="profile-dropdown-divider" />
                    <Link
                      to="/dashboard"
                      className="profile-dropdown-item"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <DashboardIcon />
                      <span>My Terminal</span>
                    </Link>
                    <Link
                      to="/notifications"
                      className="profile-dropdown-item"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <BellIcon />
                      <span>Notifications</span>
                    </Link>
                    <div className="profile-dropdown-divider" />
                    <button
                      type="button"
                      className="profile-dropdown-item text-loss"
                      onClick={handleLogout}
                      style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Zerodha Kite Mobile style) */}
      <div className="mobile-bottom-nav">
        {variant === 'public' || !session ? (
          <>
            <NavLink to="/public/dashboard" end className={({ isActive }) => (isActive ? 'active' : '')}>
              <DashboardIcon />
              <span>Leaderboard</span>
            </NavLink>
            <NavLink to="/public/trades" className={({ isActive }) => (isActive ? 'active' : '')}>
              <LogIcon />
              <span>Trade Log</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              <DashboardIcon />
              <span>Home</span>
            </NavLink>
            <NavLink to="/stock" className={({ isActive }) => (isActive ? 'active' : '')}>
              <StocksIcon />
              <span>Stocks</span>
            </NavLink>
            <NavLink to="/trade/new" className={({ isActive }) => (isActive ? 'active' : '')}>
              <TradeIcon />
              <span>Execute</span>
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="notif-badge" style={{ top: -4, right: -6, width: 8, height: 8, padding: 0 }} />
                )}
              </div>
              <span>Alerts</span>
            </NavLink>
          </>
        )}
      </div>
    </>
  )
}
