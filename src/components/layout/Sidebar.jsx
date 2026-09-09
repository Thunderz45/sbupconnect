import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home, BookOpen, Clock, Bell, Hotel, Newspaper,
  Image, User, Settings, LogOut, GraduationCap, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',      label: 'Home',        icon: Home       },
  { id: 'notices',   label: 'Notices',     icon: Bell       },
  { id: 'notes',     label: 'Notes',       icon: BookOpen   },
  { id: 'timetable', label: 'Timetable',   icon: Clock      },
  { id: 'news',      label: 'News',        icon: Newspaper  },
  { id: 'gallery',   label: 'Gallery',     icon: Image      },
  { id: 'profile',   label: 'Profile',     icon: User       },
];

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }) {
  const { student, logout } = useAuth();

  const initials = (student?.name || 'S')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const isHostel = student?.hostel === 'Hostel Resident';

  const navItems = isHostel
    ? [...NAV_ITEMS.slice(0, 6), { id: 'hostel', label: 'Hostel', icon: Hotel }, NAV_ITEMS[6]]
    : NAV_ITEMS;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Profile */}
        <div className="sidebar-top">
          <div className="sidebar-profile">
            <div className="avatar">{initials}</div>
            <div>
              <div className="name">{student?.name || 'Student'}</div>
              <div className="dept">{student?.institute} · {student?.spec?.split(' ').slice(0, 2).join(' ')}</div>
              {isHostel && (
                <span className="badge badge-primary" style={{ marginTop: 4 }}>
                  Hostel Resident
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">Navigation</div>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => { onTabChange(id); onClose(); }}
            >
              <Icon size={18} />
              {label}
              {id === 'notices' && <span className="badge badge-danger" style={{ marginLeft: 'auto', fontSize: 10 }}>4</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="nav-item"
            style={{ color: '#EF4444', width: '100%' }}
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
