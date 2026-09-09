import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotices } from '../../context/NoticesContext';
import { NOTES_DATA } from '../../data/appData';
import { playNotificationSound, sendPhoneNotification } from '../../data/appData';
import { Menu, Search, Bell, Settings, LogOut, Smartphone, X, ChevronDown } from 'lucide-react';

const CAT_COLOR = {
  Academic: 'bg-sky-100 text-sky-700',
  Placement: 'bg-purple-100 text-purple-700',
  Events: 'bg-emerald-100 text-emerald-700',
  Hostel: 'bg-amber-100 text-amber-700'
};

function usePushPermission() {
  const [perm, setPerm] = useState(() =>
    'Notification' in window ? Notification.permission : 'denied'
  );
  const requestPush = async () => {
    if (!('Notification' in window)) return;
    if (perm === 'default') {
      const result = await Notification.requestPermission();
      setPerm(result);
      if (result === 'granted') {
        playNotificationSound();
        sendPhoneNotification({ id: Date.now(), title: 'Phone Notifications Activated!', body: 'You will now receive instant SBUP notices directly on this device.' });
      }
    } else if (perm === 'granted') {
      playNotificationSound();
      sendPhoneNotification({ id: Date.now(), title: 'SBUP Notification Test', body: 'Your phone notifications are connected and working perfectly!' });
    }
  };
  return { perm, requestPush };
}

export default function Header({ onMenuToggle, onTabChange }) {
  const { student, logout } = useAuth();
  const { notices, markAllRead, unreadCount } = useNotices();
  const { perm, requestPush } = usePushPermission();

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const initials = (student?.name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Bell ring on new unread
  useEffect(() => {
    if (unreadCount > 0) {
      setBellRinging(true);
      const t = setTimeout(() => setBellRinging(false), 900);
      return () => clearTimeout(t);
    }
  }, [unreadCount]);

  // Searchable content
  const searchResults = search.trim().length > 1 ? [
    ...NOTES_DATA.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()))
      .map(n => ({ type: 'Note', label: n.title, sub: n.subject, tab: 'notes' })),
    ...notices.filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
      .map(n => ({ type: 'Notice', label: n.title, sub: n.category, tab: 'notices' })),
  ].slice(0, 6) : [];

  const pushLabel = perm === 'granted' ? 'Active' : perm === 'denied' ? 'Blocked' : 'Enable';
  const pushColor = perm === 'granted' ? '#059669' : perm === 'denied' ? '#94A3B8' : '#0EA5E9';

  return (
    <header className="app-header">
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Menu">
          <Menu size={20} />
        </button>
        <button className="header-brand" onClick={() => onTabChange('home')}>
          <img src="/sbup-logo.png" alt="SBUP" />
          <div className="header-brand-text">
            <div className="title">SBUP <span>Connect</span></div>
            <div className="sub">Sri Balaji University Pune</div>
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="header-search" style={{ position: 'relative' }}>
        <Search size={16} color="var(--muted)" />
        <input
          placeholder="Search notes, notices, timetable…"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
        />
        {search && (
          <button onClick={() => { setSearch(''); setShowSearch(false); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        )}
        {showSearch && searchResults.length > 0 && (
          <div className="search-dropdown">
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-soft)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>Results</span>
              <button onClick={() => { setSearch(''); setShowSearch(false); }} style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
            </div>
            {searchResults.map((r, i) => (
              <div key={i} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onClick={() => { onTabChange(r.tab); setSearch(''); setShowSearch(false); }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                  {r.type === 'Note' ? '📄' : '🔔'}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.type} · {r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}>
            <Bell size={17} className={bellRinging ? 'bell-ringing' : ''} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <div className="notif-dropdown">
              {/* Header */}
              <div style={{ padding: '12px 16px', background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={16} color="var(--primary)" />
                  <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 14 }}>Notifications</span>
                  <span className={`badge ${unreadCount > 0 ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: 10 }}>
                    {unreadCount > 0 ? `${unreadCount} New` : '0 New'}
                  </span>
                </div>
                <button onClick={() => { markAllRead(); }} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Mark all read
                </button>
              </div>

              {/* Push Notification Banner */}
              <div style={{ padding: '10px 14px', background: 'linear-gradient(90deg, #F0F9FF, #EEF2FF)', borderBottom: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Smartphone size={14} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>Phone Notifications</div>
                    <div style={{ fontSize: 10, color: perm === 'granted' ? '#059669' : 'var(--primary-dark)', marginTop: 2 }}>
                      {perm === 'granted' ? 'Phone Notifications Active' : perm === 'denied' ? 'Notifications blocked in browser' : 'Receive alerts directly on your phone'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={requestPush}
                  disabled={perm === 'denied'}
                  style={{ padding: '5px 12px', borderRadius: 8, background: pushColor, color: '#fff', border: 'none', fontSize: 10, fontWeight: 700, cursor: perm === 'denied' ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: perm === 'denied' ? 0.6 : 1 }}>
                  {pushLabel}
                </button>
              </div>

              {/* Notice list */}
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notices.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No notifications right now.</div>
                ) : notices.slice(0, 6).map(n => (
                  <div key={n.id}
                    onClick={() => { onTabChange('notices'); setShowNotif(false); }}
                    style={{ padding: '12px 16px', display: 'flex', gap: 12, cursor: 'pointer', borderBottom: '1px solid var(--border)', background: n.isRead ? '#fff' : 'rgba(14,165,233,0.04)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}
                      className={CAT_COLOR[n.category] || 'bg-sky-100 text-sky-700'}>
                      {n.category?.charAt(0) || 'N'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: n.isRead ? 600 : 800, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                        {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body || ''}</div>
                      <div style={{ fontSize: 10, color: 'var(--primary-dark)', marginTop: 3 }}>{n.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px', textAlign: 'center', background: 'var(--bg-soft)', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => { onTabChange('notices'); setShowNotif(false); }} style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  View All Notices in Portal →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button className="user-chip" onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}>
            <div className="avatar">{initials}</div>
            <div style={{ display: 'none' }} className="xl-only">
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{student?.name?.split(' ')[0]}</span>
            </div>
            <ChevronDown size={12} color="var(--muted)" />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #F0F9FF, #EEF2FF)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 14 }}>{student?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{student?.institute} — {student?.spec?.split(' ').slice(0, 2).join(' ')}</div>
                {student?.hostel === 'Hostel Resident' && (
                  <span className="badge badge-primary" style={{ marginTop: 8, fontSize: 10 }}>
                    🏠 {student.hostelName} ({student.roomNo})
                  </span>
                )}
              </div>
              <div style={{ padding: 6 }}>
                <button className="nav-item" onClick={() => { onTabChange('profile'); setShowProfile(false); }}>
                  <Settings size={15} /> My Profile
                </button>
                <button className="nav-item" onClick={() => logout()} style={{ color: '#EF4444' }}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
