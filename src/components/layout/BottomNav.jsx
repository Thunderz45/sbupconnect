import React from 'react';
import { Home, Bell, BookOpen, Clock, User } from 'lucide-react';

const ITEMS = [
  { id: 'home',    label: 'Home',    icon: Home     },
  { id: 'notices', label: 'Notices', icon: Bell     },
  { id: 'notes',   label: 'Notes',   icon: BookOpen },
  { id: 'timetable', label: 'Time',  icon: Clock    },
  { id: 'profile', label: 'Profile', icon: User     },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`bottom-nav-item ${activeTab === id ? 'active' : ''}`}
          onClick={() => onTabChange(id)}
        >
          <Icon size={22} />
          {label}
        </button>
      ))}
    </nav>
  );
}
