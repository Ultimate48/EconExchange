import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import tickers from '../data/tickers.json'

export default function TickerSearch({ onSelect, placeholder = 'Search eg: TCS, RELIANCE, INFY', inline = false }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [show, setShow] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    setHighlighted(-1)

    if (q.trim().length < 1) {
      setResults([])
      setShow(false)
      return
    }

    const upper = q.trim().toUpperCase()
    const matches = tickers
      .filter(t => t.t.includes(upper) || t.n.toUpperCase().includes(upper))
      .slice(0, 30)

    setResults(matches)
    setShow(matches.length > 0)
  }

  function handleSelect(ticker) {
    setQuery('')
    setResults([])
    setShow(false)
    if (onSelect) {
      onSelect(ticker)
    } else {
      navigate(`/stock/${ticker}`)
    }
  }

  function handleKeyDown(e) {
    if (!show) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      handleSelect(results[highlighted].t)
    } else if (e.key === 'Escape') {
      setShow(false)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: inline ? '100%' : undefined }}>
      <div className="search-wrapper">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShow(true)}
          placeholder={placeholder}
          style={inline ? {} : { width: '100%', padding: '7px 10px 7px 30px', border: '1px solid #ebebeb', borderRadius: '3px', fontSize: '12px', color: '#444', background: '#f5f5f5', outline: 'none' }}
        />
      </div>
      {show && (
        <div className="autocomplete-dropdown">
          {results.map((item, i) => (
            <div
              key={item.t}
              className={`autocomplete-item ${i === highlighted ? 'highlighted' : ''}`}
              onClick={() => handleSelect(item.t)}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className="ticker-symbol">{item.t}</span>
              <span className="ticker-name">{item.n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
