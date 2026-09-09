import React, { useState } from 'react';
import { FileText, Download, Search, Filter } from 'lucide-react';

const NOTES = [
  { id: 1, title: 'Machine Learning Algorithms & Python Scikit-Learn.pdf', subject: 'Data Science', date: '05 Sep 2026', author: 'Prof. R. Deshmukh', size: '4.2 MB', category: 'datascience' },
  { id: 2, title: 'SQL Indexing & Advanced Query Optimization.pdf', subject: 'Business Analytics', date: '02 Sep 2026', author: 'Dr. Swati Kulkarni', size: '2.8 MB', category: 'analytics' },
  { id: 3, title: 'Financial Risk Modeling & VaR Formula Guide.pdf', subject: 'Finance Analytics', date: '28 Aug 2026', author: 'Prof. Vikram Patil', size: '5.1 MB', category: 'finance' },
  { id: 4, title: 'Digital Marketing Metrics & Google Analytics 4.pdf', subject: 'Marketing', date: '25 Aug 2026', author: 'Dr. Ananya Roy', size: '3.4 MB', category: 'marketing' },
  { id: 5, title: 'People Analytics & HR Metrics Workbook.pdf', subject: 'Human Resources', date: '20 Aug 2026', author: 'Prof. S. Mehta', size: '1.9 MB', category: 'hr' },
  { id: 6, title: 'Autonomous AI Agents & Vector RAG Notes.pdf', subject: 'Computer Science', date: '15 Aug 2026', author: 'Dr. P. Varma', size: '6.5 MB', category: 'cs' },
];

const FILTERS = [
  { id: 'all', label: 'All Notes' },
  { id: 'datascience', label: 'Data Science' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'finance', label: 'Finance' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'hr', label: 'HR' },
  { id: 'cs', label: 'CS' },
];

const COLORS = {
  datascience: { bg: '#E0F2FE', color: '#0369A1' },
  analytics:   { bg: '#EDE9FE', color: '#7C3AED' },
  finance:     { bg: '#D1FAE5', color: '#065F46' },
  marketing:   { bg: '#FEF3C7', color: '#92400E' },
  hr:          { bg: '#FCE7F3', color: '#9D174D' },
  cs:          { bg: '#FEE2E2', color: '#991B1B' },
};

export default function NotesTab() {
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  const filtered = NOTES.filter(n => {
    const matchCat = filter === 'all' || n.category === filter;
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                        n.subject.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">Study Notes</div>
        <div className="page-sub">Download lecture notes and study materials</div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} color="var(--navy-400)" />
        <input
          placeholder="Search notes by title or subject…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter chips */}
      <div className="notes-filter">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--navy-400)' }}>
          <FileText size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontWeight: 600 }}>No notes found</div>
        </div>
      ) : (
        filtered.map(note => {
          const c = COLORS[note.category] || { bg: '#E0F2FE', color: '#0369A1' };
          return (
            <div key={note.id} className="note-item">
              <div className="note-icon" style={{ background: c.bg, color: c.color }}>
                <FileText size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="note-title"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.title}
                </div>
                <div className="note-meta">
                  {note.subject} · {note.author} · {note.date} · {note.size}
                </div>
              </div>
              <button className="btn btn-primary btn-sm">
                <Download size={14} /> Download
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
