import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Building2 } from 'lucide-react';

const ADMIN_CREDENTIALS = { id: 'admin@sbup.edu.in', password: 'sbup@admin2026' };

export default function AdminLogin() {
  const [id, setId]           = useState('');
  const [pwd, setPwd]         = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 450));
    if (id.trim().toLowerCase() === ADMIN_CREDENTIALS.id && pwd === ADMIN_CREDENTIALS.password) {
      const adminData = { name: 'SBUP University Admin', role: 'admin', email: id.trim() };
      localStorage.setItem('sbup_session', JSON.stringify(adminData));
      login(adminData, 'admin');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Contact IT Services for access.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left panel — Desktop branding */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
          <img
            src="/sbup-logo.png"
            alt="SBUP Logo"
            style={{ width: 84, height: 84, objectFit: 'contain', marginBottom: 24 }}
          />
          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 40, fontWeight: 900, lineHeight: 1.2 }}>
            SBUP Connect<br /><span style={{ color: '#F59E0B' }}>Admin Suite</span>
          </h1>
          <p style={{ fontSize: 15, opacity: 0.85, marginTop: 16, maxWidth: 360, lineHeight: 1.6 }}>
            Comprehensive Academic & Institutional Management for Sri Balaji University Pune.
          </p>

          <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['👥 Student Rosters & Import', '📊 Attendance Processing', '📚 Course Notes Distribution', '📅 Dynamic Schedules'].map(f => (
              <span key={f} style={{
                padding: '8px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.95)'
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20, textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)'
          }}>
            <Shield size={30} color="#fff" />
          </div>
          <h2 className="login-title" style={{ fontSize: 22, fontWeight: 800 }}>Admin Portal Sign In</h2>
          <p className="login-sub" style={{ fontSize: 13, marginTop: 4 }}>
            Restricted access for authorized university coordinators
          </p>
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: 18, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} style={{ marginTop: 8 }}>
          <div className="form-group">
            <label htmlFor="admin-email" className="form-label">Administrator Email</label>
            <div className="input-wrapper">
              <Shield size={18} className="input-icon" />
              <input
                id="admin-email"
                className="form-input"
                type="email"
                placeholder="admin@sbup.edu.in"
                value={id}
                onChange={e => { setId(e.target.value); setError(''); }}
                required
                autoFocus
                autoComplete="username"
                style={{ fontSize: 16 }}
              />
            </div>
            <p className="form-hint" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Default ID: admin@sbup.edu.in</p>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="admin-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Admin password"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 48, fontSize: 16 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="pwd-toggle"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="form-hint" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Default Password: sbup@admin2026</p>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            className="btn"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 20px', fontSize: 15, borderRadius: 12,
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff',
              boxShadow: '0 4px 14px rgba(245,158,11,0.3)', border: 'none', fontWeight: 700,
              fontFamily: 'Plus Jakarta Sans, sans-serif', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="btn-spinner" />
                Authenticating…
              </span>
            ) : (
              <>
                <span>Access Management Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
            <Link to="/" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)' }}>
              ← Return to Student Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
