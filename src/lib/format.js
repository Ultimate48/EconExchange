/**
 * Format a number as INR with ₹ prefix and Indian comma grouping.
 * Uses the Indian numbering system (lakhs, crores).
 */
export function formatINR(amount) {
  if (amount == null || isNaN(amount)) return '—'
  const num = Number(amount)
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format a number as INR, but compact (K, L, Cr) for large values.
 */
export function formatINRCompact(amount) {
  if (amount == null || isNaN(amount)) return '—'
  const num = Number(amount)
  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  if (abs >= 1e7) return sign + '₹' + (abs / 1e7).toFixed(2) + ' Cr'
  if (abs >= 1e5) return sign + '₹' + (abs / 1e5).toFixed(2) + ' L'
  if (abs >= 1e3) return sign + '₹' + (abs / 1e3).toFixed(2) + 'K'
  return formatINR(num)
}

/**
 * Format a quantity to max 4 decimal places, stripping trailing zeros.
 */
export function formatQty(qty) {
  if (qty == null || isNaN(qty)) return '—'
  return Number(qty).toLocaleString('en-IN', { maximumFractionDigits: 4 })
}

/**
 * Format a percentage with sign and 2 decimal places.
 */
export function formatPercent(value) {
  if (value == null || isNaN(value)) return '—'
  const num = Number(value)
  const sign = num > 0 ? '+' : ''
  return sign + num.toFixed(2) + '%'
}

/**
 * Format an ISO timestamp to a human-readable date/time.
 */
export function formatTimestamp(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Format just the date portion.
 */
export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Relative time (e.g. "2 min ago", "3 hours ago")
 */
export function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/**
 * Compute P&L and P&L % from avg buy price and current price.
 */
export function computePnL(avgBuyPrice, currentPrice, quantity) {
  if (avgBuyPrice == null || currentPrice == null || quantity == null) {
    return { pnl: null, pnlPercent: null }
  }
  const pnl = (currentPrice - avgBuyPrice) * quantity
  const pnlPercent = avgBuyPrice > 0 ? ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100 : 0
  return { pnl, pnlPercent }
}
