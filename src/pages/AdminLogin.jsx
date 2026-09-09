import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, AlertCircle } from 'lucide-react';

const ADMIN_CREDENTIALS = { id: 'admin@sbup.edu.in', password: 'sbup@admin2026' };

export default function AdminLogin() {
  const [id, setId]         = useState('');
  const [pwd, setPwd]       = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (id.trim().toLowerCase() === ADMIN_CREDENTIALS.id && pwd === ADMIN_CREDENTIALS.password) {
      login({ name: 'SBUP Admin', role: 'admin', email: id }, 'admin');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
          <img src="/sbup-logo.png" alt="SBUP" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 24, filter: 'brightness(0) invert(1)' }} />
          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 40, fontWeight: 900, lineHeight: 1.2 }}>
            SBUP Connect<br /><span style={{ color: '#F59E0B' }}>Admin Portal</span>
          </h1>
          <p style={{ fontSize: 15, opacity: 0.7, marginTop: 16, maxWidth: 340, lineHeight: 1.6 }}>
            Manage student rosters, import Excel data, post notices, and oversee campus operations.
          </p>
          <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['👥 Student Roster', '📋 Excel Import', '📢 Post Notices', '📊 Analytics', '🏠 Hostel Mgmt'].map(f => (
              <span key={f} style={{ padding: '7px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 13, fontWeight: 500 }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="login-right">
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Shield size={28} color="#fff" />
        </div>
        <div className="login-title">Admin Login</div>
        <div className="login-sub">Access restricted to authorized SBUP staff</div>

        {error && (
          <div className="error-box" style={{ marginBottom: 20 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div className="input-wrapper">
              <Shield size={16} className="input-icon" />
              <input className="form-input" type="email" placeholder="admin@sbup.edu.in" value={id} onChange={e => setId(e.target.value)} required autoFocus />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input className="form-input" type="password" placeholder="Admin password" value={pwd} onChange={e => setPwd(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn" disabled={loading}
            style={{ width: '100%', padding: '14px 20px', fontSize: 15, borderRadius: 12, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>
            {loading ? 'Signing in…' : 'Admin Sign In'}
          </button>
          <div className="login-hint">
            Demo: <strong>admin@sbup.edu.in</strong> · <strong>sbup@admin2026</strong>
          </div>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href="/" style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-600)' }}>← Student Login</a>
        </div>
      </div>
    </div>
  );
}
