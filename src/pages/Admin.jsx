import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchStudentsRoster, addSingleStudent, deleteStudentByPRN, batchUploadStudents
} from '../firebase/service';
import * as XLSX from 'xlsx';
import {
  Users, Upload, Plus, Trash2, Search, RefreshCw,
  Shield, LogOut, CheckCircle, AlertCircle, X, Download
} from 'lucide-react';

export default function Admin() {
  const { student, logout } = useAuth();
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [newSt, setNewSt]         = useState({ name:'', prn:'', email:'', password:'password', institute:'BIMM', spec:'', hostel:'Day Scholar', hostelName:'', roomNo:'' });
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  useEffect(() => {
    if (!student) { navigate('/admin'); return; }
    loadStudents();
  }, [student]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStudents = async () => {
    setLoading(true);
    const list = await fetchStudentsRoster();
    setStudents(list);
    setLoading(false);
  };

  const handleDelete = async (prn) => {
    if (!window.confirm(`Delete student PRN ${prn}?`)) return;
    await deleteStudentByPRN(prn);
    setStudents(s => s.filter(x => String(x.prn) !== String(prn)));
    showToast('Student deleted');
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newSt.prn || !newSt.name) return showToast('PRN and Name are required', 'error');
    await addSingleStudent({ ...newSt, prn_lower: newSt.prn.toLowerCase(), email_lower: (newSt.email || '').toLowerCase() });
    setStudents(s => [newSt, ...s.filter(x => x.prn !== newSt.prn)]);
    showToast(`${newSt.name} added successfully`);
    setShowAdd(false);
    setNewSt({ name:'', prn:'', email:'', password:'password', institute:'BIMM', spec:'', hostel:'Day Scholar', hostelName:'', roomNo:'' });
  };

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true); setImportProgress(0);
    try {
      const data = await file.arrayBuffer();
      const wb   = XLSX.read(data, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      const mapped = rows.map(r => ({
        name:      r['Name'] || r['name'] || r['Full Name'] || '',
        prn:       String(r['PRN'] || r['prn'] || r['Roll No'] || r['rollno'] || '').trim(),
        email:     r['Email'] || r['email'] || '',
        password:  r['Password'] || r['password'] || 'password',
        institute: r['Institute'] || r['institute'] || 'BIMM',
        spec:      r['Specialization'] || r['spec'] || r['Course'] || '',
        hostel:    r['Hostel'] || r['hostel'] || 'Day Scholar',
        hostelName:r['Hostel Name'] || r['hostelName'] || '',
        roomNo:    String(r['Room No'] || r['roomNo'] || '').trim(),
      })).filter(s => s.prn && s.name);

      const result = await batchUploadStudents(mapped, (cur, tot) => setImportProgress(Math.round(cur / tot * 100)));
      showToast(`${result.importedCount} students imported successfully!`);
      await loadStudents();
    } catch(err) {
      console.error(err);
      showToast('Import failed: ' + err.message, 'error');
    }
    setImporting(false);
    e.target.value = '';
  };

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.prn  || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.institute || '').toLowerCase().includes(search.toLowerCase())
  );

  const hostelCount = students.filter(s => s.hostel === 'Hostel Resident').length;

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/sbup-logo.png" alt="SBUP" style={{ height: 36, filter: 'brightness(0) invert(1)' }} />
          <div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>
              SBUP Connect <span style={{ color: '#F59E0B' }}>Admin</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Sri Balaji University Pune</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <Shield size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Admin Mode
          </span>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        {/* Stats */}
        <div className="admin-stats" style={{ marginTop: 24 }}>
          {[
            { label: 'Total Students', value: students.length, icon: Users, color: '#0EA5E9', bg: '#E0F2FE' },
            { label: 'Hostel Residents', value: hostelCount, icon: Shield, color: '#8B5CF6', bg: '#EDE9FE' },
            { label: 'Day Scholars', value: students.length - hostelCount, icon: Users, color: '#10B981', bg: '#D1FAE5' },
            { label: 'Institutes', value: new Set(students.map(s => s.institute)).size, icon: Shield, color: '#F59E0B', bg: '#FEF3C7' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={20} />
              </div>
              <div>
                <div className="stat-val">{loading ? '—' : value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', margin: '20px 0' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200, margin: 0 }}>
            <Search size={16} color="var(--navy-400)" />
            <input
              placeholder="Search by name, PRN, or institute…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="btn btn-outline btn-sm" onClick={loadStudents}>
            <RefreshCw size={14} /> Refresh
          </button>

          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()} disabled={importing}>
            <Upload size={14} />
            {importing ? `Importing ${importProgress}%…` : 'Import Excel'}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleExcelImport} />

          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Student
          </button>
        </div>

        {/* Import progress */}
        {importing && (
          <div style={{ background: '#fff', border: '1px solid var(--navy-200)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              <span>Importing students…</span>
              <span>{importProgress}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--navy-200)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${importProgress}%`, background: 'var(--sky-500)', borderRadius: 99, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--navy-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>
              Student Roster <span className="badge badge-primary" style={{ marginLeft: 8 }}>{filtered.length}</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>PRN</th>
                  <th>Email</th>
                  <th>Institute</th>
                  <th>Specialization</th>
                  <th>Hostel</th>
                  <th>Room</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--navy-400)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 20, height: 20, border: '2px solid var(--navy-200)', borderTopColor: 'var(--sky-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      Loading students…
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--navy-400)' }}>
                    No students found
                  </td></tr>
                ) : filtered.map((s, i) => (
                  <tr key={s.prn || i}>
                    <td style={{ color: 'var(--navy-400)', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{s.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.prn}</td>
                    <td style={{ fontSize: 12 }}>{s.email || `${s.prn}@sbup.edu.in`}</td>
                    <td><span className="badge badge-primary">{s.institute}</span></td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.spec}</td>
                    <td>
                      <span className={`badge ${s.hostel === 'Hostel Resident' ? 'badge-success' : 'badge-gray'}`}>
                        {s.hostel === 'Hostel Resident' ? 'Hostel' : 'Day Scholar'}
                      </span>
                    </td>
                    <td>{s.roomNo || '—'}</td>
                    <td>
                      <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none' }}
                        onClick={() => handleDelete(s.prn)}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--navy)' }}>Add New Student</div>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy-400)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'name', label: 'Full Name', ph: 'e.g. Bhushan Padghan', type: 'text', required: true },
                { key: 'prn', label: 'PRN / Roll No', ph: 'e.g. 20230948271', type: 'text', required: true },
                { key: 'email', label: 'Email', ph: 'name@sbup.edu.in', type: 'email' },
                { key: 'password', label: 'Password', ph: 'Default: password', type: 'text' },
                { key: 'spec', label: 'Specialization', ph: 'e.g. Data Science', type: 'text' },
              ].map(({ key, label, ph, type, required }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" style={{ paddingLeft: 14 }} type={type} placeholder={ph} required={required}
                    value={newSt[key]} onChange={e => setNewSt(s => ({ ...s, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Institute</label>
                <select className="form-input" style={{ paddingLeft: 14 }} value={newSt.institute}
                  onChange={e => setNewSt(s => ({ ...s, institute: e.target.value }))}>
                  {['BIMM','BITM','BIIB','BIMHRD','SBSCS'].map(inst => <option key={inst}>{inst}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hostel Status</label>
                <select className="form-input" style={{ paddingLeft: 14 }} value={newSt.hostel}
                  onChange={e => setNewSt(s => ({ ...s, hostel: e.target.value }))}>
                  <option>Day Scholar</option>
                  <option>Hostel Resident</option>
                </select>
              </div>
              {newSt.hostel === 'Hostel Resident' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Hostel Name</label>
                    <input className="form-input" style={{ paddingLeft: 14 }} placeholder="Sri Balaji University Hostel"
                      value={newSt.hostelName} onChange={e => setNewSt(s => ({ ...s, hostelName: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Number</label>
                    <input className="form-input" style={{ paddingLeft: 14 }} placeholder="e.g. 304"
                      value={newSt.roomNo} onChange={e => setNewSt(s => ({ ...s, roomNo: e.target.value }))} />
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 600,
          background: toast.type === 'error' ? '#EF4444' : '#10B981',
          color: '#fff', padding: '14px 20px', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeInUp 0.3s ease both', fontSize: 14, fontWeight: 600
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
