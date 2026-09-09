import React, { useState } from 'react';
import { NOTES_DATA } from '../../data/appData';
import { FileText, Search, Download, Eye } from 'lucide-react';

const CATEGORIES = ['all', 'datascience', 'analytics', 'finance', 'marketing', 'hr', 'cs'];
const CAT_LABELS = { all: 'All', datascience: 'Data Science', analytics: 'Analytics', finance: 'Finance', marketing: 'Marketing', hr: 'HR', cs: 'Computer Science' };

const CAT_BADGE = { datascience: 'badge-primary', analytics: 'badge-success', finance: 'badge-warning', marketing: 'badge-danger', hr: 'badge-purple', cs: 'badge-primary' };

export default function NotesTab() {
  const [cat, setCat]       = useState('all');
  const [search, setSearch] = useState('');

  const filtered = NOTES_DATA
    .filter(n => cat === 'all' || n.category === cat)
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">Notes & PDFs</div>
        <div className="page-sub">Study materials, lecture notes and course resources</div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} color="var(--muted)" />
        <input placeholder="Search notes, subjects or authors…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Filters */}
      <div className="filter-chips">
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
          <FileText size={48} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
          No notes found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map(note => (
            <div key={note.id} className="note-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={16} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`badge ${CAT_BADGE[note.category] || 'badge-primary'}`} style={{ fontSize: 10 }}>{note.subject}</span>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted)' }}>{note.size}</span>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 13, color: 'var(--navy)', lineHeight: 1.35 }}>{note.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>By {note.author} · {note.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Eye size={13} /> Preview
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
