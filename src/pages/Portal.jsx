import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NoticesProvider, useNotices } from '../context/NoticesContext';
import { playNotificationSound } from '../data/appData';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import HomeTab       from '../components/tabs/HomeTab';
import NotesTab      from '../components/tabs/NotesTab';
import TimetableTab  from '../components/tabs/TimetableTab';
import NoticesTab    from '../components/tabs/NoticesTab';
import AttendanceTab from '../components/tabs/AttendanceTab';
import NewsTab       from '../components/tabs/NewsTab';
import GalleryTab    from '../components/tabs/GalleryTab';
import HostelTab     from '../components/tabs/HostelTab';
import ProfileTab    from '../components/tabs/ProfileTab';
import SettingsTab   from '../components/tabs/SettingsTab';
import { X, Bell } from 'lucide-react';

const TABS = {
  home:       HomeTab,
  notes:      NotesTab,
  timetable:  TimetableTab,
  notices:    NoticesTab,
  attendance: AttendanceTab,
  news:       NewsTab,
  gallery:    GalleryTab,
  hostel:     HostelTab,
  profile:    ProfileTab,
  settings:   SettingsTab,
};

// In-app notification toast
function NotifToastContainer({ onTabChange }) {
  const { notices } = useNotices();
  const [toasts, setToasts] = useState([]);
  const prevCount = React.useRef(notices.filter(n => !n.isRead).length);

  useEffect(() => {
    const unread = notices.filter(n => !n.isRead);
    if (unread.length > prevCount.current) {
      // New notice arrived
      const newOne = unread[0];
      const id = Date.now();
      setToasts(t => [...t, { ...newOne, toastId: id }]);
      setTimeout(() => setToasts(t => t.filter(x => x.toastId !== id)), 7000);
    }
    prevCount.current = unread.length;
  }, [notices]);

  const dismiss = (toastId) => setToasts(t => t.filter(x => x.toastId !== toastId));

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.toastId} className="notif-toast">
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', border: '2px solid #BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(14,165,233,0.2)' }}>
            <img src="/sbup-logo.png" alt="SBUP" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 800, background: '#EFF6FF', color: 'var(--primary-dark)', padding: '1px 8px', borderRadius: 99 }}>
                {toast.category || 'Notice'}
              </span>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>Just now</span>
            </div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 13, color: 'var(--navy)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{toast.title}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{toast.body}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => { onTabChange('notices'); dismiss(toast.toastId); }} style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                View Notice →
              </button>
              <button onClick={() => dismiss(toast.toastId)} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={() => dismiss(toast.toastId)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function PortalInner() {
  const { student, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !student) navigate('/');
  }, [student, loading, navigate]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [setSearchParams]);

  // Service Worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(r => console.log('SW ready:', r.scope))
          .catch(e => console.warn('SW registration failed:', e));
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/sbup-logo.png" alt="SBUP" style={{ height: 64, marginBottom: 20, objectFit: 'contain' }} />
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 900, color: 'var(--navy)' }}>SBUP Connect</div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>Sri Balaji University Pune</div>
        <div className="spin-ring" style={{ marginTop: 32 }} />
        <div className="progress-track" style={{ width: 200, marginTop: 20 }}>
          <div className="progress-fill" style={{ width: '75%' }} />
        </div>
      </div>
    );
  }
  if (!student) return null;

  const TabComponent = TABS[activeTab] || HomeTab;

  return (
    <>
      <Header onMenuToggle={() => setSidebarOpen(v => !v)} onTabChange={handleTabChange} />
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-layout">
        <main className="page-content">
          <TabComponent onTabChange={handleTabChange} />
        </main>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <NotifToastContainer onTabChange={handleTabChange} />
    </>
  );
}

export default function Portal() {
  return (
    <NoticesProvider>
      <PortalInner />
    </NoticesProvider>
  );
}
