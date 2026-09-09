import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Hotel, Wifi, Utensils, Shield, Phone, MapPin, Bed } from 'lucide-react';

export default function HostelTab() {
  const { student } = useAuth();
  const isHostel = student?.hostel === 'Hostel Resident';

  if (!isHostel) {
    return (
      <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Hotel size={64} style={{ marginBottom: 16, opacity: 0.2 }} />
        <h2 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>Not a Hostel Resident</h2>
        <p style={{ color: 'var(--navy-500)' }}>This section is only available to hostel students.</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">Hostel Portal</div>
        <div className="page-sub">Sri Balaji University Hostel — Residential Management</div>
      </div>

      {/* Hostel Hero */}
      <div className="hostel-hero">
        <img src="/sbup-hostel.jpg" alt="Hostel" />
        <div className="hostel-hero-overlay">
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {student?.hostelName || 'Sri Balaji Hostel'}
          </div>
          <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
            Room {student?.roomNo} · Floor {Math.floor(Number(student?.roomNo) / 100)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hostel-stat-grid">
        {[
          { label: 'Room Number',     value: student?.roomNo || '304',    icon: Bed,     color: '#0EA5E9', bg: '#E0F2FE' },
          { label: 'Floor',           value: `Floor ${Math.floor(Number(student?.roomNo || 304) / 100)}`, icon: Hotel,   color: '#8B5CF6', bg: '#EDE9FE' },
          { label: 'Mess Timing',     value: '7AM / 1PM / 8PM',           icon: Utensils,color: '#10B981', bg: '#D1FAE5' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg, color }}>
              <Icon size={20} />
            </div>
            <div>
              <div className="stat-val" style={{ fontSize: 16 }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Amenities */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--navy-200)', fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>
          Hostel Amenities
        </div>
        {[
          { icon: Wifi,    label: 'High-Speed Wi-Fi',       desc: '100 Mbps fibre connection in all rooms', ok: true },
          { icon: Utensils,label: 'Mess & Cafeteria',       desc: 'Hygienic meals thrice daily', ok: true },
          { icon: Shield,  label: '24x7 Security',          desc: 'CCTV + guard post at all entry points', ok: true },
          { icon: MapPin,  label: 'Laundry Service',        desc: 'Weekly laundry available at Wing D', ok: true },
        ].map(({ icon: Icon, label, desc, ok }, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
            borderBottom: i < 3 ? '1px solid var(--navy-200)' : 'none'
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--navy-500)', marginTop: 2 }}>{desc}</div>
            </div>
            <span className="badge badge-success">{ok ? 'Active' : 'N/A'}</span>
          </div>
        ))}
      </div>

      {/* Emergency Contacts */}
      <div className="card">
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--navy-200)', fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>
          Emergency Contacts
        </div>
        {[
          { label: 'Hostel Warden',   num: '+91 98765 11111' },
          { label: 'Security Desk',   num: '+91 98765 22222' },
          { label: 'SBUP Infirmary',  num: '+91 98765 33333' },
        ].map(({ label, num }, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
            borderBottom: i < 2 ? '1px solid var(--navy-200)' : 'none'
          }}>
            <Phone size={16} color="var(--sky-500)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--sky-600)', marginTop: 2 }}>{num}</div>
            </div>
            <a href={`tel:${num.replace(/\s/g,'')}`} className="btn btn-outline btn-sm">Call</a>
          </div>
        ))}
      </div>
    </div>
  );
}
