import { useState, useEffect } from 'react'
import TopNav from '../components/TopNav'
import { getDashboard } from '../lib/api'
import { supabase } from '../lib/supabase'

const ROLE_CONFIG = {
  exec_board: {
    label: 'Executive Board',
    order: 0,
    color: '#e65100',
    bg: '#fff3e0',
  },
  core: {
    label: 'Core Team',
    order: 1,
    color: '#1565c0',
    bg: '#e3f2fd',
  },
  member: {
    label: 'Member',
    order: 2,
    color: '#2e7d32',
    bg: '#e8f5e9',
  },
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function TeamPage() {
  const [myInfo, setMyInfo] = useState(null)  // { name, role, team_id, team_name }
  const [teammates, setTeammates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        // 1. Get current member's team_id from dashboard
        const dash = await getDashboard()
        if (!dash?.member?.team_id && !dash?.team?.id) throw new Error('Team not found')
        const teamId = dash?.team?.id || dash?.member?.team_id
        const teamName = dash?.team?.name || ''

        setMyInfo({
          id: dash.member.id,
          name: dash.member.name,
          role: dash.member.role,
          team_id: teamId,
          team_name: teamName,
        })

        // 2. Fetch all members of the same team
        const { data, error: membersErr } = await supabase
          .from('members')
          .select('id, name, role, team_id')
          .eq('team_id', teamId)
          .order('name')

        if (membersErr) throw membersErr
        setTeammates(data || [])
      } catch (err) {
        setError(err.message || 'Failed to load team')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Group by role, ordered exec → core → junior
  const grouped = Object.entries(ROLE_CONFIG)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([roleKey, cfg]) => ({
      roleKey,
      cfg,
      members: teammates.filter(m => m.role === roleKey),
    }))
    .filter(g => g.members.length > 0)

  return (
    <>
      <TopNav />
      <div className="kite-main" style={{ paddingTop: 68, maxWidth: 900, margin: '0 auto', padding: '84px 20px 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="page-title" style={{ marginBottom: 4 }}>
            {myInfo?.team_name || 'My Team'}
          </div>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Your teammates and their roles within the club.
          </p>
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}
        {error && <div className="login-error">{error}</div>}

        {!loading && !error && (
          <>
            {/* My own card highlighted */}
            {myInfo && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  You
                </div>
                <div
                  className="kite-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    border: '2px solid #e65100',
                    maxWidth: 360,
                  }}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#fff3e0',
                    color: '#e65100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {getInitials(myInfo.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1a202c' }}>{myInfo.name}</div>
                    <div style={{
                      display: 'inline-block',
                      marginTop: 5,
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: (ROLE_CONFIG[myInfo.role] || ROLE_CONFIG.junior).bg,
                      color: (ROLE_CONFIG[myInfo.role] || ROLE_CONFIG.junior).color,
                      fontWeight: 600,
                    }}>
                      {(ROLE_CONFIG[myInfo.role] || ROLE_CONFIG.junior).label}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Teammates grouped by role */}
            {grouped.map(({ roleKey, cfg, members: roleMembers }) => (
              <div key={roleKey} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 4, height: 18, borderRadius: 2, background: cfg.color }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1a202c' }}>{cfg.label}</span>
                  <span style={{
                    fontSize: 12,
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: cfg.bg,
                    color: cfg.color,
                    fontWeight: 500,
                  }}>
                    {roleMembers.length}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 10,
                }}>
                  {roleMembers.map(m => {
                    const isMe = m.id === myInfo?.id
                    return (
                      <div
                        key={m.id}
                        className="kite-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          opacity: isMe ? 0.5 : 1,  // dim self (shown above)
                        }}
                      >
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: cfg.bg,
                          color: cfg.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {getInitials(m.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: '#1a202c',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {m.name} {isMe && <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 12 }}>(you)</span>}
                          </div>
                          <div style={{
                            display: 'inline-block',
                            marginTop: 3,
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: cfg.bg,
                            color: cfg.color,
                            fontWeight: 500,
                          }}>
                            {cfg.label}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {teammates.length === 0 && (
              <div className="empty-state">No teammates found in your team.</div>
            )}
          </>
        )}
      </div>
    </>
  )
}
