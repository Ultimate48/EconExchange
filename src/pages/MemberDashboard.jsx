import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import TopNav from '../components/TopNav'
import StatusBadge from '../components/StatusBadge'
import TickerSearch from '../components/TickerSearch'
import TradeDetailsModal from '../components/TradeDetailsModal'
import { getDashboard, approveTrade, rejectTrade, cancelTrade } from '../lib/api'
import { formatINR, formatINRCompact, formatPercent, formatQty, formatTimestamp, computePnL, formatDate } from '../lib/format'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div style={{ fontSize: 11, color: '#999' }}>{d.dateLabel}</div>
      <div className="font-mono" style={{ fontWeight: 600 }}>{formatINR(d.total)}</div>
    </div>
  )
}

export default function MemberDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState({})
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null) // { action, trade }
  const [selectedDetailTrade, setSelectedDetailTrade] = useState(null)

  const fetchDashboard = useCallback((isSilent = false) => {
    if (!isSilent) setLoading(true)
    getDashboard()
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  function promptAction(action, trade) {
    setConfirmModal({ action, trade })
  }

  async function executeAction() {
    if (!confirmModal) return
    const { action, trade } = confirmModal
    const tradeId = trade.id
    setConfirmModal(null)
    setActionLoading(prev => ({ ...prev, [tradeId]: true }))

    try {
      let msg = ''
      if (action === 'approve') {
        await approveTrade(tradeId)
        msg = `Trade #${tradeId.slice(0, 8)} (${trade.ticker} ${trade.side.toUpperCase()}) approved successfully!`
      } else if (action === 'reject') {
        await rejectTrade(tradeId)
        msg = `Trade #${tradeId.slice(0, 8)} (${trade.ticker} ${trade.side.toUpperCase()}) rejected.`
      } else if (action === 'cancel') {
        await cancelTrade(tradeId)
        msg = `Trade #${tradeId.slice(0, 8)} (${trade.ticker} ${trade.side.toUpperCase()}) cancelled.`
      }
      
      setToast({ type: 'success', message: msg })

      // Optimistically update local trades state immediately
      setData(prev => {
        if (!prev) return prev
        const updatedTrades = prev.trades.map(t => {
          if (t.id === tradeId) {
            return {
              ...t,
              status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'cancelled'
            }
          }
          return t
        })
        return { ...prev, trades: updatedTrades }
      })

      fetchDashboard(true) // Background sync
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'Action failed' })
    } finally {
      setActionLoading(prev => ({ ...prev, [tradeId]: false }))
    }
  }

  if (loading) {
    return (
      <>
        <TopNav />
        <div className="app-layout">
          <div className="app-sidebar" />
          <div className="app-main">
            <div className="loading-center"><div className="spinner" /></div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <TopNav />
        <div className="app-layout">
          <div className="app-sidebar" />
          <div className="app-main">
            <div className="login-error">{error}</div>
          </div>
        </div>
      </>
    )
  }

  const { team, holdings, portfolio_value, trades, portfolio_snapshots, member } = data
  const isSenior = member.role === 'core' || member.role === 'exec_board'

  // Compute totals
  const holdingsValue = holdings.reduce((s, h) => s + (h.market_value || 0), 0)
  const totalInvestment = holdings.reduce((s, h) => s + h.avg_buy_price * h.quantity, 0)
  const totalPnL = holdingsValue - totalInvestment // Open positions unrealized P&L
  const initialBudget = 10000000
  const portfolioReturn = portfolio_value - initialBudget // Net capital return from starting ₹1 Cr

  // Equity curve data
  const chartData = portfolio_snapshots.map(s => ({
    dateLabel: formatDate(s.recorded_at),
    total: Number(s.cash) + Number(s.holdings_value),
    timestamp: new Date(s.recorded_at).getTime(),
  }))

  // Filter trades by status for panels
  const pendingTrades = trades.filter(t => t.status === 'requested')
  const workingTrades = trades.filter(t => t.status === 'working')
  const recentTrades = trades.slice(0, 20)

  // Role badge
  const roleLabels = { member: 'Member', core: 'Core', exec_board: 'Exec Board' }

  return (
    <>
      <TopNav />
      <div className="app-layout">
        {/* ── Left Sidebar: Holdings as Watchlist ── */}
        <div className="app-sidebar">
          <div className="sidebar-search">
            <TickerSearch inline />
          </div>

          {holdings.length === 0 ? (
            <div className="empty-state">No holdings yet</div>
          ) : (
            holdings.map(h => {
              const { pnl, pnlPercent } = computePnL(h.avg_buy_price, h.current_price, h.quantity)
              return (
                <Link
                  to={`/stock/${h.ticker}`}
                  key={h.ticker}
                  className="watchlist-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <span className="wl-ticker">
                    {h.ticker}
                    <span style={{ fontSize: 10, color: '#999', marginLeft: 6 }}>
                      {h.quantity}
                    </span>
                  </span>
                  <span className={`wl-change ${pnlPercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {pnlPercent != null ? formatPercent(pnlPercent) : '—'}
                  </span>
                  <span className="wl-price">
                    {h.current_price != null ? formatINR(h.current_price).replace('₹', '') : '—'}
                  </span>
                </Link>
              )
            })
          )}
        </div>

        {/* ── Main Content ── */}
        <div className="app-main">

          {/* Greeting */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 400, color: '#444', marginBottom: 2 }}>
              Hi, {member.name}
            </h1>
            <span style={{ fontSize: 12, color: '#999' }}>
              {team.name} · <span className="status-badge status-approved" style={{ fontSize: 10 }}>{roleLabels[member.role]}</span>
            </span>
          </div>

          {/* ── 07. CARDS Summary Overview (matching Kite spec) ── */}
          <div className="market-overview-grid">
            <div className="market-card">
              <div className="title">Cash Available</div>
              <div className="price" style={{ color: 'var(--kite-heading)' }}>{formatINRCompact(team.cash)}</div>
              <div className="change" style={{ color: 'var(--kite-dark)' }}>Available Margin</div>
            </div>
            <div className="market-card">
              <div className="title">Holdings Value</div>
              <div className="price" style={{ color: 'var(--kite-heading)' }}>{formatINRCompact(holdingsValue)}</div>
              <div className="change" style={{ color: 'var(--kite-dark)' }}>{holdings.length} Active Positions</div>
            </div>
            <div className="market-card">
              <div className="title">Portfolio Value</div>
              <div className="price" style={{ color: 'var(--kite-heading)' }}>{formatINRCompact(portfolio_value)}</div>
              <div className="change" style={{ color: 'var(--kite-dark)' }}>Total Capital</div>
            </div>
            <div className="market-card">
              <div className="title">Portfolio Return & P&L</div>
              <div className={`price ${portfolioReturn >= 0 ? 'text-gain' : 'text-loss'}`}>
                {formatINRCompact(portfolioReturn)}
              </div>
              <div className="change flex items-center justify-between" style={{ marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                <span className={portfolioReturn >= 0 ? 'text-gain' : 'text-loss'} style={{ fontWeight: 600 }}>
                  {formatPercent((portfolioReturn / initialBudget) * 100)} Net Return
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }} title="Unrealized gain/loss on active stock holdings">
                  Holdings P&L: <strong className={totalPnL >= 0 ? 'text-gain' : 'text-loss'}>{formatINRCompact(totalPnL)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ── Equity Curve (Gradient Area Chart) ── */}
          {chartData.length > 1 && (
            <div className="kite-card">
              <div className="kite-card-header">
                <span>Portfolio Performance Curve</span>
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)' }}>
                  Snapshots History
                </span>
              </div>
              <div className="kite-card-body" style={{ padding: '16px 24px 24px 8px' }}>
                <div className="equity-chart-container" style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <defs>
                        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2575FC" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#2575FC" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="dateLabel"
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E2E8F0' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={v => formatINRCompact(v)}
                        width={70}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#2575FC"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#2575FC', stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── Holdings Table ── */}
          <div className="kite-card" style={{ marginBottom: 20 }}>
            <div className="kite-card-header">
              Holdings
              <span className="count">({holdings.length})</span>
            </div>
            {holdings.length === 0 ? (
              <div className="empty-state">No holdings yet — place your first trade!</div>
            ) : (
              <div className="table-responsive">
                <table className="kite-table">
                  <thead>
                    <tr>
                      <th>Instrument</th>
                      <th className="num">Qty</th>
                      <th className="num">Avg Cost</th>
                      <th className="num">LTP</th>
                      <th className="num">Cur. Value</th>
                      <th className="num">P&L</th>
                      <th className="num">Net Chg.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map(h => {
                      const { pnl, pnlPercent } = computePnL(h.avg_buy_price, h.current_price, h.quantity)
                      return (
                        <tr key={h.ticker}>
                          <td className="ticker-cell">
                            <Link to={`/stock/${h.ticker}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {h.ticker}
                            </Link>
                          </td>
                          <td className="num">{formatQty(h.quantity)}</td>
                          <td className="num">{formatINR(h.avg_buy_price)}</td>
                          <td className="num">{h.current_price != null ? formatINR(h.current_price) : '—'}</td>
                          <td className="num">{formatINR(h.market_value)}</td>
                          <td className={`num ${pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                            {pnl != null ? formatINR(pnl) : '—'}
                          </td>
                          <td className={`num ${pnlPercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                            {pnlPercent != null ? formatPercent(pnlPercent) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Approval Queue (core/exec_board only) ── */}
          {isSenior && pendingTrades.length > 0 && (
            <div className="kite-card" style={{ marginBottom: 20 }}>
              <div className="kite-card-header" style={{ color: '#e65100' }}>
                Approval Queue
                <span className="count">({pendingTrades.length})</span>
              </div>
              <div className="table-responsive">
                <table className="kite-table">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Side</th>
                      <th>Type</th>
                      <th className="num">Qty</th>
                      <th className="num">Limit</th>
                      <th>Reasoning</th>
                      <th style={{ width: 140 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTrades.map(t => (
                      <tr key={t.id} onClick={() => setSelectedDetailTrade(t)} style={{ cursor: 'pointer' }} title="Click to view full trade details">
                        <td className="ticker-cell">{t.ticker}</td>
                        <td><span className={t.side === 'buy' ? 'side-buy' : 'side-sell'}>{t.side}</span></td>
                        <td style={{ fontSize: 12, color: '#999', textTransform: 'uppercase' }}>{t.order_type}</td>
                        <td className="num">{formatQty(t.quantity)}</td>
                        <td className="num">{t.limit_price ? formatINR(t.limit_price) : '—'}</td>
                        <td className="reasoning-cell" title={t.reasoning}>{t.reasoning}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-blue btn-sm"
                              onClick={() => promptAction('approve', t)}
                              disabled={actionLoading[t.id]}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-red btn-sm"
                              onClick={() => promptAction('reject', t)}
                              disabled={actionLoading[t.id]}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Working Orders (core/exec_board only) ── */}
          {isSenior && workingTrades.length > 0 && (
            <div className="kite-card" style={{ marginBottom: 20 }}>
              <div className="kite-card-header">
                Working Orders
                <span className="count">({workingTrades.length})</span>
              </div>
              <div className="table-responsive">
                <table className="kite-table">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Side</th>
                      <th className="num">Qty</th>
                      <th className="num">Limit Price</th>
                      <th>Reasoning</th>
                      <th style={{ width: 80 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workingTrades.map(t => (
                      <tr key={t.id} onClick={() => setSelectedDetailTrade(t)} style={{ cursor: 'pointer' }} title="Click to view full trade details">
                        <td className="ticker-cell">{t.ticker}</td>
                        <td><span className={t.side === 'buy' ? 'side-buy' : 'side-sell'}>{t.side}</span></td>
                        <td className="num">{formatQty(t.quantity)}</td>
                        <td className="num">{formatINR(t.limit_price)}</td>
                        <td className="reasoning-cell" title={t.reasoning}>{t.reasoning}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => promptAction('cancel', t)}
                            disabled={actionLoading[t.id]}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Recent Trades ── */}
          <div className="kite-card">
            <div className="kite-card-header">
              Recent Trades
              <span className="count">({trades.length})</span>
            </div>
            {recentTrades.length === 0 ? (
              <div className="empty-state">No trades yet</div>
            ) : (
              <div className="table-responsive">
                <table className="kite-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Ticker</th>
                      <th>Side</th>
                      <th>Type</th>
                      <th className="num">Qty</th>
                      <th className="num">Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrades.map(t => (
                      <tr key={t.id} onClick={() => setSelectedDetailTrade(t)} style={{ cursor: 'pointer' }} title="Click to view full trade details">
                        <td style={{ fontSize: 12, color: '#999' }}>{formatTimestamp(t.requested_at)}</td>
                        <td className="ticker-cell">{t.ticker}</td>
                        <td><span className={t.side === 'buy' ? 'side-buy' : 'side-sell'}>{t.side}</span></td>
                        <td style={{ fontSize: 12, color: '#999', textTransform: 'uppercase' }}>{t.order_type}</td>
                        <td className="num">{formatQty(t.quantity)}</td>
                        <td className="num">{t.settled_price ? formatINR(t.settled_price) : t.limit_price ? formatINR(t.limit_price) : '—'}</td>
                        <td><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`floating-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <div className="toast-icon">
            {toast.type === 'error' ? '✕' : '✓'}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button type="button" className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Trade Details Modal */}
      {selectedDetailTrade && (
        <TradeDetailsModal trade={selectedDetailTrade} memberMap={data?.member_map} onClose={() => setSelectedDetailTrade(null)} />
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="modal-backdrop">
          <div className="kite-modal-card">
            <div className="kite-modal-header">
              <h3>Confirm Trade {confirmModal.action === 'approve' ? 'Approval' : confirmModal.action === 'reject' ? 'Rejection' : 'Cancellation'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setConfirmModal(null)}>✕</button>
            </div>
            <div className="kite-modal-body">
              <p style={{ marginBottom: 12, fontSize: 14, color: 'var(--text-dark)' }}>
                Are you sure you want to <strong>{confirmModal.action.toUpperCase()}</strong> this trade request?
              </p>
              <div className="confirm-trade-summary">
                <div><span>Ticker:</span> <strong>{confirmModal.trade.ticker}</strong></div>
                <div><span>Action:</span> <strong className={confirmModal.trade.side === 'buy' ? 'text-gain' : 'text-loss'}>{confirmModal.trade.side.toUpperCase()}</strong></div>
                <div><span>Quantity:</span> <strong>{formatQty(confirmModal.trade.quantity)}</strong></div>
                <div><span>Order Type:</span> <strong>{confirmModal.trade.order_type.toUpperCase()}</strong></div>
                {confirmModal.trade.limit_price && (
                  <div><span>Limit Price:</span> <strong>{formatINR(confirmModal.trade.limit_price)}</strong></div>
                )}
              </div>
            </div>
            <div className="kite-modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${confirmModal.action === 'reject' ? 'btn-red' : confirmModal.action === 'cancel' ? 'btn-outline' : 'btn-primary'}`}
                onClick={executeAction}
              >
                Confirm {confirmModal.action === 'approve' ? 'Approval' : confirmModal.action === 'reject' ? 'Rejection' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
