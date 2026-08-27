import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { publicPortfolio } from '../lib/api'
import { formatINR, formatINRCompact, formatPercent, computePnL } from '../lib/format'

import { supabase } from '../lib/supabase'

export default function PublicDashboard() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedTeam, setExpandedTeam] = useState(null)

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await publicPortfolio()
        if (Array.isArray(data)) {
          setTeams(data)
          setLoading(false)
          return
        }
        throw new Error('Fallback to direct query')
      } catch {
        // Fallback: direct Supabase query (all 3 tables are RLS publicly readable)
        try {
          const [teamsRes, holdingsRes, pricesRes] = await Promise.all([
            supabase.from('teams').select('id, name, cash').order('name', { ascending: true }),
            supabase.from('holdings').select('team_id, ticker, quantity, avg_buy_price'),
            supabase.from('price_cache').select('ticker, price'),
          ])

          if (teamsRes.error) throw teamsRes.error

          const priceMap = {}
          for (const p of pricesRes.data || []) {
            priceMap[p.ticker] = Number(p.price)
          }

          const holdingsByTeam = {}
          for (const h of holdingsRes.data || []) {
            if (!holdingsByTeam[h.team_id]) holdingsByTeam[h.team_id] = []
            holdingsByTeam[h.team_id].push(h)
          }

          const summaries = (teamsRes.data || []).map(team => {
            const teamHoldings = (holdingsByTeam[team.id] || []).map(h => {
              const currentPrice = priceMap[h.ticker] ?? null
              const marketValue = currentPrice != null ? Number(h.quantity) * currentPrice : 0
              return {
                ticker: h.ticker,
                quantity: Number(h.quantity),
                avg_buy_price: Number(h.avg_buy_price),
                current_price: currentPrice,
                market_value: marketValue,
              }
            })

            const holdingsValue = teamHoldings.reduce((sum, h) => sum + h.market_value, 0)
            const cash = Number(team.cash)
            const totalValue = cash + holdingsValue

            return {
              team_id: team.id,
              team_name: team.name,
              cash,
              holdings_value: holdingsValue,
              total_value: totalValue,
              holdings: teamHoldings,
            }
          })

          summaries.sort((a, b) => b.total_value - a.total_value)
          setTeams(summaries)
          setLoading(false)
        } catch (err) {
          setError(err.message || 'Failed to load portfolio leaderboard')
          setLoading(false)
        }
      }
    }

    loadPortfolio()
  }, [])

  return (
    <>
      <TopNav variant="public" />
      <div className="public-main" style={{ paddingTop: 68 }}>
        <div className="page-title">Leaderboard</div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}
        {error && <div className="login-error">{error}</div>}

        {!loading && !error && (
          <div className="kite-card">
            <div className="table-responsive">
              <table className="kite-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Team</th>
                    <th className="num">Cash</th>
                    <th className="num">Holdings</th>
                    <th className="num">Total Value</th>
                    <th className="num">P&L</th>
                  </tr>
                </thead>
                <tbody>
                {teams.map((team, i) => {
                  const startingCash = 10000000 // ₹1 Cr starting budget
                  const pnl = team.total_value - startingCash
                  const pnlPct = ((team.total_value - startingCash) / startingCash) * 100
                  const isExpanded = expandedTeam === team.team_id

                  return (
                    <>
                      <tr
                        key={team.team_id}
                        onClick={() => setExpandedTeam(isExpanded ? null : team.team_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ fontWeight: 600, color: i === 0 ? '#e65100' : '#999' }}>
                          {i + 1}
                        </td>
                        <td className="ticker-cell">{team.team_name}</td>
                        <td className="num">{formatINRCompact(team.cash)}</td>
                        <td className="num">{formatINRCompact(team.holdings_value)}</td>
                        <td className="num" style={{ fontWeight: 600 }}>
                          {formatINRCompact(team.total_value)}
                        </td>
                        <td className={`num ${pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                          {formatINRCompact(pnl)}
                          <span style={{ fontSize: 11, marginLeft: 4 }}>
                            ({formatPercent(pnlPct)})
                          </span>
                        </td>
                      </tr>
                      {isExpanded && team.holdings && team.holdings.length > 0 && (
                        <tr key={team.team_id + '-holdings'}>
                          <td colSpan={6} style={{ padding: 0, background: '#FAFAFA' }}>
                            <div className="table-responsive" style={{ padding: '8px 12px' }}>
                              <table className="kite-table" style={{ width: '100%' }}>
                                <thead>
                                  <tr>
                                    <th>Ticker</th>
                                    <th className="num">Qty</th>
                                    <th className="num">Avg Buy</th>
                                    <th className="num">LTP</th>
                                    <th className="num">Value</th>
                                    <th className="num">P&L</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {team.holdings.map(h => {
                                    const { pnl: holdPnl, pnlPercent } = computePnL(h.avg_buy_price, h.current_price, h.quantity)
                                    return (
                                      <tr key={h.ticker}>
                                        <td className="ticker-cell">{h.ticker}</td>
                                        <td className="num">{h.quantity}</td>
                                        <td className="num">{formatINR(h.avg_buy_price)}</td>
                                        <td className="num">{h.current_price != null ? formatINR(h.current_price) : '—'}</td>
                                        <td className="num">{formatINR(h.market_value)}</td>
                                        <td className={`num ${holdPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                                          {holdPnl != null ? formatINR(holdPnl) : '—'}
                                          {pnlPercent != null && (
                                            <span style={{ fontSize: 11, marginLeft: 4 }}>
                                              ({formatPercent(pnlPercent)})
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                      {isExpanded && (!team.holdings || team.holdings.length === 0) && (
                        <tr key={team.team_id + '-empty'}>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: 16 }}>
                            No holdings yet
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </>
  )
}
