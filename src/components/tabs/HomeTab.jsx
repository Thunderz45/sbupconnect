import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Maximize, BookOpen, Bell, Clock, Newspaper, Image, Hotel, BarChart2, TrendingUp, Award, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotices } from '../../context/NoticesContext';
import { NOTES_DATA } from '../../data/appData';

export default function HomeTab({ onTabChange }) {
  const { student } = useAuth();
  const { notices, unreadCount } = useNotices();
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  const firstName  = (student?.name || 'Student').split(' ')[0];
  const isHostel   = student?.hostel === 'Hostel Resident';
  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Video: keep looping non-stop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.loop = true; video.muted = true;
    const tryPlay = () => video.paused && video.play().catch(() => {});
    tryPlay();
    document.addEventListener('click', tryPlay, { once: true });
    const onPause = () => { if (!document.hidden) video.play().catch(() => {}); };
    const onVisible = () => { if (!document.hidden) video.play().catch(() => {}); };
    video.addEventListener('pause', onPause);
    document.addEventListener('visibilitychange', onVisible);
    return () => { video.removeEventListener('pause', onPause); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const goFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
  };

  const QUICK = [
    { id: 'notices',   label: 'Notices',   icon: Bell,     color: '#EF4444', bg: '#FEE2E2' },
    { id: 'notes',     label: 'Notes',     icon: BookOpen, color: '#0EA5E9', bg: '#E0F2FE' },
    { id: 'timetable', label: 'Timetable', icon: Clock,    color: '#8B5CF6', bg: '#EDE9FE' },
    { id: 'news',      label: 'News',      icon: Newspaper,color: '#10B981', bg: '#D1FAE5' },
    { id: 'gallery',   label: 'Gallery',   icon: Image,    color: '#F59E0B', bg: '#FEF3C7' },
    ...(isHostel ? [{ id: 'hostel', label: 'Hostel', icon: Hotel, color: '#0369A1', bg: '#E0F2FE' }] : []),
    { id: 'attendance',label: 'Attendance',icon: BarChart2,color: '#EC4899', bg: '#FCE7F3' },
  ];

  const STATS = [
    { label: 'Attendance', value: '82%', icon: BarChart2, color: '#0EA5E9', bg: '#E0F2FE' },
    { label: 'Study Notes', value: '24', icon: FileText, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Notices', value: notices.length, icon: Bell, color: '#EF4444', bg: '#FEE2E2' },
    { label: 'CGPA', value: '8.4', icon: Award, color: '#F59E0B', bg: '#FEF3C7' },
  ];

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Campus Video */}
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay muted loop playsInline preload="auto" poster="/sbup-campus.jpg">
          <source src="/sbup-campus-tour.mp4" type="video/mp4" />
        </video>
        <div className="video-controls">
          <button className="video-btn" onClick={toggleMute}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            {muted ? 'Unmute' : 'Mute'}
          </button>
          <button className="video-btn" onClick={goFullscreen} style={{ padding: '7px 10px' }}>
            <Maximize size={15} />
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 14, color: '#fff', pointerEvents: 'none' }}>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 16, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            Sri Balaji University, Pune
          </div>
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>📍 Tathawade Campus, Pune • A Bird's Eye View</div>
        </div>
      </div>

      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 50%, #6366F1 100%)', borderRadius: 20, padding: '20px 24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{greeting} 👋</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 26, fontWeight: 900, marginTop: 2 }}>
              Hello, {firstName}!
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8 }}>{student?.institute}</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8 }}>
                {student?.spec?.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          </div>
          <div style={{ width: 80, height: 60, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
            <img src="/sbup-campus.jpg" alt="Campus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <Icon size={16} />
            </div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 900, color: 'var(--navy)' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <div className="section-header">
          <div className="section-title">Quick Access</div>
        </div>
        <div className="quick-actions">
          {QUICK.map(({ id, label, icon: Icon, color, bg }) => (
            <button key={id} className="quick-action-btn" onClick={() => onTabChange(id)}>
              <div className="quick-action-icon" style={{ background: bg, color }}>
                <Icon size={18} />
              </div>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Notices */}
      <div>
        <div className="section-header">
          <div className="section-title">
            Recent Notices
            {unreadCount > 0 && <span className="badge badge-danger" style={{ marginLeft: 8, fontSize: 10 }}>{unreadCount} Unread</span>}
          </div>
          <button className="btn-ghost" style={{ height: 34, padding: '0 14px', fontSize: 12 }} onClick={() => onTabChange('notices')}>
            View All <ArrowRight size={13} />
          </button>
        </div>
        <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
          {notices.slice(0, 3).map((n, i) => (
            <div key={n.id}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
              onClick={() => onTabChange('notices')}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.isRead ? 'var(--muted)' : 'var(--primary)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: 'var(--navy)' }}>{n.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{n.category} · {n.date}</div>
              </div>
              <ArrowRight size={13} color="var(--muted)" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notes */}
      <div>
        <div className="section-header">
          <div className="section-title">Recent Notes</div>
          <button className="btn-ghost" style={{ height: 34, padding: '0 14px', fontSize: 12 }} onClick={() => onTabChange('notes')}>
            All Notes <ArrowRight size={13} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NOTES_DATA.slice(0, 4).map(note => (
            <div key={note.id} className="note-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFF6FF', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{note.subject} · {note.date}</div>
              </div>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted)', flexShrink: 0 }}>{note.size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Student info card */}
      <div className="dash-card" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'PRN', value: student?.prn },
          { label: 'Institute', value: student?.institute },
          { label: 'Email', value: student?.email || `${student?.prn}@sbup.edu.in` },
          ...(isHostel ? [{ label: 'Room', value: `${student?.hostelName} (${student?.roomNo})` }] : []),
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginTop: 3 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
