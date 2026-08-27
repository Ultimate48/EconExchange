import { useState, useEffect } from 'react'
import TopNav from '../components/TopNav'
import { getNotifications, markNotificationRead } from '../lib/api'
import { timeAgo, formatTimestamp } from '../lib/format'

function EventIcon({ type }) {
  if (type === 'trade_approved') {
    return (
      <div className="notif-badge-icon" style={{ background: '#ECFDF5', color: '#10B981', borderColor: '#A7F3D0' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    )
  }
  if (type === 'trade_rejected') {
    return (
      <div className="notif-badge-icon" style={{ background: '#FEF2F2', color: '#EF4444', borderColor: '#FCA5A5' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    )
  }
  if (type === 'trade_requested') {
    return (
      <div className="notif-badge-icon" style={{ background: '#FEF3C7', color: '#D97706', borderColor: '#FDE68A' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
    )
  }
  return (
    <div className="notif-badge-icon" style={{ background: '#EFF6FF', color: '#2575FC', borderColor: '#BFDBFE' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    </div>
  )
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  function loadNotifs() {
    setLoading(true)
    getNotifications({ limit: 50 })
      .then(res => {
        setNotifications(res.notifications || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadNotifs()
  }, [])

  async function handleDismiss(id) {
    try {
      await markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (e) {
      console.error('Failed to mark read:', e)
    }
  }

  async function handleMarkAllRead() {
    const unread = notifications.filter(n => !n.is_read)
    for (const n of unread) {
      try {
        await markNotificationRead(n.id)
      } catch (e) {}
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    return true
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <>
      <TopNav />
      <div className="public-main" style={{ paddingTop: 68 }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {/* Header Bar */}
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <div>
              <h1 className="page-title" style={{ marginBottom: 2 }}>Notifications</h1>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleMarkAllRead}
                >
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadNotifs}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'all' ? 'btn-blue' : 'btn-ghost'}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'unread' ? 'btn-blue' : 'btn-ghost'}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="kite-card">
              {filteredNotifs.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                  No notifications to display
                </div>
              ) : (
                filteredNotifs.map(n => (
                  <div key={n.id} className={`notif-card-item ${!n.is_read ? 'unread' : ''}`}>
                    <EventIcon type={n.type} />
                    
                    <div className="notif-content">
                      <div className="notif-text">{n.message}</div>
                      <div className="notif-time-ago" title={formatTimestamp(n.created_at)}>
                        {timeAgo(n.created_at)}
                      </div>
                    </div>

                    {!n.is_read ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm notif-read-btn"
                        onClick={() => handleDismiss(n.id)}
                        title="Mark as read"
                      >
                        <span className="unread-dot" /> Mark read
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Read</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
