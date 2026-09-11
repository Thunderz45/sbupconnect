import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getStudentAttendance, getNotes, getTimetable, getNotices,
  getDailyNews, getActiveNotifications, markNotificationAsRead,
  getFaculty, subscribeToSync
} from '../firebase/service';
import {
  LogOut, GraduationCap, Calendar, Clock, BookOpen,
  Bell, FileText, CheckCircle2, ChevronRight,
  User, Award, HelpCircle, ArrowLeft, ArrowRight, Download,
  ExternalLink, Pin, AlertTriangle, Info, MessageSquare,
  X, Check, Sparkles, Building2, Hash, Layers,
  LayoutDashboard, Coffee, Menu, Search, ShieldCheck
} from 'lucide-react';

export default function StudentDashboard() {
  const { student, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { page } = useParams();

  // Active page resolution: defaults to 'overview'
  const validPages = ['overview', 'timetable', 'notes', 'attendance', 'notices', 'news', 'faculty', 'profile'];
  const activeTab = validPages.includes(page) ? page : 'overview';

  // Data states
  const [attendance, setAttendance] = useState({ attendance: 0, lastUpdated: 'Not recorded yet' });
  const [notes, setNotes] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [notices, setNotices] = useState([]);
  const [news, setNews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [fetching, setFetching] = useState(true);

  // UI states
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notesFilter, setNotesFilter] = useState('all');
  const [notesSearch, setNotesSearch] = useState('');
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!student) return;
    loadDashboardData(true);

    // Real-time synchronization subscription
    const unsubscribe = subscribeToSync((event) => {
      // Background reload without disturbing the user's view
      loadDashboardData(false);
    });

    return () => unsubscribe();
  }, [student]);

  const loadDashboardData = async (showSpinner = true) => {
    if (showSpinner) setFetching(true);
    try {
      const [attData, notesData, ttData, noticesData, newsData, notifData, facData] = await Promise.all([
        getStudentAttendance(student.rollNumber),
        getNotes(student.institute, student.specialization),
        getTimetable(student.institute, student.semester),
        getNotices(student.institute),
        getDailyNews(),
        getActiveNotifications(),
        getFaculty(student.institute)
      ]);

      setAttendance(attData || { rollNumber: student.rollNumber, attendance: 0, lastUpdated: 'Not recorded yet' });
      setNotes(notesData || []);
      setTimetable(ttData || null);
      setNotices(noticesData || []);
      setNews(newsData || []);
      setNotifications(notifData || []);
      setFaculty(facData || []);

      // Auto-set selected day to today if weekday
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(today)) {
        setSelectedDay(today);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
    if (showSpinner) setFetching(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/sbup-logo.png" alt="SBUP" style={{ height: 64, marginBottom: 20, objectFit: 'contain' }} />
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 900, color: 'var(--navy)' }}>SBUP Connect</div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>Sri Balaji University Pune</div>
        <div className="btn-spinner" style={{ marginTop: 32, width: 32, height: 32 }} />
      </div>
    );
  }

  if (!student) {
    navigate('/');
    return null;
  }

  const initials = (student.name || '')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationClick = async (notifId) => {
    await markNotificationAsRead(notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleTabSelect = (tabId) => {
    if (tabId === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tabId}`);
    }
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const topAnnouncement = notifications.find(n => n.type === 'urgent' || n.type === 'exam') || notifications[0];

  // Schedule filtering by day
  const filteredSchedule = timetable?.schedule?.filter(s => s.day === selectedDay) || [];

  // Notes filtering by search & subject
  const filteredNotes = notes.filter(n => {
    const matchSubject = notesFilter === 'all' || (n.subject || '').toLowerCase() === notesFilter.toLowerCase();
    const matchQuery = !notesSearch || (
      (n.title || '').toLowerCase().includes(notesSearch.toLowerCase()) ||
      (n.subject || '').toLowerCase().includes(notesSearch.toLowerCase()) ||
      (n.facultyName || '').toLowerCase().includes(notesSearch.toLowerCase())
    );
    return matchSubject && matchQuery;
  });

  const uniqueSubjects = Array.from(new Set(notes.map(n => n.subject).filter(Boolean)));

  // Notices filtering
  const filteredNotices = notices.filter(n => {
    if (noticeCategoryFilter === 'all') return true;
    return (n.category || '').toLowerCase() === noticeCategoryFilter.toLowerCase();
  });

  const attPct = attendance.attendance ?? 85;
  const isGoodAttendance = attPct >= 75;

  // Sidebar Menu Items
  const menuItems = [
    { id: 'overview',   label: 'Overview',          icon: LayoutDashboard, badge: null },
    { id: 'timetable',  label: 'Timetable',         icon: Clock,           badge: filteredSchedule.length ? `${filteredSchedule.length} slots` : null },
    { id: 'notes',      label: 'Notes & Materials', icon: BookOpen,        badge: notes.length > 0 ? `${notes.length}` : null },
    { id: 'attendance', label: 'Attendance',        icon: CheckCircle2,    badge: `${attPct}%` },
    { id: 'notices',    label: 'Important Notices', icon: Bell,            badge: notices.length > 0 ? `${notices.length}` : null },
    { id: 'news',       label: 'Daily News',        icon: Sparkles,        badge: null },
    { id: 'faculty',    label: 'Faculty Directory', icon: Building2,       badge: faculty.length > 0 ? `${faculty.length}` : null },
    { id: 'profile',    label: 'Student Profile',   icon: User,            badge: 'Verified' },
  ];

  return (
    <div className="sd-layout">

      {/* ── MOBILE BACKDROP ────────────────────────────────────── */}
      <div
        className={`sd-overlay${mobileSidebarOpen ? ' active' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* ── LEFT SIDEBAR NAVIGATION ────────────────────────────── */}
      <aside className={`sd-sidebar${mobileSidebarOpen ? ' open' : ''}`} style={{ background: '#0F172A', color: '#fff', justifyContent: 'space-between' }}>
        
        {/* Top Branding & Student Card */}
        <div>
          {/* University Branding */}
          <div style={{
            padding: '22px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/sbup-logo.png" alt="SBUP" style={{ height: 36, filter: 'brightness(0) invert(1)' }} />
              <div>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '-0.02em' }}>
                  SBUP <span style={{ color: '#38BDF8' }}>Connect</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Student Portal</div>
              </div>
            </div>

            {/* Mobile close */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              className="mobile-close-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Student Profile Quick Badge */}
          <div style={{
            margin: '14px 12px',
            padding: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0284C7, #0369A1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              flexShrink: 0
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {student.name || 'Student'}
              </div>
              <div style={{ fontSize: 11, color: '#38BDF8', fontFamily: 'monospace', fontWeight: 600 }}>
                {student.rollNumber}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {student.institute} • {student.semester || 'Sem 1'}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 'calc(100vh - 290px)', overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', padding: '6px 12px 4px' }}>
              Navigation Menu
            </div>
            {menuItems.map(({ id, label, icon: Icon, badge }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  id={`sidebar-nav-${id}`}
                  onClick={() => handleTabSelect(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: 12,
                    border: 'none',
                    background: active ? '#0284C7' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: active ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <Icon size={17} color={active ? '#fff' : '#94A3B8'} />
                    <span>{label}</span>
                  </div>

                  {badge && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                      background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                      color: active ? '#fff' : 'rgba(255,255,255,0.6)'
                    }}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: '#10B981',
            fontWeight: 700,
            marginBottom: 12,
            padding: '6px 10px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: 8
          }}>
            <ShieldCheck size={14} />
            <span>Verified Student Account</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={() => navigate('/portal')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Portal</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 10,
                border: '1px solid #7F1D1D',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#FCA5A5',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA (PAGES) ─────────────────────────── */}
      <div className="sd-main">
        
        {/* ── TOP NOTIFICATION BANNER (IF ACTIVE) ─────────────── */}
        {!dismissedBanner && topAnnouncement && (
          <div style={{
            background: topAnnouncement.type === 'urgent'
              ? 'linear-gradient(90deg, #DC2626 0%, #B91C1C 100%)'
              : topAnnouncement.type === 'exam'
              ? 'linear-gradient(90deg, #D97706 0%, #B45309 100%)'
              : 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)',
            color: '#fff',
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            zIndex: 110,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0
              }}>
                {topAnnouncement.type}
              </span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong>{topAnnouncement.title}:</strong> {topAnnouncement.message}
              </span>
            </div>

            <button
              onClick={() => setDismissedBanner(true)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── TOP APP HEADER BAR ──────────────────────────────── */}
        <header className="sd-topbar" style={{ justifyContent: 'space-between' }}>
          {/* Breadcrumb & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              id="sd-hamburger-btn"
              onClick={() => setMobileSidebarOpen(true)}
              className="sd-hamburger"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SBUP Student Portal
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {menuItems.find(m => m.id === activeTab)?.label || 'Overview'}
              </div>
            </div>
          </div>

          {/* Right Actions: Notifications & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                id="notifications-bell-btn"
                onClick={() => setNotifDropdownOpen(v => !v)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: '1.5px solid var(--border)',
                  background: notifDropdownOpen ? '#EFF6FF' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  color: notifDropdownOpen ? 'var(--primary)' : 'var(--slate)'
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 800,
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 50,
                  right: 0,
                  width: 'min(340px, calc(100vw - 32px))',
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  boxShadow: '0 12px 36px rgba(15, 23, 42, 0.12)',
                  padding: '16px',
                  zIndex: 200,
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)' }}>Notifications & Alerts</div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{unreadCount} unread</span>
                  </div>

                  <div style={{ maxHeight: 320, overflowY: 'auto', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--muted)', fontSize: 13 }}>
                        No notifications at this time
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n.id)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: n.read ? '#F8FAFC' : '#EFF6FF',
                            border: n.read ? '1px solid #E2E8F0' : '1px solid #BFDBFE',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{n.title}</span>
                            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{n.date}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.4 }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar button */}
            <button
              id="student-profile-btn"
              onClick={() => handleTabSelect('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px 6px 8px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: activeTab === 'profile' ? '#EFF6FF' : '#fff',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {initials}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2 }}>{student.name?.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{student.rollNumber}</div>
              </div>
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ROUTER ───────────────────────────────────── */}
        <main className="sd-content">
          
          {/* ======================================================== */}
          {/* 1. SEPARATE PAGE: OVERVIEW                               */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.2s ease' }}>

              {/* ─────────────────────────────────────────────────── */}
              {/* UNIVERSITY CAMPUS VIDEO HERO                        */}
              {/* ─────────────────────────────────────────────────── */}
              <div className="video-hero">
                <video
                  id="campus-tour-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  poster="/sbup-campus.jpg"
                >
                  <source src="/sbup-campus-tour.mp4" type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
                <div className="video-hero-overlay">
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 14 }}>🎓 Sri Balaji University Pune — Campus Tour</div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Tathawade Campus, Pune — A Bird's Eye View</div>
                </div>
              </div>

              {/* HERO WELCOME BANNER */}
              <div style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #0369A1 100%)',
                borderRadius: 20,
                padding: '30px 32px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 20,
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)'
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 99, fontSize: 12, fontWeight: 600, color: '#38BDF8', marginBottom: 12, backdropFilter: 'blur(6px)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }} />
                    {student.institute || 'SBUP'} • {student.semester || 'Semester 1'}
                  </div>
                  <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Welcome back, {student.name?.split(' ')[0] || 'Student'}! 👋
                  </h1>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6, maxWidth: 540 }}>
                    Specialization: <strong>{student.specialization || 'Management Studies'}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.1)', padding: '14px 20px', borderRadius: 16, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 18,
                    color: '#fff'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Verified Roll Number</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#fff' }}>{student.rollNumber}</div>
                  </div>
                </div>
              </div>

              {/* 4 QUICK METRICS CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                
                {/* 1. Attendance Snapshot */}
                <div
                  onClick={() => handleTabSelect('attendance')}
                  style={{
                    background: '#fff',
                    padding: '20px 22px',
                    borderRadius: 18,
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Attendance</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--navy)', marginTop: 4 }}>{attPct}%</div>
                    <div style={{ fontSize: 11, color: isGoodAttendance ? '#059669' : '#DC2626', fontWeight: 700, marginTop: 4 }}>
                      {isGoodAttendance ? '● Good Standing' : '● Warning (<75%)'}
                    </div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isGoodAttendance ? '#ECFDF5' : '#FEF2F2', color: isGoodAttendance ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={22} />
                  </div>
                </div>

                {/* 2. Today's Classes */}
                <div
                  onClick={() => handleTabSelect('timetable')}
                  style={{
                    background: '#fff',
                    padding: '20px 22px',
                    borderRadius: 18,
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Classes ({selectedDay})</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--navy)', marginTop: 4 }}>{filteredSchedule.length}</div>
                    <div style={{ fontSize: 11, color: 'var(--primary-dark)', fontWeight: 600, marginTop: 4 }}>View Timetable →</div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={22} />
                  </div>
                </div>

                {/* 3. Study Notes */}
                <div
                  onClick={() => handleTabSelect('notes')}
                  style={{
                    background: '#fff',
                    padding: '20px 22px',
                    borderRadius: 18,
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Study Notes</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--navy)', marginTop: 4 }}>{notes.length}</div>
                    <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600, marginTop: 4 }}>Browse Material →</div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={22} />
                  </div>
                </div>

                {/* 4. Active Notices */}
                <div
                  onClick={() => handleTabSelect('notices')}
                  style={{
                    background: '#fff',
                    padding: '20px 22px',
                    borderRadius: 18,
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Campus Notices</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--navy)', marginTop: 4 }}>{notices.length}</div>
                    <div style={{ fontSize: 11, color: '#D97706', fontWeight: 600, marginTop: 4 }}>Read Updates →</div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={22} />
                  </div>
                </div>

              </div>

              {/* TODAY'S SCHEDULE SNAPSHOT & NOTICES GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
                
                {/* Schedule Snapshot */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={18} color="var(--primary)" />
                      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>Today's Lectures ({selectedDay})</h2>
                    </div>
                    <button
                      onClick={() => handleTabSelect('timetable')}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-dark)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Full Timetable →
                    </button>
                  </div>

                  {filteredSchedule.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 14px', color: 'var(--muted)', background: '#F8FAFC', borderRadius: 12 }}>
                      No lectures scheduled for {selectedDay}.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {filteredSchedule.slice(0, 3).map((slot, idx) => (
                        <div key={idx} style={{ padding: '12px 14px', borderRadius: 12, background: '#F8FAFC', borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy)' }}>{slot.subject}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Faculty: {slot.faculty}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-dark)', background: '#E0F2FE', padding: '2px 8px', borderRadius: 6 }}>
                              {slot.time}
                            </div>
                            {slot.breakTime && (
                              <div style={{ fontSize: 10, color: '#D97706', marginTop: 4 }}>Break: {slot.breakTime}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Important Notices Preview */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Bell size={18} color="#D97706" />
                      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>Recent Campus Notices</h2>
                    </div>
                    <button
                      onClick={() => handleTabSelect('notices')}
                      style={{ background: 'none', border: 'none', color: '#D97706', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      View All →
                    </button>
                  </div>

                  {notices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 14px', color: 'var(--muted)', background: '#F8FAFC', borderRadius: 12 }}>
                      No notices currently posted.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {notices.slice(0, 3).map(notice => (
                        <div key={notice.id} style={{ padding: '12px 14px', borderRadius: 12, background: notice.isPinned ? '#FFFBEB' : '#F8FAFC', border: notice.isPinned ? '1px solid #FDE68A' : '1px solid #F1F5F9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4 }}>
                              {notice.category}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{notice.date}</span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy)' }}>{notice.title}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* TEACHER CHAT & QUICK LINKS */}
              <div style={{
                background: '#fff',
                borderRadius: 18,
                border: '1.5px dashed #CBD5E1',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>Teacher Chat</div>
                      <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                        COMING SOON
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Direct faculty messaging system is currently under scheduled deployment.</div>
                  </div>
                </div>

                <button
                  onClick={() => handleTabSelect('faculty')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)'
                  }}
                >
                  <span>View Faculty Directory</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 2. SEPARATE PAGE: TIMETABLE                              */}
          {/* ======================================================== */}
          {activeTab === 'timetable' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease' }}>
              
              {/* Header Box */}
              <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: 18,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#EFF6FF', borderRadius: 99, color: 'var(--primary-dark)', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                    <Building2 size={12} /> {student.institute} • {student.semester || 'Semester 1'}
                  </div>
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--navy)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Academic Timetable
                  </h1>
                  <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>
                    Official lecture schedule with faculty names, break periods, and classroom locations.
                  </p>
                </div>

                {/* Day Selector Pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', paddingBottom: 4 }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        border: selectedDay === day ? 'none' : '1.5px solid var(--border)',
                        background: selectedDay === day ? 'var(--primary)' : '#fff',
                        color: selectedDay === day ? '#fff' : 'var(--slate)',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timetable Schedule Cards Grid */}
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>
                    Schedule for {selectedDay}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                    {filteredSchedule.length} Lecture Slot{filteredSchedule.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {filteredSchedule.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)', background: '#F8FAFC', borderRadius: 14 }}>
                    <Clock size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>No lecture slots scheduled</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>There are no classes scheduled for {selectedDay}.</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {filteredSchedule.map((slot, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '18px 20px',
                          borderRadius: 14,
                          background: '#F8FAFC',
                          border: '1px solid #F1F5F9',
                          borderLeft: '4px solid var(--primary)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-dark)', background: '#E0F2FE', padding: '3px 10px', borderRadius: 6 }}>
                            {slot.time}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {slot.breakTime && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Coffee size={12} /> Break: {slot.breakTime}
                              </span>
                            )}
                            {slot.room && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', background: '#fff', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                {slot.room}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.3 }}>
                          {slot.subject}
                        </div>

                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          Faculty: <strong style={{ color: 'var(--slate)' }}>{slot.faculty || 'Assigned Professor'}</strong>
                        </div>

                        {slot.remarks && (
                          <div style={{ fontSize: 11, color: '#0369A1', background: '#F0F9FF', padding: '6px 10px', borderRadius: 6, border: '1px solid #E0F2FE' }}>
                            <strong>Remark:</strong> {slot.remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 3. SEPARATE PAGE: NOTES & STUDY MATERIALS                */}
          {/* ======================================================== */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease' }}>
              
              {/* Header Box */}
              <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: 18,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#F5F3FF', borderRadius: 99, color: '#7C3AED', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                    <BookOpen size={12} /> {student.institute} • {student.specialization}
                  </div>
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--navy)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Course Notes & Study Materials
                  </h1>
                  <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>
                    Download official lecture presentations, notes, syllabus outlines, and reading references.
                  </p>
                </div>

                <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                  <strong>{filteredNotes.length}</strong> Document{filteredNotes.length !== 1 ? 's' : ''} Available
                </div>
              </div>

              {/* Filter Bar */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 240px' }}>
                  <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search notes by subject, title or professor..."
                    value={notesSearch}
                    onChange={e => setNotesSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: 12,
                      border: '1.5px solid var(--border)',
                      background: '#fff',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Subject Filter Pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setNotesFilter('all')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: notesFilter === 'all' ? 'none' : '1px solid var(--border)',
                      background: notesFilter === 'all' ? '#7C3AED' : '#fff',
                      color: notesFilter === 'all' ? '#fff' : 'var(--slate)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    All Subjects
                  </button>
                  {uniqueSubjects.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setNotesFilter(sub)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: notesFilter === sub ? 'none' : '1px solid var(--border)',
                        background: notesFilter === sub ? '#7C3AED' : '#fff',
                        color: notesFilter === sub ? '#fff' : 'var(--slate)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Grid */}
              {filteredNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)', background: '#fff', borderRadius: 18, border: '1px solid var(--border)' }}>
                  <FileText size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>No notes found</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Try clearing the search or changing the subject filter.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                  {filteredNotes.map(note => (
                    <div
                      key={note.id}
                      style={{
                        padding: '20px',
                        borderRadius: 16,
                        background: '#fff',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 16
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '3px 8px', borderRadius: 6 }}>
                            {note.subject}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{note.uploadDate}</span>
                        </div>

                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginTop: 10, lineHeight: 1.35 }}>
                          {note.title}
                        </div>

                        {note.facultyName && (
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                            Faculty: <strong style={{ color: 'var(--slate)' }}>{note.facultyName}</strong>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileText size={14} color="#7C3AED" />
                          {note.fileName || 'Document.pdf'}
                        </span>

                        <button
                          onClick={() => alert(`Downloading note: ${note.title}\nFile: ${note.fileName || 'Document.pdf'}`)}
                          style={{
                            padding: '7px 16px',
                            borderRadius: 10,
                            background: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* 4. SEPARATE PAGE: ATTENDANCE                             */}
          {/* ======================================================== */}
          {activeTab === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease' }}>
              
              {/* Header Box */}
              <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: 18,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#EFF6FF', borderRadius: 99, color: 'var(--primary-dark)', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                    <CheckCircle2 size={12} /> Verified Biometric & ERP Log
                  </div>
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--navy)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Attendance Analytics & Status
                  </h1>
                  <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>
                    Live academic attendance record verified by university administration.
                  </p>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 12,
                  background: isGoodAttendance ? '#ECFDF5' : '#FEF2F2',
                  border: isGoodAttendance ? '1px solid #A7F3D0' : '1px solid #FECACA',
                  color: isGoodAttendance ? '#059669' : '#DC2626',
                  fontWeight: 800,
                  fontSize: 13
                }}>
                  {isGoodAttendance ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{isGoodAttendance ? 'Good Standing (>75%)' : 'Attendance Warning (<75%)'}</span>
                </div>
              </div>

              {/* Main Attendance Analytics Card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                
                {/* Visual Progress Card */}
                <div style={{
                  background: '#fff',
                  borderRadius: 18,
                  border: '1px solid var(--border)',
                  padding: '28px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  flexWrap: 'wrap',
                  gap: 20
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Overall Cumulative
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--navy)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: 4 }}>
                      {attPct}%
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      Last Synced: <strong>{attendance.lastUpdated || 'Recent'}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: isGoodAttendance ? '#059669' : '#DC2626', fontWeight: 600, marginTop: 8 }}>
                      {isGoodAttendance
                        ? '✓ You meet the mandatory 75% attendance criteria'
                        : '⚠ Warning: Below university minimum criteria (75%)'}
                    </div>
                  </div>

                  {/* Large Ring */}
                  <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="110" height="110" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={isGoodAttendance ? '#10B981' : '#EF4444'}
                        strokeDasharray={`${attPct}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', fontSize: 20, fontWeight: 900, color: 'var(--navy)' }}>
                      {attPct}%
                    </div>
                  </div>
                </div>

                {/* Term & Criteria Card */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>Academic Attendance Guidelines</div>
                    <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 8, lineHeight: 1.5 }}>
                      As per SBUP Academic Regulations, a minimum of <strong>75% attendance</strong> in all lectures, practicals, and seminars is mandatory to be eligible to appear for the semester end examinations.
                    </p>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>Institute:</span>
                      <strong style={{ color: 'var(--navy)' }}>{student.institute}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>Semester:</span>
                      <strong style={{ color: 'var(--navy)' }}>{student.semester || 'Semester 1'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>Examination Eligibility:</span>
                      <strong style={{ color: isGoodAttendance ? '#059669' : '#DC2626' }}>
                        {isGoodAttendance ? 'Eligible' : 'Action Required'}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 5. SEPARATE PAGE: IMPORTANT NOTICES                      */}
          {/* ======================================================== */}
          {activeTab === 'notices' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease' }}>
              
              {/* Header Box */}
              <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: 18,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#FFFBEB', borderRadius: 99, color: '#D97706', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                    <Bell size={12} /> Official University Circulars
                  </div>
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--navy)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Important Notices
                  </h1>
                  <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>
                    Examination dates, academic deadlines, hall tickets, fee schedules, and official announcements.
                  </p>
                </div>

                <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                  <strong>{filteredNotices.length}</strong> Notice{filteredNotices.length !== 1 ? 's' : ''} Posted
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['all', 'Examination', 'Academic', 'Event', 'Fees'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNoticeCategoryFilter(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: noticeCategoryFilter === cat ? 'none' : '1px solid var(--border)',
                      background: noticeCategoryFilter === cat ? '#D97706' : '#fff',
                      color: noticeCategoryFilter === cat ? '#fff' : 'var(--slate)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {cat === 'all' ? 'All Notices' : cat}
                  </button>
                ))}
              </div>

              {/* Notices List */}
              {filteredNotices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)', background: '#fff', borderRadius: 18, border: '1px solid var(--border)' }}>
                  <Bell size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>No notices found</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>There are no notices matching the selected category filter.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {filteredNotices.map(notice => (
                    <div
                      key={notice.id}
                      style={{
                        padding: '20px 24px',
                        borderRadius: 16,
                        background: notice.isPinned ? '#FFFBEB' : '#fff',
                        border: notice.isPinned ? '1.5px solid #FDE68A' : '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {notice.isPinned && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#D97706', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                              <Pin size={11} /> PINNED
                            </span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', background: 'rgba(0,0,0,0.06)', padding: '3px 8px', borderRadius: 6 }}>
                            {notice.category}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{notice.date}</span>
                      </div>

                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.35 }}>
                        {notice.title}
                      </div>

                      <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 8, lineHeight: 1.55 }}>
                        {notice.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* 6. SEPARATE PAGE: DAILY NEWS                             */}
          {/* ======================================================== */}
          {activeTab === 'news' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease' }}>
              
              {/* Header Box */}
              <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: 18,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#EFF6FF', borderRadius: 99, color: 'var(--primary-dark)', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                    <Sparkles size={12} /> Campus Life & Press
                  </div>
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--navy)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Daily Campus News & Events
                  </h1>
                  <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>
                    Catch up with university milestones, guest lectures, student club events, and placements.
                  </p>
                </div>

                <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                  <strong>{news.length}</strong> Stories Published
                </div>
              </div>

              {/* News Grid */}
              {news.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)', background: '#fff', borderRadius: 18, border: '1px solid var(--border)' }}>
                  <Sparkles size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>No campus news available right now</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Check back later for recent press releases and updates.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
                  {news.map(item => (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: 18,
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        background: '#fff',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{ width: '100%', height: 160, objectFit: 'cover' }}
                          loading="lazy"
                        />
                      )}
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
                            {item.date}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.35 }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 8, lineHeight: 1.5 }}>
                            {item.description}
                          </div>
                        </div>

                        {item.externalLink && (
                          <a
                            href={item.externalLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              color: 'var(--primary-dark)',
                              paddingTop: 8,
                              borderTop: '1px solid #F1F5F9'
                            }}
                          >
                            Read Full Story <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* 7. SEPARATE PAGE: FACULTY DIRECTORY                      */}
          {/* ======================================================== */}
          {activeTab === 'faculty' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease' }}>
              <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: 18,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#EFF6FF', borderRadius: 99, color: 'var(--primary-dark)', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                    <Building2 size={12} /> {student.institute} Academic Directory
                  </div>
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--navy)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Faculty & Mentors
                  </h1>
                  <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>
                    Contact your professors, department heads, and academic advisors for guidance.
                  </p>
                </div>
              </div>

              {faculty.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '48px 24px', textAlign: 'center', color: 'var(--muted)' }}>
                  <Building2 size={36} color="#94A3B8" style={{ marginBottom: 10 }} />
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>No Faculty Listed Yet</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Faculty information for {student.institute} is being compiled by the administration.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                  {faculty.map(f => (
                    <div key={f.id} style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <span className="badge badge-primary">{f.institute}</span>
                          <span style={{ fontSize: 11, color: 'var(--muted)', background: '#F8FAFC', padding: '2px 8px', borderRadius: 6 }}>
                            {f.department}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--navy)' }}>{f.name}</h3>
                        <div style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 600, marginTop: 2 }}>{f.designation}</div>

                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #F1F5F9', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div><strong style={{ color: 'var(--navy)' }}>Email:</strong> <a href={`mailto:${f.email}`} style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>{f.email}</a></div>
                          <div><strong style={{ color: 'var(--navy)' }}>Office / Cabin:</strong> {f.cabin || 'Faculty Block'}</div>
                          <div><strong style={{ color: 'var(--navy)' }}>Office Hours:</strong> {f.officeHours || 'By appointment'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. SEPARATE PAGE: STUDENT PROFILE DETAILS                */}
          {/* ======================================================== */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease', maxWidth: 760, margin: '0 auto' }}>
              
              {/* Official Student ID Card */}
              <div style={{
                background: '#fff',
                borderRadius: 22,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden'
              }}>
                {/* ID Card Top Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #0F172A 0%, #0369A1 100%)',
                  padding: '28px',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: 18,
                      background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 22,
                      color: '#fff',
                      boxShadow: '0 6px 20px rgba(2, 132, 199, 0.4)'
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{student.name}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        Official University Student Identity
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 99,
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#6EE7B7',
                    fontSize: 12,
                    fontWeight: 800
                  }}>
                    <ShieldCheck size={16} />
                    <span>VERIFIED STUDENT</span>
                  </div>
                </div>

                {/* ID Details Body */}
                <div style={{ padding: '28px' }}>
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 16
                  }}>
                    <div className="detail-row">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{student.name}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Roll Number</span>
                      <span className="detail-value" style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary-dark)' }}>
                        {student.rollNumber}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Institute</span>
                      <span className="detail-value">{student.institute}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Specialization</span>
                      <span className="detail-value">{student.specialization}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Semester / Term</span>
                      <span className="detail-value">{student.semester || 'Semester 1'}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Academic Status</span>
                      <span className="detail-value" style={{ color: '#059669', fontWeight: 800 }}>
                        Active • Good Standing
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Registered Date</span>
                      <span className="detail-value">
                        {student.registeredAt ? new Date(student.registeredAt).toLocaleDateString() : 'Active Term'}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">University Authority</span>
                      <span className="detail-value">Sri Balaji University Pune</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16, textAlign: 'center', lineHeight: 1.5 }}>
                    This identity record is securely linked to Sri Balaji University Pune ERP database. For corrections or modifications, contact the Registrar Office.
                  </p>

                  <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button
                      onClick={() => navigate('/portal')}
                      className="btn btn-ghost"
                      style={{ flex: 1, padding: '12px' }}
                    >
                      View Student Portal Details
                    </button>

                    <button
                      onClick={handleLogout}
                      className="btn"
                      style={{ flex: 1, padding: '12px', background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
                    >
                      Logout from Account
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          onClick={() => handleTabSelect('overview')}
          className={`mobile-nav-item${activeTab === 'overview' ? ' active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabSelect('timetable')}
          className={`mobile-nav-item${activeTab === 'timetable' ? ' active' : ''}`}
        >
          <Clock size={20} />
          <span>Schedule</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabSelect('notes')}
          className={`mobile-nav-item${activeTab === 'notes' ? ' active' : ''}`}
        >
          <BookOpen size={20} />
          <span>Notes</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabSelect('attendance')}
          className={`mobile-nav-item${activeTab === 'attendance' ? ' active' : ''}`}
        >
          <CheckCircle2 size={20} />
          <span>Attendance</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className={`mobile-nav-item${['notices', 'news', 'faculty', 'profile'].includes(activeTab) ? ' active' : ''}`}
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>

    </div>
  );
}
