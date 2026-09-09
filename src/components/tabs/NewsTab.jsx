import React, { useState } from 'react';
import { NEWS_DATA } from '../../data/appData';
import { X } from 'lucide-react';

const FILTERS = ['all', 'tech', 'business', 'india', 'world', 'sports'];
const CAT_LABELS = { all: 'All', tech: 'Technology', business: 'Business', india: 'India', world: 'World', sports: 'Sports' };

export default function NewsTab() {
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  const filtered = filter === 'all' ? NEWS_DATA : NEWS_DATA.filter(n => n.category === filter);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">News Feed</div>
        <div className="page-sub">Curated campus and national news</div>
      </div>

      {/* Filters */}
      <div className="filter-chips">
        {FILTERS.map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {CAT_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="news-grid">
        {filtered.map(news => (
          <div key={news.id} className="news-card" onClick={() => setDetail(news)}>
            <img src={news.image} alt={news.title} />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge-primary" style={{ fontSize: 10 }}>{news.categoryLabel}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{news.date}</span>
              </div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 13, color: 'var(--navy)', lineHeight: 1.4, marginBottom: 6 }}>{news.title}</div>
              <div style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.6 }}>{news.summary}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginTop: 8 }}>{news.source}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(8px)' }}
          onClick={() => setDetail(null)}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 600, width: '100%', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <img src={detail.image} alt={detail.title} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span className="badge badge-primary" style={{ fontSize: 11 }}>{detail.categoryLabel}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{detail.date}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginLeft: 'auto' }}>{detail.source}</span>
              </div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--navy)', lineHeight: 1.4, marginBottom: 14 }}>{detail.title}</div>
              <div style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.7 }}>{detail.body}</div>
              <button onClick={() => setDetail(null)} style={{ marginTop: 20, padding: '11px 24px', background: 'var(--bg-soft)', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 14, fontWeight: 700, color: 'var(--slate)', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
