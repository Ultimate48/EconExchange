import { useState, useEffect } from 'react'
import StatusBadge from './StatusBadge'
import { formatINR, formatQty, formatTimestamp } from '../lib/format'
import { supabase } from '../lib/supabase'

export default function TradeDetailsModal({ trade, isPublic = false, memberMap = {}, onClose }) {
  const [memberNames, setMemberNames] = useState(memberMap || {})

  useEffect(() => {
    if (!trade || isPublic) return
    supabase
      .from('members')
      .select('id, name')
      .then(({ data, error }) => {
        if (data && data.length > 0) {
          const map = { ...memberMap }
          data.forEach(m => { map[m.id] = m.name })
          setMemberNames(map)
        }
      })
      .catch(() => { })
  }, [trade, isPublic])

  if (!trade) return null

  const isBuy = trade.side?.toLowerCase() === 'buy'
  const unitPrice = trade.settled_price || trade.limit_price || trade.price || 0
  const totalValue = Number(trade.quantity || 0) * Number(unitPrice)

  function formatPerson(obj, nameField, rawVal, fallback = '—') {
    // 1. Direct object join name
    if (obj && typeof obj === 'object' && obj.name) return obj.name
    // 2. Direct string name field
    if (nameField && typeof nameField === 'string' && !nameField.includes('-') && nameField.length < 30) return nameField
    // 3. Member map lookup (passed from prop or fetched)
    if (rawVal && memberMap[rawVal]) return memberMap[rawVal]
    if (rawVal && memberNames[rawVal]) return memberNames[rawVal]
    // 4. Raw string check
    if (typeof rawVal === 'string') {
      if (memberMap[rawVal]) return memberMap[rawVal]
      if (memberNames[rawVal]) return memberNames[rawVal]
      if (rawVal.includes('@')) return rawVal.split('@')[0]
      if (rawVal.length >= 20 && rawVal.includes('-')) return fallback
      return rawVal
    }
    return fallback
  }

  const requesterName = formatPerson(
    trade.requester,
    trade.requested_by_name || trade.requester_name,
    trade.requested_by,
    'Team Member'
  )

  const reviewerName = formatPerson(
    trade.reviewer,
    trade.reviewed_by_name || trade.approver_name,
    trade.reviewed_by,
    trade.status === 'requested' ? 'Pending Review' : '—'
  )

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="kite-modal-card trade-details-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 520, width: '92%' }}
      >
        <div className="kite-modal-header flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-hairline)' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>{trade.ticker}</span>
            <span className={isBuy ? 'side-buy' : 'side-sell'} style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
              {trade.side}
            </span>
            <StatusBadge status={trade.status} />
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="kite-modal-body" style={{ padding: 20 }}>
          {/* Main Trade Metrics Card */}
          <div className="trade-metrics-grid" style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 8,
            padding: '14px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 20
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Quantity</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>{formatQty(trade.quantity)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>
                {trade.status === 'settled' ? 'Settled Price' : trade.limit_price ? 'Limit Price' : 'Order Rate'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>
                {unitPrice > 0 ? formatINR(unitPrice) : 'Market'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Total Value</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--kite-blue)' }}>
                {totalValue > 0 ? formatINR(totalValue) : '—'}
              </div>
            </div>
          </div>

          {/* Order & Lifecycle Audit Information */}
          <div style={{ fontSize: 13, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: 10 }}>Order Lifecycle & Audit Details</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Order Type: </span>
                <strong style={{ textTransform: 'uppercase', color: 'var(--text-dark)' }}>{trade.order_type || 'MARKET'}</strong>
              </div>

              {trade.teams?.name && (
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Team: </span>
                  <strong style={{ color: 'var(--text-dark)' }}>{trade.teams.name}</strong>
                </div>
              )}

              {!isPublic && (
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Requested By: </span>
                  <strong style={{ color: 'var(--text-dark)' }}>{requesterName}</strong>
                </div>
              )}

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Requested At: </span>
                <strong style={{ color: 'var(--text-dark)' }}>{trade.requested_at ? formatTimestamp(trade.requested_at) : '—'}</strong>
              </div>

              {!isPublic && (
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                    {trade.status === 'rejected' ? 'Rejected By: ' : trade.status === 'cancelled' ? 'Cancelled By: ' : 'Reviewed By: '}
                  </span>
                  <strong style={{ color: 'var(--text-dark)' }}>{reviewerName}</strong>
                </div>
              )}

              {trade.reviewed_at && (
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Reviewed At: </span>
                  <strong style={{ color: 'var(--text-dark)' }}>{formatTimestamp(trade.reviewed_at)}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Trade Rationale / Reasoning */}
          {trade.reasoning && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Trade Rationale & Reasoning</div>
              <div style={{
                background: '#FAFAFA',
                border: '1px solid var(--border-hairline)',
                borderRadius: 6,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--text-dark)',
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {trade.reasoning}
              </div>
            </div>
          )}
        </div>

        <div className="kite-modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
