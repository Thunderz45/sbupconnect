import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import HomeTab      from '../components/tabs/HomeTab';
import NotesTab     from '../components/tabs/NotesTab';
import TimetableTab from '../components/tabs/TimetableTab';
import NoticesTab   from '../components/tabs/NoticesTab';
import HostelTab    from '../components/tabs/HostelTab';
import NewsTab      from '../components/tabs/NewsTab';
import GalleryTab   from '../components/tabs/GalleryTab';
import ProfileTab   from '../components/tabs/ProfileTab';

const TABS = {
  home:      HomeTab,
  notes:     NotesTab,
  timetable: TimetableTab,
  notices:   NoticesTab,
  hostel:    HostelTab,
  news:      NewsTab,
  gallery:   GalleryTab,
  profile:   ProfileTab,
};

export default function Portal() {
  const { student, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !student) navigate('/');
  }, [student, loading, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/sbup-logo.png" alt="SBUP" className="loading-logo" />
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800 }}>SBUP Connect</div>
        <div style={{ fontSize: 14, opacity: 0.6, marginTop: 4 }}>Sri Balaji University Pune</div>
        <div className="spinner" />
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: '70%' }} />
        </div>
      </div>
    );
  }

  if (!student) return null;

  const TabComponent = TABS[activeTab] || HomeTab;

  return (
    <>
      <Header
        onMenuToggle={() => setSidebarOpen(v => !v)}
        onTabChange={handleTabChange}
      />
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-layout">
        <main className="page-content">
          <TabComponent onTabChange={handleTabChange} />
        </main>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
}
