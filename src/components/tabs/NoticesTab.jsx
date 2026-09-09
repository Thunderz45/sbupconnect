import React, { useState } from 'react';
import { useNotices } from '../../context/NoticesContext';
import { CheckCircle, ChevronDown, ChevronUp, Download, Bell } from 'lucide-react';

const CAT_COLORS = {
  Academic: { chip: 'badge-primary', dot: '#0EA5E9' },
  Placement: { chip: 'badge-purple', dot: '#8B5CF6' },
  Events: { chip: 'badge-success', dot: '#10B981' },
  Hostel: { chip: 'badge-warning', dot: '#F59E0B' },
};

export default function NoticesTab() {
  const { notices, markRead, markAllRead, unreadCount } = useNotices();
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  const cats = ['all', 'Academic', 'Placement', 'Events', 'Hostel'];
  const filtered = filter === 'all' ? notices : notices.filter(n => n.category === filter);

  const handleExpand = (id) => {
    setExpanded(v => v === id ? null : id);
    markRead(id);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="page-title">Notices</div>
          {unreadCount > 0 && (
            <span className="badge badge-danger">{unreadCount} Unread</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <div className="page-sub">Official academic notices and announcements</div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="filter-chips">
        {cats.map(cat => (
          <button key={cat} className={`filter-chip ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
            {cat === 'all' ? 'All Notices' : cat}
          </button>
        ))}
      </div>

      {/* Notices list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
            <Bell size={48} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
            No notices in this category.
          </div>
        ) : filtered.map(n => {
          const colors = CAT_COLORS[n.category] || { chip: 'badge-primary', dot: '#0EA5E9' };
          return (
            <div key={n.id} className="dash-card" style={{ borderLeft: `3px solid ${n.isRead ? '#E2E8F0' : colors.dot}`, background: n.isRead ? '#fff' : 'rgba(14,165,233,0.025)' }}>
              {/* Header row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${colors.chip}`}>{n.category}</span>
                  {n.priority === 'Important' && <span className="badge badge-warning">High Priority</span>}
                  {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{n.date}</span>
              </div>

              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6, cursor: 'pointer' }}
                onClick={() => handleExpand(n.id)}>
                {n.title}
              </div>

              {/* Expandable body */}
              {expanded === n.id && (
                <div style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.7, marginBottom: 12, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  {n.body}
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
                <span>Issued by <strong style={{ color: 'var(--navy)' }}>{n.author}</strong></span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleExpand(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {expanded === n.id ? <><ChevronUp size={13} /> Collapse</> : <><ChevronDown size={13} /> Read More</>}
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Download size={13} /> Download
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
