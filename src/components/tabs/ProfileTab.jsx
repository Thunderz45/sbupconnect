import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, GraduationCap, Hotel, Hash, Shield, LogOut } from 'lucide-react';

export default function ProfileTab() {
  const { student, logout } = useAuth();
  const initials = (student?.name || 'S')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isHostel = student?.hostel === 'Hostel Resident';

  const fields = [
    { icon: Hash,           label: 'PRN / Roll Number',   value: student?.prn },
    { icon: Mail,           label: 'Email Address',        value: student?.email || `${student?.prn}@sbup.edu.in` },
    { icon: GraduationCap, label: 'Institute',             value: student?.institute },
    { icon: GraduationCap, label: 'Specialization',        value: student?.spec },
    { icon: User,           label: 'Hostel Status',        value: student?.hostel || 'Day Scholar' },
    ...(isHostel ? [
      { icon: Hotel, label: 'Hostel Name', value: student?.hostelName },
      { icon: MapPin, label: 'Room Number', value: student?.roomNo },
    ] : []),
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">My Profile</div>
        <div className="page-sub">Your student account details</div>
      </div>

      {/* Profile Hero */}
      <div className="profile-hero" style={{ marginBottom: 24 }}>
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <div className="name">{student?.name}</div>
          <div className="prn">PRN: {student?.prn}</div>
          <div className="inst">{student?.institute} — {student?.spec}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11 }}>
              {student?.institute}
            </span>
            {isHostel && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11 }}>
                🏠 Hostel Resident
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--navy-200)', fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>
          Account Information
        </div>
        {fields.map(({ icon: Icon, label, value }, i) => (
          <div key={i} className="profile-field">
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--sky-50)', color: 'var(--sky-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} />
            </div>
            <div>
              <div className="field-label">{label}</div>
              <div className="field-value">{value || '—'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--navy-200)', fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>
          Security
        </div>
        <div className="profile-field">
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="field-label">Password</div>
            <div className="field-value">••••••••</div>
          </div>
          <button className="btn btn-outline btn-sm">Change</button>
        </div>
      </div>

      {/* Logout */}
      <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
        <LogOut size={18} /> Sign Out of SBUP Connect
      </button>
    </div>
  );
}
