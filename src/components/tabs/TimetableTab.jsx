import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock } from 'lucide-react';

const TIMETABLE = [
  { time: '09:00 AM', mon: 'Machine Learning', tue: 'Strategic Mgmt', wed: 'Python Lab', thu: 'Bus. Analytics', fri: 'Research Methods' },
  { time: '11:00 AM', mon: 'Bus. Analytics Lab', tue: 'Python for DS', wed: 'Financial Models', thu: 'ML Algorithms', fri: 'Case Study' },
  { time: '01:00 PM', mon: '— Lunch Break —', tue: '— Lunch Break —', wed: '— Lunch Break —', thu: '— Lunch Break —', fri: '— Lunch Break —' },
  { time: '02:00 PM', mon: 'Python for DS', tue: 'Bus. Analytics', wed: 'Strategic Mgmt', thu: 'Python Lab', fri: 'Research Methods' },
  { time: '04:00 PM', mon: 'Strategic Mgmt', tue: 'ML Algorithms', wed: 'Library / Self', thu: 'Case Study', fri: 'Guest Lecture' },
];

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
const DAY_LABELS = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday' };

const today = new Date().toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
const todayKey = today === 'sat' || today === 'sun' ? null : today;

export default function TimetableTab() {
  const { student } = useAuth();

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">Class Timetable</div>
        <div className="page-sub">{student?.spec} · Semester 4</div>
      </div>

      {/* Today's classes card */}
      {todayKey && (
        <div className="card" style={{ padding: '20px', marginBottom: 24 }}>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--sky-500)" /> Today — {DAY_LABELS[todayKey]}
            </div>
            <span className="badge badge-primary">
              {TIMETABLE.filter(r => r[todayKey] && !r[todayKey].includes('Lunch')).length} Classes
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TIMETABLE.filter(r => !r[todayKey]?.includes('Lunch')).map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', background: 'var(--sky-50)', borderRadius: 10,
                border: '1px solid var(--sky-100)'
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sky-600)', minWidth: 70 }}>{row.time}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{row[todayKey]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full weekly timetable */}
      <div className="timetable-wrapper">
        <table className="timetable">
          <thead>
            <tr>
              <th>Time</th>
              <th>Monday</th>
              <th>Tuesday</th>
              <th>Wednesday</th>
              <th>Thursday</th>
              <th>Friday</th>
            </tr>
          </thead>
          <tbody>
            {TIMETABLE.map((row, i) => {
              const isLunch = row.mon.includes('Lunch');
              return (
                <tr key={i} className={isLunch ? 'lunch-row' : ''}>
                  <td className="time-cell">{row.time}</td>
                  {DAYS.map(d => (
                    <td key={d} style={{
                      fontWeight: d === todayKey && !isLunch ? 600 : undefined,
                      background: d === todayKey && !isLunch ? 'rgba(14,165,233,0.06)' : undefined,
                    }}>
                      {row[d]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
