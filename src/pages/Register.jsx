import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyRollNumber, isAlreadyRegistered, registerStudent } from '../firebase/service';
import {
  Eye, EyeOff, Lock, Hash, AlertCircle, CheckCircle,
  ArrowRight, ArrowLeft, UserCheck, GraduationCap, Building2,
  BookOpen, Calendar, ShieldCheck
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Step 1: Roll number verification
  const [rollNumber, setRollNumber] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [step, setStep] = useState(1);

  // Step 2: Password creation
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerifyRollNumber = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = rollNumber.trim();
    if (!trimmed) {
      setError('Please enter your university roll number.');
      return;
    }

    setLoading(true);

    try {
      // Check if already registered
      const alreadyRegistered = await isAlreadyRegistered(trimmed);
      if (alreadyRegistered) {
        setError('This roll number is already registered and activated. Please login instead.');
        setLoading(false);
        return;
      }

      // Verify roll number exists in student_list
      const result = await verifyRollNumber(trimmed);
      if (result.exists) {
        setStudentData(result.student);
        setStep(2);
        setError('');
      } else {
        setError(result.error || 'Roll number not found in university records. Contact your academic administrator.');
      }
    } catch (err) {
      setError('Network error verifying roll number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerStudent(rollNumber.trim(), password, studentData);
      if (result.success) {
        setSuccess(true);
        // Automatically set session in auth
        const sessionStudent = {
          rollNumber: rollNumber.trim(),
          name: studentData?.name || '',
          institute: studentData?.institute || '',
          specialization: studentData?.specialization || '',
          semester: studentData?.semester || 'Semester 1',
          role: 'student'
        };
        login(sessionStudent, 'student');
      } else {
        setError(result.error || 'Registration failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Failed to create account. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="login-page">
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
              Official Student Portal for Sri Balaji University Pune.
            </p>
          </div>
        </div>

        <div className="login-right">
          {/* Logo prominently at the top */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, textAlign: 'center' }}>
            <img
              src="/sbup-logo.png"
              alt="SBUP Connect Logo"
              style={{
                width: 76,
                height: 76,
                objectFit: 'contain',
                marginBottom: 12,
                filter: 'drop-shadow(0 4px 12px rgba(14, 165, 233, 0.15))'
              }}
            />
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900, fontSize: 20, color: 'var(--navy)' }}>
              SBUP <span style={{ color: 'var(--primary)' }}>Connect</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
              Sri Balaji University Pune
            </div>
          </div>

          <div className="success-container" style={{ textAlign: 'center' }}>
            <div className="success-icon-wrapper" style={{ margin: '0 auto 16px', width: 60, height: 60, borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={36} />
            </div>
            <h2 className="login-title" style={{ fontSize: 24, fontWeight: 900 }}>Registration Complete!</h2>
            <p className="login-sub" style={{ marginTop: 6, fontSize: 14 }}>
              Your student account has been successfully created and verified.
            </p>

            <div className="student-details-card" style={{ marginTop: 20, textAlign: 'left', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#059669', fontSize: 13, fontWeight: 700 }}>
                <ShieldCheck size={16} />
                <span>Verified Academic Credentials</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                <span style={{ color: '#64748B', fontWeight: 500 }}>Student Name:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{studentData?.name}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                <span style={{ color: '#64748B', fontWeight: 500 }}>Roll Number:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0F172A' }}>{studentData?.rollNumber}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                <span style={{ color: '#64748B', fontWeight: 500 }}>Institute:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{studentData?.institute}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: '#64748B', fontWeight: 500 }}>Specialization:</span>
                <span style={{ fontWeight: 700, color: '#0F172A', textAlign: 'right', maxWidth: '60%' }}>{studentData?.specialization}</span>
              </div>
            </div>

            <button
              id="proceed-portal-btn"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 20px', fontSize: 15, borderRadius: 12, marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => navigate('/portal')}
            >
              <span>Go to Student Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Left panel — Desktop only branding */}
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
            {['🔐 Verified Student Activation', '🏛️ 5 Constituent Institutes', '📊 Real-Time Academic Records'].map(f => (
              <span key={f} style={{
                padding: '8px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.95)'
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Form container */}
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

        {/* Step Indicator */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div className={`step-circle ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
            <div className={`step-circle ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 className="login-title" style={{ fontSize: 22, fontWeight: 800 }}>
              {step === 1 ? 'Student Registration' : 'Create Account Password'}
            </h2>
            <p className="login-sub" style={{ fontSize: 13, marginTop: 4 }}>
              {step === 1
                ? 'Step 1: Enter your University Roll Number to verify identity'
                : 'Step 2: Choose a secure password for your portal access'}
            </p>
          </div>
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="login-form" onSubmit={handleVerifyRollNumber} style={{ marginTop: 10 }}>
            <div className="form-group">
              <label htmlFor="register-roll-number" className="form-label">University Roll Number</label>
              <div className="input-wrapper">
                <Hash size={18} className="input-icon" />
                <input
                  id="register-roll-number"
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
              <p className="form-hint" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                Your roll number is pre-configured by the university admin. Example test rolls: <strong>20230948271</strong>, <strong>20230948272</strong>.
              </p>
            </div>

            <button
              id="verify-roll-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 20px', fontSize: 15, borderRadius: 12, marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="btn-spinner" />
                  Verifying University Records…
                </span>
              ) : (
                <>
                  <span>Verify Roll Number</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Already activated your account? </span>
              <Link to="/" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)' }}>
                Sign In here →
              </Link>
            </div>
          </form>
        ) : (
          <div>
            {/* Student Verified Details Card */}
            <div className="student-details-card" style={{
              background: '#F0F9FF',
              border: '1.5px solid #BAE6FD',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0369A1', fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
                <UserCheck size={16} />
                <span>Identity Verified</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px 12px', fontSize: 12 }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Name</span>
                  <strong style={{ color: '#0F172A', fontSize: 13 }}>{studentData?.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Roll Number</span>
                  <strong style={{ color: '#0F172A', fontSize: 13, fontFamily: 'monospace' }}>{studentData?.rollNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Institute</span>
                  <strong style={{ color: '#0F172A', fontSize: 13 }}>{studentData?.institute}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Specialization</span>
                  <strong style={{ color: '#0F172A', fontSize: 13 }}>{studentData?.specialization}</strong>
                </div>
              </div>
            </div>

            <form className="login-form" onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label htmlFor="register-password" className="form-label">Create Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="register-password"
                    className="form-input"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoFocus
                    autoComplete="new-password"
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

              <div className="form-group">
                <label htmlFor="register-confirm-password" className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="register-confirm-password"
                    className="form-input"
                    type={showConfirmPwd ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{ paddingRight: 48, fontSize: 16 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(v => !v)}
                    className="pwd-toggle"
                    aria-label={showConfirmPwd ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ flex: '0 0 auto', padding: '14px 18px', borderRadius: 12 }}
                  onClick={() => { setStep(1); setError(''); setPassword(''); setConfirmPassword(''); }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  id="create-account-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '14px 20px', fontSize: 15, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={loading}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="btn-spinner" />
                      Creating Account…
                    </span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
