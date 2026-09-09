import React, { useState } from 'react';
import { Bell, CheckCheck, X, ChevronDown, ChevronUp } from 'lucide-react';

const INITIAL_NOTICES = [
  { id: 1, title: 'Mid-Term Examination Hall Ticket Generation Active', category: 'Academic', priority: 'Important', date: 'Today, 09:30 AM', author: 'Examination Cell SBUP', isRead: false, body: 'All Sem 4 students of BIMM, BITM, BIIB & BIMHRD can now download their official mid-term examination hall tickets. Hall tickets must be printed and stamped by the institute office before 10 Sep 2026.' },
  { id: 2, title: 'Campus Placement Drive: Deloitte US-India & KPMG', category: 'Placement', priority: 'Important', date: 'Yesterday', author: 'Corporate Relations & Placement Cell', isRead: false, body: 'Pre-placement talk and online technical test for Data Science & Finance specializations will take place in the Main Auditorium tomorrow at 10:00 AM. Attendance is mandatory for shortlisted candidates.' },
  { id: 3, title: 'SBUP Annual Cultural Fest 2026 Registrations Open', category: 'Events', priority: 'Normal', date: '04 Sep 2026', author: 'Student Cultural Committee', isRead: false, body: 'Registrations for music, band, street play, and dance competitions for Astitva Cultural Fest 2026 are now open. Prize pool of Rs. 2.5 Lakhs across categories.' },
  { id: 4, title: 'Hostel Night Entry Timings & Gate Pass Circular', category: 'Hostel', priority: 'Important', date: '02 Sep 2026', author: 'Chief Rector & Hostel Office', isRead: false, body: 'Students leaving campus post 08:30 PM must submit an online Gate Pass Request through the SBUP Connect portal. Gate passes must be approved by the hostel warden prior to exit.' },
];

const CAT_COLORS = {
  Academic:  { bg: '#E0F2FE', color: '#0369A1' },
  Placement: { bg: '#EDE9FE', color: '#7C3AED' },
  Events:    { bg: '#D1FAE5', color: '#065F46' },
  Hostel:    { bg: '#FEF3C7', color: '#92400E' },
};

export default function NoticesTab() {
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  const markRead = (id) => setNotices(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
  const markAllRead = () => setNotices(n => n.map(x => ({ ...x, isRead: true })));

  const unreadCount = notices.filter(n => !n.isRead).length;
  const categories = ['all', ...new Set(notices.map(n => n.category))];
  const filtered = notices.filter(n => filter === 'all' || n.category === filter);

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Notices
            {unreadCount > 0 && <span className="badge badge-danger">{unreadCount} Unread</span>}
          </div>
          <div className="page-sub">Official announcements from SBUP</div>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="notes-filter">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Notices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(notice => {
          const c = CAT_COLORS[notice.category] || { bg: '#E0F2FE', color: '#0369A1' };
          const isExpanded = expanded === notice.id;
          return (
            <div
              key={notice.id}
              className={`notice-card ${!notice.isRead ? 'unread' : ''}`}
              onClick={() => { setExpanded(isExpanded ? null : notice.id); markRead(notice.id); }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: c.bg, color: c.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2
                }}>
                  <Bell size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span className="badge" style={{ background: c.bg, color: c.color }}>{notice.category}</span>
                    {notice.priority === 'Important' && <span className="badge badge-danger">Important</span>}
                    {!notice.isRead && <span className="badge badge-primary">New</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.4 }}>
                    {notice.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--navy-500)', marginTop: 4 }}>
                    {notice.author} · {notice.date}
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: 12, fontSize: 14, color: 'var(--navy-700)', lineHeight: 1.6 }}>
                      {notice.body}
                    </div>
                  )}
                </div>
                <div style={{ color: 'var(--navy-400)', flexShrink: 0, marginTop: 2 }}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--navy-400)' }}>
            <Bell size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>No notices in this category</div>
          </div>
        )}
      </div>
    </div>
  );
}
