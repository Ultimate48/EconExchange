export default function StatusBadge({ status }) {
  const cls = `status-badge status-${status}`
  const labels = {
    requested: 'Requested',
    approved: 'Approved',
    working: 'Working',
    settled: 'Settled',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  }
  return <span className={cls}>{labels[status] || status}</span>
}
