import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, Hash, Building2, BookOpen, Calendar, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function Portal() {
  const { student, loading, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/sbup-logo.png" alt="SBUP" style={{ height: 38, objectFit: 'contain' }} />
          <div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--navy)' }}>
              SBUP <span style={{ color: 'var(--primary)' }}>Connect</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>Student Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            id="header-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)'
            }}
          >
            <span>Next: Dashboard</span>
            <ArrowRight size={14} />
          </button>
          <button id="dashboard-logout-btn" onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-avatar">
            {initials}
          </div>
          <h1 className="welcome-title">Welcome, {student.name?.split(' ')[0] || 'Student'}</h1>
          <p className="welcome-sub">Here's your verified student profile information</p>
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 99, color: '#059669', fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Verified Student • Active Session
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <GraduationCap size={20} />
            <span>Student Profile Details</span>
          </div>

          <div className="profile-grid">
            <div className="profile-item">
              <div className="profile-item-icon" style={{ background: '#EFF6FF', color: '#0284C7' }}>
                <GraduationCap size={20} />
              </div>
              <div className="profile-item-content">
                <div className="profile-item-label">Full Name</div>
                <div className="profile-item-value">{student.name || '—'}</div>
              </div>
            </div>

            <div className="profile-item">
              <div className="profile-item-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                <Hash size={20} />
              </div>
              <div className="profile-item-content">
                <div className="profile-item-label">Roll Number</div>
                <div className="profile-item-value" style={{ fontFamily: 'monospace' }}>{student.rollNumber || '—'}</div>
              </div>
            </div>

            <div className="profile-item">
              <div className="profile-item-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                <Building2 size={20} />
              </div>
              <div className="profile-item-content">
                <div className="profile-item-label">Institute</div>
                <div className="profile-item-value">{student.institute || '—'}</div>
              </div>
            </div>

            <div className="profile-item">
              <div className="profile-item-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <BookOpen size={20} />
              </div>
              <div className="profile-item-content">
                <div className="profile-item-label">Specialization</div>
                <div className="profile-item-value">{student.specialization || '—'}</div>
              </div>
            </div>

            <div className="profile-item">
              <div className="profile-item-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <Calendar size={20} />
              </div>
              <div className="profile-item-content">
                <div className="profile-item-label">Semester / Term</div>
                <div className="profile-item-value">{student.semester || 'Semester 1'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Button Section */}
        <div style={{ marginTop: 24 }}>
          <button
            id="portal-next-btn"
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <span>Next: Go to Student Dashboard</span>
            <ArrowRight size={18} />
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            Proceed to your timetable, attendance records, and university circulars.
          </p>
        </div>
      </main>
    </div>
  );
}
