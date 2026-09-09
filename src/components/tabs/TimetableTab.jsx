import React from 'react';
import { TIMETABLE_DATA } from '../../data/appData';
import { Calendar } from 'lucide-react';

const DAYS = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableTab() {
  const today = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">Class Timetable</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <div className="page-sub">Weekly academic schedule</div>
          <span className="badge badge-primary" style={{ fontSize: 10 }}>
            <Calendar size={10} /> {today}
          </span>
        </div>
      </div>

      {/* Today banner */}
      <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, border: '1px solid rgba(14,165,233,0.2)' }}>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 13, color: 'var(--navy)', marginBottom: 8 }}>Today's Classes — {today}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {today === 'Saturday' || today === 'Sunday' ? (
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>🎉 Weekend! No classes today.</span>
          ) : TIMETABLE_DATA.filter(r => r.time !== '01:00 PM').map(row => {
            const dayKey = { Monday: 'mon', Tuesday: 'tue', Wednesday: 'wed', Thursday: 'thu', Friday: 'fri' }[today];
            const subject = dayKey ? row[dayKey] : null;
            return subject && subject !== '— Lunch Break —' ? (
              <div key={row.time} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#fff', borderRadius: 10, padding: '6px 12px', border: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{row.time}</span>
                <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{subject}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Full timetable */}
      <div className="timetable-wrapper">
        <table className="timetable">
          <thead>
            <tr>
              {DAYS.map(d => (
                <th key={d} style={{ background: d === today ? 'var(--primary)' : undefined }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMETABLE_DATA.map((row, i) => {
              const isLunch = row.time === '01:00 PM';
              return (
                <tr key={i} className={isLunch ? 'lunch-row' : ''}>
                  <td className="time-cell">{row.time}</td>
                  {['mon','tue','wed','thu','fri'].map(day => (
                    <td key={day} style={{ fontWeight: isLunch ? 400 : 600, textAlign: 'center', fontSize: 12, color: isLunch ? 'var(--muted)' : 'var(--slate)' }}>
                      {isLunch ? '— Lunch —' : row[day]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, padding: '12px 16px', background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
        {[
          { color: '#0EA5E9', label: 'Machine Learning' },
          { color: '#8B5CF6', label: 'Python for DS' },
          { color: '#10B981', label: 'Business Analytics' },
          { color: '#F59E0B', label: 'Strategic Mgmt' },
          { color: '#EF4444', label: 'Research Methods' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: 'var(--slate)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
