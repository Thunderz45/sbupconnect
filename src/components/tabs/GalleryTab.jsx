import React, { useState } from 'react';
import { GALLERY_DATA } from '../../data/appData';
import { X, ZoomIn } from 'lucide-react';

const FILTERS = ['all', 'campus', 'events', 'cultural', 'sports', 'workshops'];
const BADGE_COLORS = { campus: 'badge-primary', events: 'badge-success', cultural: 'badge-purple', sports: 'badge-warning', workshops: 'badge-danger' };

export default function GalleryTab() {
  const [filter, setFilter]   = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const filtered = filter === 'all' ? GALLERY_DATA : GALLERY_DATA.filter(g => g.category === filter);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">Campus Gallery</div>
        <div className="page-sub">Photos from campus life, events, and academic activities</div>
      </div>

      {/* Filters */}
      <div className="filter-chips">
        {FILTERS.map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Photos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="gallery-grid">
        {filtered.map(item => (
          <div key={item.id} className="gallery-item" onClick={() => setLightbox(item)}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <div className="gallery-overlay">
              <span className={`badge ${BADGE_COLORS[item.category] || 'badge-primary'}`} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontSize: 9, marginBottom: 6, alignSelf: 'flex-start' }}>
                {item.badge}
              </span>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 13, lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{item.title}</div>
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 3 }}>{item.location} · {item.date}</div>
            </div>
            <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 7, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0, transition: '0.2s' }}
              className="zoom-icon">
              <ZoomIn size={13} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(12px)' }}
          onClick={() => setLightbox(null)}>
          <button style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          <div style={{ maxWidth: 800, width: '100%' }} onClick={e => e.stopPropagation()}>
            <img src={lightbox.image} alt={lightbox.title} style={{ width: '100%', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }} />
            <div style={{ color: '#fff', marginTop: 16, padding: '0 4px' }}>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 17 }}>{lightbox.title}</div>
              <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>{lightbox.location} · {lightbox.date}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
