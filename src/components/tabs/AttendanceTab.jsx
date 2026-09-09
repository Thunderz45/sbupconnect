import React from 'react';
import { BarChart2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const SUBJECTS = [
  { name: 'Machine Learning', total: 48, attended: 42, percent: 87.5 },
  { name: 'Business Analytics Lab', total: 36, attended: 30, percent: 83.3 },
  { name: 'Python for Data Science', total: 40, attended: 28, percent: 70.0 },
  { name: 'Strategic Management', total: 32, attended: 30, percent: 93.7 },
  { name: 'Research Methods', total: 28, attended: 22, percent: 78.5 },
  { name: 'Financial Models', total: 24, attended: 20, percent: 83.3 },
];

const overall = Math.round(SUBJECTS.reduce((s, x) => s + x.percent, 0) / SUBJECTS.length);

export default function AttendanceTab() {
  const color = p => p >= 85 ? '#10B981' : p >= 75 ? '#F59E0B' : '#EF4444';
  const label = p => p >= 85 ? 'Good' : p >= 75 ? 'At Risk' : 'Critical';

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">Attendance</div>
        <div className="page-sub">Subject-wise attendance record for current semester</div>
      </div>

      {/* Overall circle stat */}
      <div className="dash-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="10" />
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={color(overall)} strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 42 * overall / 100} ${2 * Math.PI * 42}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)" style={{ transition: '1s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900, fontSize: 22, color: color(overall) }}>{overall}%</span>
            <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em' }}>OVERALL</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--navy)' }}>Overall Attendance: {overall}%</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Current Semester · SY MBA — {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {overall >= 75
              ? <span className="badge badge-success"><CheckCircle size={11} /> You are on track</span>
              : <span className="badge badge-danger"><AlertTriangle size={11} /> Below 75% minimum</span>}
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--navy)' }}>
          Subject-wise Breakdown
        </div>
        {SUBJECTS.map((subj, i) => {
          const c = color(subj.percent);
          const l = label(subj.percent);
          return (
            <div key={i} style={{ padding: '14px 20px', borderBottom: i < SUBJECTS.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)' }}>{subj.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {subj.attended}/{subj.total} classes attended
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900, fontSize: 18, color: c }}>{subj.percent.toFixed(1)}%</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${c}20`, color: c }}>{l}</span>
                </div>
              </div>
              <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${subj.percent}%`, background: c, borderRadius: 99, transition: '0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div style={{ marginTop: 14, padding: '12px 16px', background: '#F0F9FF', borderRadius: 12, border: '1px solid #BAE6FD', display: 'flex', gap: 10 }}>
        <Info size={16} color="#0EA5E9" style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 12, color: '#0369A1' }}>SBUP requires a minimum of <strong>75% attendance</strong> per subject to be eligible for semester examinations.</span>
      </div>
    </div>
  );
}
