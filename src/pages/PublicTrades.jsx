import { useState, useEffect } from 'react'
import TopNav from '../components/TopNav'
import StatusBadge from '../components/StatusBadge'
import TradeDetailsModal from '../components/TradeDetailsModal'
import { publicTrades, publicPortfolio } from '../lib/api'
import { formatINR, formatQty, formatTimestamp } from '../lib/format'

export default function PublicTrades() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState(null)

  // Filters
  const [teams, setTeams] = useState([])
  const [filterTeam, setFilterTeam] = useState('')
  const [filterTicker, setFilterTicker] = useState('')

  useEffect(() => {
    publicPortfolio()
      .then(data => setTeams(data.map(t => ({ id: t.team_id, name: t.team_name }))))
      .catch(() => {})
  }, [])

  function fetchTrades(append = false) {
    const setLoad = append ? setLoadingMore : setLoading
    setLoad(true)

    publicTrades({
      team_id: filterTeam || undefined,
      ticker: filterTicker || undefined,
      cursor: append ? cursor : undefined,
      limit: 50,
    })
      .then(data => {
        if (append) {
          setTrades(prev => [...prev, ...data.trades])
        } else {
          setTrades(data.trades)
        }
        setCursor(data.next_cursor)
        setHasMore(!!data.next_cursor)
        setLoad(false)
      })
      .catch(e => {
        setError(e.message)
        setLoad(false)
      })
  }

  useEffect(() => {
    fetchTrades(false)
  }, [filterTeam, filterTicker])

  return (
    <>
      <TopNav variant="public" />
      <div className="public-main" style={{ paddingTop: 68 }}>
        <div className="page-title">Trade Log</div>

        <div className="filters-bar flex gap-3" style={{ flexWrap: 'wrap', marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 180px' }}>
            <label className="form-label">Team</label>
            <select
              className="form-input"
              value={filterTeam}
              onChange={e => setFilterTeam(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">All teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 140px' }}>
            <label className="form-label">Ticker</label>
            <input
              className="form-input"
              value={filterTicker}
              onChange={e => setFilterTicker(e.target.value.toUpperCase())}
              placeholder="e.g. TCS"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {error && <div className="login-error">{error}</div>}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="kite-card">
            <div className="table-responsive">
              <table className="kite-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Team</th>
                  <th>Ticker</th>
                  <th>Side</th>
                  <th>Type</th>
                  <th className="num">Qty</th>
                  <th className="num">Price</th>
                  <th>Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-state">No settled trades found</td>
                  </tr>
                ) : trades.map(trade => (
                  <tr key={trade.id} onClick={() => setSelectedTrade(trade)} style={{ cursor: 'pointer' }} title="Click to view complete trade details">
                    <td style={{ fontSize: 12, color: '#999' }}>
                      {formatTimestamp(trade.requested_at)}
                    </td>
                    <td>{trade.teams?.name || '—'}</td>
                    <td className="ticker-cell">{trade.ticker}</td>
                    <td>
                      <span className={trade.side === 'buy' ? 'side-buy' : 'side-sell'}>
                        {trade.side}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, textTransform: 'uppercase', color: '#999' }}>
                      {trade.order_type}
                    </td>
                    <td className="num">{formatQty(trade.quantity)}</td>
                    <td className="num">{formatINR(trade.settled_price)}</td>
                    <td className="reasoning-cell" title={trade.reasoning}>
                      {trade.reasoning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {hasMore && (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => fetchTrades(true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTrade && (
        <TradeDetailsModal trade={selectedTrade} isPublic={true} onClose={() => setSelectedTrade(null)} />
      )}
    </>
  )
}
