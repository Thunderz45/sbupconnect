import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Search, Bell, Settings, LogOut } from 'lucide-react';

export default function Header({ onMenuToggle, onTabChange }) {
  const { student, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = (student?.name || 'S')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="app-header">
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <button
          className="header-brand"
          onClick={() => onTabChange('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <img src="/sbup-logo.png" alt="SBUP Logo" />
          <div className="header-brand-text" style={{ display: 'block' }}>
            <div className="title">SBUP <span>Connect</span></div>
            <div className="sub">Sri Balaji University Pune</div>
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="header-search">
        <Search size={16} color="var(--navy-400)" />
        <input placeholder="Search notes, notices, timetable…" />
      </div>

      {/* Right actions */}
      <div className="header-actions">
        <button className="icon-btn" onClick={() => onTabChange('notices')}>
          <Bell size={18} />
          <span className="notif-dot" />
        </button>

        <div style={{ position: 'relative' }}>
          <button className="user-chip" onClick={() => setShowUserMenu(v => !v)}>
            <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{initials}</div>
            <div style={{ display: 'none', flexDirection: 'column', textAlign: 'left' }} className="sm-block">
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>
                {student?.name?.split(' ')[0] || 'Student'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--navy-500)' }}>{student?.institute}</span>
            </div>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', width: 200,
              background: '#fff', border: '1px solid var(--navy-200)',
              borderRadius: 14, boxShadow: '0 8px 32px rgba(15,23,42,0.15)',
              overflow: 'hidden', zIndex: 200
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--navy-200)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>{student?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--navy-500)', marginTop: 2 }}>PRN: {student?.prn}</div>
              </div>
              <button className="nav-item" style={{ borderRadius: 0, width: '100%' }}
                onClick={() => { onTabChange('profile'); setShowUserMenu(false); }}>
                <Settings size={16} /> Settings
              </button>
              <button className="nav-item" style={{ borderRadius: 0, color: '#EF4444', width: '100%' }}
                onClick={logout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
