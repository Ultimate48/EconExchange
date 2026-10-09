import { useState, useEffect } from 'react'
import TopNav from '../components/TopNav'
import { supabase } from '../lib/supabase'

const ROLE_CONFIG = {
  exec_board: {
    label: 'Executive Board',
    order: 0,
    color: '#e65100',
    bg: '#fff3e0',
    badge: '#e65100',
  },
  core: {
    label: 'Core Team',
    order: 1,
    color: '#1565c0',
    bg: '#e3f2fd',
    badge: '#1565c0',
  },
  junior: {
    label: 'Members',
    order: 2,
    color: '#2e7d32',
    bg: '#e8f5e9',
    badge: '#2e7d32',
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

function AvatarIcon({ name, role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.junior
  return (
    <div style={{
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: cfg.bg,
      color: cfg.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      fontWeight: 700,
      border: `2px solid ${cfg.color}22`,
      flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  )
}

export default function PublicTeam() {
  const [members, setMembers] = useState([])
  const [teams, setTeams] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [membersRes, teamsRes] = await Promise.all([
          supabase.from('members').select('id, name, role, team_id').order('name'),
          supabase.from('teams').select('id, name'),
        ])
        if (membersRes.error) throw membersRes.error
        if (teamsRes.error) throw teamsRes.error

        const teamMap = {}
        for (const t of teamsRes.data || []) teamMap[t.id] = t.name
        setTeams(teamMap)
        setMembers(membersRes.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load team members')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Group members by role, ordered exec → core → junior
  const grouped = Object.entries(ROLE_CONFIG)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([roleKey, cfg]) => ({
      roleKey,
      cfg,
      members: members.filter(m => m.role === roleKey),
    }))
    .filter(g => g.members.length > 0)

  return (
    <>
      <TopNav variant="public" />
      <div className="public-main" style={{ paddingTop: 68 }}>
        <div className="page-title">Our Team</div>
        <p style={{ color: '#666', marginBottom: 32, fontSize: 14 }}>
          Meet the people behind Econ Exchange.
        </p>

        {loading && <div className="loading-center"><div className="spinner" /></div>}
        {error && <div className="login-error">{error}</div>}

        {!loading && !error && grouped.map(({ roleKey, cfg, members: roleMembers }) => (
          <div key={roleKey} style={{ marginBottom: 40 }}>
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 4,
                height: 20,
                borderRadius: 2,
                background: cfg.color,
              }} />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1a202c' }}>
                {cfg.label}
              </h2>
              <span style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 10,
                background: cfg.bg,
                color: cfg.color,
                fontWeight: 500,
              }}>
                {roleMembers.length}
              </span>
            </div>

            {/* Members Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 12,
            }}>
              {roleMembers.map(m => (
                <div
                  key={m.id}
                  className="kite-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                  }}
                >
                  <AvatarIcon name={m.name} role={m.role} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: '#1a202c',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {m.name}
                    </div>
                    {teams[m.team_id] && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {teams[m.team_id]}
                      </div>
                    )}
                    <div style={{
                      display: 'inline-block',
                      marginTop: 4,
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 4,
                      background: cfg.bg,
                      color: cfg.color,
                      fontWeight: 500,
                    }}>
                      {cfg.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {!loading && !error && members.length === 0 && (
          <div className="empty-state">No team members found.</div>
        )}
      </div>
    </>
  )
}
