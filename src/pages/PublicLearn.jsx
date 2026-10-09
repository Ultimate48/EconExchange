import { useState } from 'react'
import TopNav from '../components/TopNav'
import { learnResources, allTags } from '../data/learnResources'

function getIconForType(type) {
  switch (type) {
    case 'video':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
      )
    case 'article':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    case 'podcast':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      )
    case 'tool':
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )
  }
}

export default function PublicLearn() {
  const [activeTag, setActiveTag] = useState('All')
  
  const filteredResources = activeTag === 'All' 
    ? learnResources 
    : learnResources.filter(r => r.tag === activeTag)

  return (
    <>
      <TopNav variant="public" />
      <div className="public-main" style={{ paddingTop: 68 }}>
        <div className="page-title">Learn</div>
        <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
          Curated resources to improve your knowledge about the stock market, investing, and trading.
        </p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                padding: '6px 12px',
                borderRadius: 16,
                border: '1px solid ' + (activeTag === tag ? '#e65100' : '#E2E8F0'),
                background: activeTag === tag ? '#e65100' : '#fff',
                color: activeTag === tag ? '#fff' : '#475569',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: activeTag === tag ? 500 : 400,
                transition: 'all 0.2s'
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16
        }}>
          {filteredResources.map((res, i) => (
            <a 
              key={i} 
              href={res.url} 
              target="_blank" 
              rel="noreferrer"
              className="kite-card"
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                padding: 20,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div style={{ color: '#e65100', marginTop: 2 }}>
                  {getIconForType(res.type)}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 500, color: '#333', lineHeight: 1.3 }}>
                    {res.title}
                  </h3>
                  <div style={{ display: 'inline-block', fontSize: 11, padding: '2px 6px', background: '#f1f5f9', color: '#64748b', borderRadius: 4, fontWeight: 500 }}>
                    {res.tag}
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5, paddingLeft: 30 }}>
                {res.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
