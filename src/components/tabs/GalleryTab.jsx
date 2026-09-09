import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

const GALLERY = [
  { id: 1, category: 'campus',    title: 'SBUP Main Academic Quadrangle', location: 'Main Campus Pune',   image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800', badge: 'Campus' },
  { id: 2, category: 'campus',    title: 'Sri Balaji Central Library',     location: 'Central Library',    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800', badge: 'Campus' },
  { id: 3, category: 'events',    title: 'Annual Convocation Ceremony',    location: 'Grand Auditorium',   image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800', badge: 'Event' },
  { id: 4, category: 'events',    title: 'SBUP Founders Day Celebration',  location: 'Amphitheatre',       image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800', badge: 'Event' },
  { id: 5, category: 'cultural',  title: 'Astitva Cultural Fest Night',    location: 'Main Ground',        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800', badge: 'Cultural' },
  { id: 6, category: 'sports',    title: 'Inter-College Football Finals',  location: 'Sports Complex',     image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800', badge: 'Sports' },
  { id: 7, category: 'workshops', title: 'AI & Data Science Hackathon',    location: 'Tech Lab 4',         image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800', badge: 'Workshop' },
  { id: 8, category: 'campus',    title: 'SBUP Research Innovation Hub',   location: 'Block C',            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', badge: 'Campus' },
];

const FILTERS = ['all', 'campus', 'events', 'cultural', 'sports', 'workshops'];
const BADGE_COLORS = {
  Campus: '#0EA5E9', Event: '#8B5CF6', Cultural: '#EC4899',
  Sports: '#EF4444', Workshop: '#F59E0B'
};

export default function GalleryTab() {
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const filtered = GALLERY.filter(g => filter === 'all' || g.category === filter);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">Campus Gallery</div>
        <div className="page-sub">Memories from Sri Balaji University Pune</div>
      </div>

      <div className="notes-filter">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filtered.map(item => (
          <div key={item.id} className="gallery-item" onClick={() => setLightbox(item)}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <div className="gallery-overlay">
              <span className="badge" style={{ marginBottom: 6, background: BADGE_COLORS[item.badge], color: '#fff', fontSize: 10 }}>
                {item.badge}
              </span>
              <div className="gallery-title">{item.title}</div>
              <div className="gallery-loc">📍 {item.location}</div>
            </div>
            <div style={{
              position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <ZoomIn size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
          }}
          onClick={() => setLightbox(null)}
        >
          <div style={{ position: 'relative', maxWidth: 900, width: '100%' }} onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.image} alt={lightbox.title}
              style={{ width: '100%', borderRadius: 16, maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div style={{ marginTop: 16, color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{lightbox.title}</div>
              <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>📍 {lightbox.location}</div>
            </div>
            <button
              style={{ position: 'absolute', top: -16, right: -16, width: 36, height: 36, borderRadius: 99, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              onClick={() => setLightbox(null)}
            >
              <X size={18} color="var(--navy)" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
