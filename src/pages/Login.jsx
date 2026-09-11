import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authenticateStudent } from '../firebase/service';
import { Eye, EyeOff, Lock, Hash, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [rollNumber, setRollNumber] = useState('');
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
    const result = await authenticateStudent(rollNumber, password);
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
      {/* Left panel — Desktop branding */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
          <img
            src="/sbup-logo.png"
            alt="SBUP Logo"
            style={{ width: 84, height: 84, objectFit: 'contain', marginBottom: 24 }}
          />
          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 44, fontWeight: 900, lineHeight: 1.15 }}>
            SBUP<br /><span style={{ color: '#38BDF8' }}>Connect</span>
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, marginTop: 16, maxWidth: 360, lineHeight: 1.6 }}>
            Sri Balaji University Pune — Unified Student Academic & Campus Portal.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['🎓 Student Dashboard', '🔐 Secure University Access', '📋 Academic Records & Notes'].map(f => (
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
        {/* Prominent Logo & Brand header at top of form */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20, textAlign: 'center' }}>
          <img
            src="/sbup-logo.png"
            alt="SBUP Connect Logo"
            className="register-main-logo"
            style={{
              width: 68,
              height: 68,
              objectFit: 'contain',
              marginBottom: 10,
              filter: 'drop-shadow(0 4px 10px rgba(14, 165, 233, 0.15))'
            }}
          />
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900, fontSize: 20, color: 'var(--navy)' }}>
            SBUP <span style={{ color: 'var(--primary)' }}>Connect</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
            Sri Balaji University Pune
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 className="login-title" style={{ fontSize: 22, fontWeight: 800 }}>Welcome Back 👋</h2>
          <p className="login-sub" style={{ fontSize: 13, marginTop: 4 }}>
            Sign in to access your attendance, notes, and timetable
          </p>
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} style={{ marginTop: 8 }}>
          <div className="form-group">
            <label htmlFor="login-roll-number" className="form-label">University Roll Number</label>
            <div className="input-wrapper">
              <Hash size={18} className="input-icon" />
              <input
                id="login-roll-number"
                className="form-input"
                type="text"
                placeholder="e.g. 20230948271"
                value={rollNumber}
                onChange={e => { setRollNumber(e.target.value); setError(''); }}
                required
                autoFocus
                autoComplete="username"
                style={{ fontSize: 16 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 20px', fontSize: 15, borderRadius: 12, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="btn-spinner" />
                Signing in…
              </span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>First time visiting? </span>
            <Link to="/register" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)' }}>
              Register & Activate Roll Number →
            </Link>
          </div>

          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Link to="/admin" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'underline' }}>
              Staff & Admin Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
