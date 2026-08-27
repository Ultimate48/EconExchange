import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import TickerSearch from '../components/TickerSearch'
import { createTrade, getTickerPrice } from '../lib/api'
import { formatINR } from '../lib/format'

export default function NewTrade() {
  const [searchParams] = useSearchParams()
  const initialTicker = searchParams.get('ticker') || ''
  const navigate = useNavigate()

  const [ticker, setTicker] = useState(initialTicker.toUpperCase())
  const [side, setSide] = useState('buy')
  const [orderType, setOrderType] = useState('market')
  const [quantity, setQuantity] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [reasoning, setReasoning] = useState('')

  const [currentPrice, setCurrentPrice] = useState(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!ticker) {
      setCurrentPrice(null)
      return
    }
    setLoadingPrice(true)
    getTickerPrice(ticker)
      .then(res => {
        setCurrentPrice(res.price)
        if (orderType === 'limit' && !limitPrice) {
          setLimitPrice(res.price?.toString() || '')
        }
        setLoadingPrice(false)
      })
      .catch(() => {
        setCurrentPrice(null)
        setLoadingPrice(false)
      })
  }, [ticker])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!ticker) {
      setError('Please select a valid ticker')
      return
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Quantity must be greater than 0')
      return
    }
    if (orderType === 'limit' && (!limitPrice || Number(limitPrice) <= 0)) {
      setError('Limit price must be greater than 0 for limit orders')
      return
    }
    if (!reasoning.trim()) {
      setError('Written reasoning is required for all trade requests')
      return
    }

    setSubmitting(true)
    try {
      await createTrade({
        ticker: ticker.trim().toUpperCase(),
        side,
        order_type: orderType,
        quantity: Number(quantity),
        limit_price: orderType === 'limit' ? Number(limitPrice) : null,
        reasoning: reasoning.trim(),
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create trade request')
    } finally {
      setSubmitting(false)
    }
  }

  const estPrice = orderType === 'limit' ? Number(limitPrice) : currentPrice
  const totalEst = estPrice && Number(quantity) ? estPrice * Number(quantity) : null

  return (
    <>
      <TopNav />
      <div className="public-main" style={{ paddingTop: 68 }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="page-title">New Trade Order</div>

          <div className="kite-card" style={{ padding: 24 }}>
            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Ticker Search */}
              <div className="form-group">
                <label className="form-label">Ticker Symbol</label>
                <TickerSearch
                  placeholder="Search ticker e.g. TCS, RELIANCE..."
                  onSelect={t => setTicker(t)}
                />
                {ticker && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#444' }}>
                    Selected: <strong style={{ color: '#000' }}>{ticker}</strong>
                    {loadingPrice ? (
                      <span style={{ color: '#999', marginLeft: 8 }}>Fetching price...</span>
                    ) : currentPrice != null ? (
                      <span style={{ marginLeft: 8, color: '#2fad30' }}>
                        LTP: {formatINR(currentPrice)}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Side toggle */}
              <div className="form-group">
                <label className="form-label">Order Side</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-btn ${side === 'buy' ? 'active-buy' : ''}`}
                    onClick={() => setSide('buy')}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${side === 'sell' ? 'active-sell' : ''}`}
                    onClick={() => setSide('sell')}
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* Order Type toggle */}
              <div className="form-group">
                <label className="form-label">Order Type</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-btn ${orderType === 'market' ? 'active-neutral' : ''}`}
                    onClick={() => setOrderType('market')}
                  >
                    Market
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${orderType === 'limit' ? 'active-neutral' : ''}`}
                    onClick={() => setOrderType('limit')}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  step="any"
                  min="0.0001"
                  className="form-input"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              {/* Limit Price if limit order */}
              {orderType === 'limit' && (
                <div className="form-group">
                  <label className="form-label">Limit Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    className="form-input"
                    value={limitPrice}
                    onChange={e => setLimitPrice(e.target.value)}
                    placeholder="Enter limit price"
                    required
                  />
                </div>
              )}

              {/* Estimated Total */}
              {totalEst != null && (
                <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f8f9fa', borderRadius: 3, fontSize: 12 }}>
                  Estimated Order Value: <strong className="font-mono">{formatINR(totalEst)}</strong>
                </div>
              )}

              {/* Written Reasoning (Mandatory) */}
              <div className="form-group">
                <label className="form-label">Trade Reasoning (Mandatory)</label>
                <textarea
                  className="form-input form-textarea"
                  value={reasoning}
                  onChange={e => setReasoning(e.target.value)}
                  placeholder="Explain why your team is making this trade (thesis, strategy, targets)..."
                  required
                />
              </div>

              <div className="flex gap-3" style={{ marginTop: 24 }}>
                <button
                  type="submit"
                  className={`btn ${side === 'buy' ? 'btn-blue' : 'btn-red'}`}
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : `Place ${side.toUpperCase()} Order`}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
