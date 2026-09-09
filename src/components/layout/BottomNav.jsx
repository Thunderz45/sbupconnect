import React from 'react';
import { useNotices } from '../../context/NoticesContext';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, Bell, PieChart, Home, User } from 'lucide-react';

const TABS = [
  { id: 'home',       label: 'Home',      icon: LayoutDashboard },
  { id: 'notes',      label: 'Notes',     icon: FileText },
  { id: 'notices',    label: 'Notices',   icon: Bell, badge: true },
  { id: 'attendance', label: 'Attendance',icon: PieChart },
  { id: 'profile',    label: 'Profile',   icon: User },
];

export default function BottomNav({ activeTab, onTabChange }) {
  const { unreadCount } = useNotices();
  const { student } = useAuth();

  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, label, icon: Icon, badge }) => (
        <button key={id} className={`bottom-nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => onTabChange(id)}>
          <div style={{ position: 'relative' }}>
            <Icon size={20} />
            {badge && unreadCount > 0 && <span className="bottom-nav-dot" />}
          </div>
          {label}
        </button>
      ))}
    </nav>
  );
}
