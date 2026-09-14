import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import TopNav from '../components/TopNav'
import TickerSearch from '../components/TickerSearch'
import { getTickerPrice } from '../lib/api'
import { formatINR, formatTimestamp, formatPercent } from '../lib/format'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div style={{ fontSize: 11, color: '#999' }}>{formatTimestamp(new Date(data.timestamp * 1000).toISOString())}</div>
      <div className="font-mono" style={{ fontWeight: 600 }}>{formatINR(data.price)}</div>
    </div>
  )
}

export default function StockDetail() {
  const { ticker: paramTicker } = useParams()
  const navigate = useNavigate()
  const [ticker, setTicker] = useState(paramTicker || 'TCS')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeframe, setTimeframe] = useState('1M')

  useEffect(() => {
    if (paramTicker) {
      setTicker(paramTicker.toUpperCase())
    }
  }, [paramTicker])

  useEffect(() => {
    if (!ticker) return
    setLoading(true)
    setError(null)
    getTickerPrice(ticker)
      .then(res => {
        setData(res)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [ticker])

  const rawHistory = data?.history || []

  // Dynamic timeframe data filtering — full 15-min resolution everywhere
  const chartData = (() => {
    if (!rawHistory.length) return []

    if (timeframe === '1D') {
      // Last ~26 points ≈ one trading session of 15-min candles
      return rawHistory.slice(-26)
    }
    if (timeframe === '1W') {
      // Last ~182 points ≈ 7 trading days of 15-min candles
      return rawHistory.slice(-182)
    }
    // 1M and MAX — return all raw data at full 15-min resolution
    return rawHistory
  })()

  const firstPrice = chartData.length > 0 ? chartData[0].price : null
  const currentPrice = data?.price || null
  const priceDiff = currentPrice != null && firstPrice != null ? currentPrice - firstPrice : 0
  const pricePct = firstPrice && firstPrice > 0 ? (priceDiff / firstPrice) * 100 : 0

  return (
    <>
      <TopNav />
      <div className="public-main" style={{ paddingTop: 68 }}>
        <div style={{ marginBottom: 20, maxWidth: 400 }}>
          <TickerSearch
            placeholder="Search stock ticker (e.g. RELIANCE, TCS)..."
            onSelect={t => navigate(`/stock/${t}`)}
          />
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}
        {error && <div className="login-error">{error}</div>}

        {!loading && !error && data && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: '#333' }}>{data.ticker}</h1>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                  {data.exchange ? `Exchange: ${data.exchange}` : 'NSE / BSE'}
                  {data.last_updated && ` · Last updated: ${formatTimestamp(data.last_updated)}`}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-mono" style={{ fontSize: 24, fontWeight: 600, color: '#333' }}>
                    {formatINR(currentPrice)}
                  </div>
                  {firstPrice != null && (
                    <div className={`font-mono ${priceDiff >= 0 ? 'text-gain' : 'text-loss'}`} style={{ fontSize: 12 }}>
                      {priceDiff >= 0 ? '+' : ''}{priceDiff.toFixed(2)} ({formatPercent(pricePct)}) {timeframe}
                    </div>
                  )}
                </div>

                <Link to={`/trade/new?ticker=${data.ticker}`} className="btn btn-orange">
                  Place Order
                </Link>
              </div>
            </div>

            {/* Price Chart */}
            <div className="kite-card" style={{ padding: 20, marginBottom: 20 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--kite-heading)' }}>
                  Price History ({timeframe})
                </span>
                {/* 09. CHART Timeframe Selector Tabs */}
                <div className="flex gap-2">
                  {['1D', '1W', '1M', 'MAX'].map(tf => (
                    <button
                      key={tf}
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={timeframe === tf ? { background: '#DBEAFE', color: 'var(--kite-blue)', fontWeight: 600 } : {}}
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              {chartData.length === 0 ? (
                <div className="empty-state">No price history available</div>
              ) : (
                <div className="equity-chart-container" style={{ height: 340 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={ts => {
                          const d = new Date(ts * 1000)
                          if (timeframe === '1D') {
                            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                          }
                          if (timeframe === '1W') {
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                            return `${days[d.getDay()]} ${String(d.getHours()).padStart(2, '0')}:00`
                          }
                          return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`
                        }}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E2E8F0' }}
                        interval="preserveStartEnd"
                        minTickGap={40}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={v => '₹' + v}
                        width={65}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={priceDiff >= 0 ? '#10B981' : '#EF4444'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: priceDiff >= 0 ? '#10B981' : '#EF4444', stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
