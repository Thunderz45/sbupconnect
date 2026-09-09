import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotices } from '../../context/NoticesContext';
import { LayoutDashboard, FileText, Calendar, Bell, PieChart, Newspaper, Images, Home, User, Settings, X } from 'lucide-react';

const NAV = [
  { id: 'home',       label: 'Dashboard',   icon: LayoutDashboard, group: 'Portal' },
  { id: 'notes',      label: 'Notes & PDFs', icon: FileText,       group: 'Portal' },
  { id: 'timetable',  label: 'Timetable',    icon: Calendar,       group: 'Portal' },
  { id: 'notices',    label: 'Notices',      icon: Bell,           group: 'Portal', badge: true },
  { id: 'attendance', label: 'Attendance',   icon: PieChart,       group: 'Portal' },
  { id: 'news',       label: 'News Feed',    icon: Newspaper,      group: 'Portal' },
  { id: 'gallery',    label: 'Campus Gallery',icon: Images,        group: 'Campus' },
  { id: 'hostel',     label: 'Hostel & Mess', icon: Home,          group: 'Campus', hostelOnly: true },
  { id: 'profile',    label: 'My Profile',   icon: User,           group: 'Account' },
  { id: 'settings',   label: 'Settings',     icon: Settings,       group: 'Account' },
];

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }) {
  const { student } = useAuth();
  const { unreadCount } = useNotices();

  const isHostel  = student?.hostel === 'Hostel Resident';
  const initials  = (student?.name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const groups    = [...new Set(NAV.map(n => n.group))];

  return (
    <>
      {/* Overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Profile */}
        <div style={{ padding: '14px 12px 6px' }}>
          <div className="sidebar-profile">
            <div className="sb-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="name">{student?.name}</div>
              <div className="dept">{student?.institute} · {student?.spec?.split(' ').slice(0, 2).join(' ')}</div>
            </div>
            <button onClick={onClose} style={{ display: 'none' }} className="close-sb">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 10px 16px', overflowY: 'auto' }}>
          {groups.map(group => {
            const items = NAV.filter(n => n.group === group && (!n.hostelOnly || isHostel));
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="nav-group-label">{group}</div>
                {items.map(({ id, label, icon: Icon, badge, hostelOnly }) => (
                  <button key={id}
                    className={`nav-item ${activeTab === id ? 'active' : ''}`}
                    onClick={() => { onTabChange(id); onClose(); }}>
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {badge && unreadCount > 0 && (
                      <span style={{ padding: '1px 7px', background: '#EF4444', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 800 }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>
          SBUP Connect v2.0 · {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
}
