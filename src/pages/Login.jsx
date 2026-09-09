import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authenticateStudent } from '../firebase/service';
import { Eye, EyeOff, Lock, User, GraduationCap, AlertCircle } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await authenticateStudent(identifier, password);
    setLoading(false);
    if (result.success) {
      login(result.student, 'student');
      navigate('/portal');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
          <img src="/sbup-logo.png" alt="SBUP Logo" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 24, filter: 'brightness(0) invert(1)' }} />
          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 44, fontWeight: 900, lineHeight: 1.15 }}>
            SBUP<br /><span style={{ color: '#38BDF8' }}>Connect</span>
          </h1>
          <p style={{ fontSize: 16, opacity: 0.75, marginTop: 16, maxWidth: 360, lineHeight: 1.6 }}>
            Your complete student portal for Sri Balaji University Pune — notes, timetables, notices, hostel management, and more.
          </p>

          {/* Feature pills */}
          <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['📚 Study Notes', '🗓 Timetables', '🔔 Live Notices', '🏠 Hostel Portal', '📰 News Feed', '🖼 Gallery'].map(f => (
              <span key={f} style={{
                padding: '7px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.9)'
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <img src="/sbup-logo.png" alt="SBUP" className="login-logo" />
        <div className="login-title">Welcome back 👋</div>
        <div className="login-sub">Sign in to your SBUP Connect account</div>

        {error && (
          <div className="error-box" style={{ marginBottom: 20 }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Roll Number / Email</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input
                className="form-input"
                type="text"
                placeholder="e.g. 20230948271 or name@sbup.edu.in"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 14, background: 'none', border: 'none', color: 'var(--navy-400)', cursor: 'pointer' }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 20px', fontSize: 15, borderRadius: 12, marginTop: 4 }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>

          <div className="login-hint">
            Demo: PRN <strong>20230948271</strong> · Password <strong>password</strong>
          </div>
        </form>

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--navy-200)', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--navy-500)' }}>Administrator? </span>
          <a href="/admin" style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-600)' }}>Admin Login →</a>
        </div>
      </div>
    </div>
  );
}
