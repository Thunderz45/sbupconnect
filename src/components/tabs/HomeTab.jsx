import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Clock, Bell, Hotel, Newspaper, Image,
  TrendingUp, Users, Award, MapPin, ArrowRight
} from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'notices',   label: 'Notices',   icon: Bell,     color: '#EF4444', bg: '#FEE2E2' },
  { id: 'notes',     label: 'Notes',     icon: BookOpen, color: '#0EA5E9', bg: '#E0F2FE' },
  { id: 'timetable', label: 'Timetable', icon: Clock,    color: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'news',      label: 'News',      icon: Newspaper,color: '#10B981', bg: '#D1FAE5' },
];

const STATS = [
  { label: 'Active Notices', value: '4',   icon: Bell,     color: '#EF4444', bg: '#FEE2E2' },
  { label: 'Study Notes',    value: '6',   icon: BookOpen, color: '#0EA5E9', bg: '#E0F2FE' },
  { label: 'Attendance',     value: '85%', icon: TrendingUp,color:'#10B981', bg: '#D1FAE5' },
  { label: 'CGPA',           value: '8.4', icon: Award,    color: '#F59E0B', bg: '#FEF3C7' },
];

export default function HomeTab({ onTabChange }) {
  const { student } = useAuth();
  const firstName = (student?.name || 'Student').split(' ')[0];
  const isHostel   = student?.hostel === 'Hostel Resident';
  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <div className="hero-card">
        <div className="hero-card-bg" />
        <div className="hero-content">
          <div className="hero-greeting">{greeting} 👋</div>
          <div className="hero-name">{firstName}</div>
          <div className="hero-sub">
            {student?.institute} · {student?.spec}
            {isHostel && <span style={{ marginLeft: 12, opacity: 0.8 }}>📍 Room {student?.roomNo}</span>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title">Quick Access</div>
        </div>
        <div className="quick-actions">
          {QUICK_ACTIONS.map(({ id, label, icon: Icon, color, bg }) => (
            <button key={id} className="quick-action-btn" onClick={() => onTabChange(id)}>
              <div className="quick-action-icon" style={{ background: bg, color }}>
                <Icon size={20} />
              </div>
              {label}
            </button>
          ))}
          {isHostel && (
            <button className="quick-action-btn" onClick={() => onTabChange('hostel')}>
              <div className="quick-action-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                <Hotel size={20} />
              </div>
              Hostel
            </button>
          )}
          <button className="quick-action-btn" onClick={() => onTabChange('gallery')}>
            <div className="quick-action-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <Image size={20} />
            </div>
            Gallery
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title">Academic Summary</div>
        </div>
        <div className="grid-4">
          {STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={20} />
              </div>
              <div>
                <div className="stat-val">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notices Preview */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title">Recent Notices</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onTabChange('notices')}>
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="card">
          {[
            { title: 'Mid-Term Hall Ticket Generation Active', cat: 'Academic', time: 'Today 09:30 AM', color: '#EF4444' },
            { title: 'Campus Placement: Deloitte & KPMG', cat: 'Placement', time: 'Yesterday', color: '#8B5CF6' },
            { title: 'SBUP Cultural Fest 2026 — Registrations Open', cat: 'Events', time: '04 Sep 2026', color: '#10B981' },
          ].map((n, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderBottom: i < 2 ? '1px solid var(--navy-200)' : 'none', cursor: 'pointer'
            }} onClick={() => onTabChange('notices')}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{n.title}</div>
                <div style={{ fontSize: 12, color: 'var(--navy-500)', marginTop: 3 }}>{n.cat} · {n.time}</div>
              </div>
              <ArrowRight size={14} color="var(--navy-400)" />
            </div>
          ))}
        </div>
      </div>

      {/* PRN / Inst info */}
      <div className="card" style={{ padding: '18px 20px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--navy-500)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>PRN</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{student?.prn}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--navy-500)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Institute</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{student?.institute}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--navy-500)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Email</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{student?.email}</div>
        </div>
        {isHostel && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--navy-500)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Hostel Room</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-600)' }}>{student?.hostelName} · Room {student?.roomNo}</div>
          </div>
        )}
      </div>
    </div>
  );
}
