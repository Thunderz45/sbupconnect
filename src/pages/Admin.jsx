import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import {
  fetchStudentList, fetchRegisteredStudents, addStudent, updateStudent, deleteStudentFromList,
  batchUploadStudentList, getAllAttendance, batchUploadAttendance, setSingleStudentAttendance,
  getAllNotes, createNote, deleteNote,
  getAllTimetables, saveTimetable, deleteTimetable, batchUploadTimetable,
  getAllNotices, createNotice, updateNotice, deleteNotice,
  getDailyNews, createDailyNews, deleteDailyNews,
  getAllNotifications, createNotification, toggleNotificationStatus, deleteNotification,
  getAllFaculty, createFaculty, deleteFaculty,
  INSTITUTES, SPECIALIZATIONS_BY_INSTITUTE, SEMESTERS, notifyDataChanged
} from '../firebase/service';
import {
  Users, CheckCircle2, Clock, FileText, Bell, AlertTriangle,
  Upload, Trash2, Edit2, Plus, Search, Filter, RefreshCw,
  LogOut, Shield, ChevronDown, Check, X, Download, Eye,
  Sparkles, ExternalLink, Calendar, BookOpen, Building2,
  Menu, HelpCircle, AlertCircle, ArrowRight, UserCheck
} from 'lucide-react';

export default function Admin() {
  const { student, role, logout } = useAuth();
  const navigate = useNavigate();

  // Tab navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileAdminSidebarOpen, setMobileAdminSidebarOpen] = useState(false);

  // Global loading and toast
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Data states
  const [students, setStudents] = useState([]);
  const [registeredRolls, setRegisteredRolls] = useState(new Set());
  const [attendanceList, setAttendanceList] = useState([]);
  const [notes, setNotes] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [notices, setNotices] = useState([]);
  const [news, setNews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Filter & Search states
  const [studentSearch, setStudentSearch] = useState('');
  const [instituteFilter, setInstituteFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [attSearch, setAttSearch] = useState('');
  const [attInstFilter, setAttInstFilter] = useState('all');
  const [notesInstFilter, setNotesInstFilter] = useState('all');

  // Timetable active selection
  const [selectedTTInstitute, setSelectedTTInstitute] = useState('BIMM');
  const [selectedTTSemester, setSelectedTTSemester] = useState('Semester 1');

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '', rollNumber: '', institute: 'BIMM', specialization: 'Data Science and Business Analytics', semester: 'Semester 1'
  });

  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [attForm, setAttForm] = useState({ rollNumber: '', studentName: '', institute: 'BIMM', specialization: '', attendance: 85 });

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    subject: '', title: '', facultyName: '', institute: 'BIMM',
    specialization: 'Data Science and Business Analytics', semester: 'Semester 1',
    fileName: '', fileUrl: '#'
  });

  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotForm, setNewSlotForm] = useState({
    day: 'Monday', time: '09:00 AM - 10:30 AM', subject: '', faculty: '', breakTime: 'None', remarks: 'Classroom Hall'
  });

  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '', description: '', category: 'General', institute: 'All', priority: 'normal', isPinned: false
  });

  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: '', description: '', imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80', externalLink: 'https://www.sbup.edu.in'
  });

  const [showAddNotifModal, setShowAddNotifModal] = useState(false);
  const [notifForm, setNotifForm] = useState({
    title: '', message: '', type: 'urgent', link: '/dashboard'
  });

  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    name: '', designation: 'Professor', institute: 'BIMM', department: 'Management Studies',
    email: '', cabin: '', officeHours: 'Mon-Wed 3:00 PM - 5:00 PM'
  });

  // Report states for file uploads
  const [attUploadReport, setAttUploadReport] = useState(null);
  const [studentUploadReport, setStudentUploadReport] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        studList, regRolls, attList, noteList, ttList,
        noticeList, newsList, notifList, facList
      ] = await Promise.all([
        fetchStudentList(),
        fetchRegisteredStudents(),
        getAllAttendance(),
        getAllNotes(),
        getAllTimetables(),
        getAllNotices(),
        getDailyNews(),
        getAllNotifications(),
        getAllFaculty()
      ]);

      setStudents(studList || []);
      setRegisteredRolls(new Set(regRolls || []));
      setAttendanceList(attList || []);
      setNotes(noteList || []);
      setTimetables(ttList || []);
      setNotices(noticeList || []);
      setNews(newsList || []);
      setNotifications(notifList || []);
      setFacultyList(facList || []);
    } catch (e) {
      console.error('Error loading admin data:', e);
      showToast('Error loading some admin collections', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Student Actions ──────────────────────────────────────────
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.rollNumber) {
      showToast('Name and Roll Number are required', 'error');
      return;
    }

    if (editingStudent) {
      await updateStudent(editingStudent.rollNumber, studentForm);
      showToast('Student details updated');
    } else {
      const res = await addStudent(studentForm);
      if (res.success) {
        showToast('Student added successfully to university roster');
      } else {
        showToast(res.error, 'error');
        return;
      }
    }

    setShowAddStudentModal(false);
    setEditingStudent(null);
    setStudentForm({ name: '', rollNumber: '', institute: 'BIMM', specialization: 'Data Science and Business Analytics', semester: 'Semester 1' });
    await loadAllData();
  };

  const handleDeleteStudent = async (rollNumber) => {
    if (!window.confirm(`Delete student with roll number ${rollNumber}?`)) return;
    const res = await deleteStudentFromList(rollNumber);
    if (res.success) {
      showToast('Student removed from roster');
      await loadAllData();
    } else {
      showToast('Failed to delete student', 'error');
    }
  };

  const handleStudentExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);

      const mapped = rows.map(r => ({
        name: (r['Student Name'] || r['Name'] || r['name'] || '').toString().trim(),
        rollNumber: (r['Roll Number'] || r['Roll No'] || r['rollno'] || r['PRN'] || '').toString().trim(),
        institute: (r['Institute'] || r['Institute Code'] || 'BIMM').toString().trim(),
        specialization: (r['Specialization'] || r['Branch'] || 'Data Science and Business Analytics').toString().trim(),
        semester: (r['Semester'] || r['Term'] || 'Semester 1').toString().trim()
      })).filter(r => r.rollNumber && r.name);

      if (mapped.length === 0) {
        showToast('No valid rows found. Ensure columns: Student Name, Roll Number, Institute, Specialization', 'error');
        e.target.value = '';
        return;
      }

      const res = await batchUploadStudentList(mapped);
      setStudentUploadReport({
        total: mapped.length,
        importedCount: res.importedCount,
        time: new Date().toLocaleTimeString()
      });

      showToast(`Imported ${res.importedCount} student records successfully!`);
      await loadAllData();
    } catch (err) {
      showToast('Import error: ' + err.message, 'error');
    }
    e.target.value = '';
  };

  // ── Attendance Actions ───────────────────────────────────────
  const handleAttendanceExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);

      const mapped = rows.map(r => {
        const rn = (r['Roll Number'] || r['Roll No'] || r['rollno'] || r['PRN'] || '').toString().trim();
        // find student metadata if available
        const sMatch = students.find(s => String(s.rollNumber).trim() === rn);
        return {
          studentName: (r['Student Name'] || r['Name'] || r['name'] || sMatch?.name || '').toString().trim(),
          rollNumber: rn,
          institute: (r['Institute'] || sMatch?.institute || 'BIMM').toString().trim(),
          specialization: (r['Specialization'] || sMatch?.specialization || '').toString().trim(),
          attendance: (r['Attendance'] || r['Attendance %'] || r['Percentage'] || r['attendance'] || '0').toString().trim()
        };
      }).filter(r => r.rollNumber);

      if (mapped.length === 0) {
        showToast('No valid rows found. Ensure columns: Roll Number, Attendance %, Student Name', 'error');
        e.target.value = '';
        return;
      }

      const res = await batchUploadAttendance(mapped);
      setAttUploadReport({
        total: mapped.length,
        successCount: res.successCount,
        failedCount: res.failedCount,
        time: new Date().toLocaleTimeString()
      });

      showToast(`Attendance updated: ${res.successCount} records synced!`);
      await loadAllData();
    } catch (err) {
      showToast('Attendance import error: ' + err.message, 'error');
    }
    e.target.value = '';
  };

  const handleSaveSingleAttendance = async (e) => {
    e.preventDefault();
    if (!attForm.rollNumber) {
      showToast('Roll number is required', 'error');
      return;
    }
    await setSingleStudentAttendance(
      attForm.rollNumber,
      attForm.attendance,
      attForm.studentName,
      attForm.institute,
      attForm.specialization
    );
    showToast(`Attendance updated for ${attForm.rollNumber}`);
    setShowAddAttendanceModal(false);
    setAttForm({ rollNumber: '', studentName: '', institute: 'BIMM', specialization: '', attendance: 85 });
    await loadAllData();
  };

  // ── Notes Actions ────────────────────────────────────────────
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteForm.subject || !noteForm.title) {
      showToast('Subject and Title are required', 'error');
      return;
    }

    await createNote({
      ...noteForm,
      fileName: noteForm.fileName || `${noteForm.subject.replace(/\s+/g, '_')}_Lecture_Notes.pdf`
    });

    showToast(`Note published for ${noteForm.institute} (${noteForm.specialization})`);
    setShowAddNoteModal(false);
    setNoteForm({
      subject: '', title: '', facultyName: '', institute: 'BIMM',
      specialization: 'Data Science and Business Analytics', semester: 'Semester 1',
      fileName: '', fileUrl: '#'
    });
    await loadAllData();
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this course note?')) return;
    await deleteNote(id);
    showToast('Course note removed');
    await loadAllData();
  };

  // ── Timetable Actions ────────────────────────────────────────
  const handleAddSlotToTimetable = async (e) => {
    e.preventDefault();
    if (!newSlotForm.subject) {
      showToast('Subject name is required', 'error');
      return;
    }

    const existingTT = timetables.find(t => t.institute === selectedTTInstitute && t.semester === selectedTTSemester);
    const updatedSchedule = existingTT ? [...existingTT.schedule, newSlotForm] : [newSlotForm];

    await saveTimetable({
      institute: selectedTTInstitute,
      semester: selectedTTSemester,
      specialization: 'Core Batch',
      schedule: updatedSchedule,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    showToast(`Lecture added to ${selectedTTInstitute} (${selectedTTSemester})`);
    setShowAddSlotModal(false);
    setNewSlotForm({
      day: 'Monday', time: '09:00 AM - 10:30 AM', subject: '', faculty: '', breakTime: 'None', remarks: 'Classroom Hall'
    });
    await loadAllData();
  };

  const handleDeleteSlot = async (slotIndex) => {
    const existingTT = timetables.find(t => t.institute === selectedTTInstitute && t.semester === selectedTTSemester);
    if (!existingTT) return;
    const newSchedule = existingTT.schedule.filter((_, idx) => idx !== slotIndex);
    await saveTimetable({
      ...existingTT,
      schedule: newSchedule,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    showToast('Lecture slot removed');
    await loadAllData();
  };

  // ── Notice Actions ───────────────────────────────────────────
  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.description) {
      showToast('Title and Description are required', 'error');
      return;
    }
    await createNotice(noticeForm);
    showToast('Circular notice published');
    setShowAddNoticeModal(false);
    setNoticeForm({ title: '', description: '', category: 'General', institute: 'All', priority: 'normal', isPinned: false });
    await loadAllData();
  };

  const handleTogglePinNotice = async (notice) => {
    await updateNotice(notice.id, { isPinned: !notice.isPinned });
    showToast(notice.isPinned ? 'Notice unpinned' : 'Notice pinned to top');
    await loadAllData();
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this circular notice?')) return;
    await deleteNotice(id);
    showToast('Notice deleted');
    await loadAllData();
  };

  // ── Daily News Actions ───────────────────────────────────────
  const handleSaveNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.description) {
      showToast('Title and Description are required', 'error');
      return;
    }
    await createDailyNews(newsForm);
    showToast('Campus news article published');
    setShowAddNewsModal(false);
    setNewsForm({ title: '', description: '', imageUrl: '', externalLink: 'https://www.sbup.edu.in' });
    await loadAllData();
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Delete this news item?')) return;
    await deleteDailyNews(id);
    showToast('News article deleted');
    await loadAllData();
  };

  // ── Notifications Actions ────────────────────────────────────
  const handleSaveNotif = async (e) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) {
      showToast('Title and Message are required', 'error');
      return;
    }
    await createNotification(notifForm);
    showToast('Banner alert broadcast published');
    setShowAddNotifModal(false);
    setNotifForm({ title: '', message: '', type: 'urgent', link: '/dashboard' });
    await loadAllData();
  };

  const handleToggleNotif = async (id) => {
    await toggleNotificationStatus(id);
    showToast('Notification status updated');
    await loadAllData();
  };

  const handleDeleteNotif = async (id) => {
    await deleteNotification(id);
    showToast('Notification deleted');
    await loadAllData();
  };

  // ── Faculty Actions ──────────────────────────────────────────
  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    if (!facultyForm.name || !facultyForm.email) {
      showToast('Faculty Name and Email are required', 'error');
      return;
    }
    await createFaculty(facultyForm);
    showToast(`Faculty profile added for ${facultyForm.name}`);
    setShowAddFacultyModal(false);
    setFacultyForm({
      name: '', designation: 'Professor', institute: 'BIMM', department: 'Management Studies',
      email: '', cabin: '', officeHours: 'Mon-Wed 3:00 PM - 5:00 PM'
    });
    await loadAllData();
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Remove this faculty member from directory?')) return;
    await deleteFaculty(id);
    showToast('Faculty profile removed');
    await loadAllData();
  };

  // ── Filtered Students ────────────────────────────────────────
  const filteredStudents = students.filter(s => {
    const matchSearch = (s.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                        (s.rollNumber || '').toLowerCase().includes(studentSearch.toLowerCase());
    const matchInst = instituteFilter === 'all' || s.institute === instituteFilter;
    const matchSem  = semesterFilter === 'all' || s.semester === semesterFilter;
    return matchSearch && matchInst && matchSem;
  });

  const registeredCount = students.filter(s => registeredRolls.has(String(s.rollNumber))).length;

  // Filtered Attendance
  const filteredAttendance = attendanceList.filter(a => {
    const matchSearch = (a.studentName || '').toLowerCase().includes(attSearch.toLowerCase()) ||
                        (a.rollNumber || '').toLowerCase().includes(attSearch.toLowerCase());
    const matchInst = attInstFilter === 'all' || a.institute === attInstFilter;
    return matchSearch && matchInst;
  });

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    return notesInstFilter === 'all' || n.institute === notesInstFilter;
  });

  const currentTT = timetables.find(t => t.institute === selectedTTInstitute && t.semester === selectedTTSemester);

  // Available specializations for target institute in modals
  const activeNoteSpecs = SPECIALIZATIONS_BY_INSTITUTE[noteForm.institute] || ['All Specializations'];
  const activeStudentSpecs = SPECIALIZATIONS_BY_INSTITUTE[studentForm.institute] || ['All Specializations'];

  return (
    <div className="admin-layout">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: toast.type === 'error' ? '#EF4444' : '#10B981',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeInUp 0.2s ease'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── MOBILE OVERLAY ────────────────────────────────────── */}
      <div
        className={`admin-overlay${mobileAdminSidebarOpen ? ' active' : ''}`}
        onClick={() => setMobileAdminSidebarOpen(false)}
      />

      {/* ── ADMIN SIDEBAR ────────────────────────────────────── */}
      <aside className={`admin-sidebar${mobileAdminSidebarOpen ? ' open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div>
            {/* Logo & Header */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/sbup-logo.png" alt="SBUP" style={{ height: 36, objectFit: 'contain' }} />
                <div>
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900, fontSize: 16, color: '#fff' }}>
                    SBUP <span style={{ color: '#38BDF8' }}>Admin</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Management Suite</div>
                </div>
              </div>
              <button
                onClick={() => setMobileAdminSidebarOpen(false)}
                className="admin-sidebar-close"
                aria-label="Close menu"
              >
                <X size={20} color="#fff" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { id: 'dashboard', label: 'Overview', icon: Users },
                { id: 'students', label: 'Students Roster', icon: UserCheck },
                { id: 'attendance', label: 'Attendance Records', icon: CheckCircle2 },
                { id: 'notes', label: 'Course Notes', icon: FileText },
                { id: 'timetable', label: 'Schedules / Timetable', icon: Clock },
                { id: 'notices', label: 'Official Notices', icon: Bell },
                { id: 'news', label: 'Campus News', icon: Sparkles },
                { id: 'notifications', label: 'Banner Broadcasts', icon: AlertTriangle },
                { id: 'faculty', label: 'Faculty Directory', icon: Building2 },
                { id: 'institutes', label: 'Institutes & Specs', icon: BookOpen }
              ].map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); setMobileAdminSidebarOpen(false); }}
                    className={`admin-nav-item${active ? ' active' : ''}`}
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile & Logout */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                AD
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {student?.name || 'Administrator'}
                </div>
                <div style={{ color: '#38BDF8', fontSize: 11 }}>University Coordinator</div>
              </div>
            </div>

            <button
              id="admin-logout-btn"
              onClick={() => { logout(); navigate('/admin'); }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────── */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setMobileAdminSidebarOpen(true)}
              className="admin-hamburger"
              aria-label="Open menu"
            >
              <Menu size={22} color="var(--navy)" />
            </button>
            <div>
              <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 900, color: 'var(--navy)' }}>
                {activeTab === 'dashboard' ? 'Admin Overview' :
                 activeTab === 'students' ? 'Students Management' :
                 activeTab === 'attendance' ? 'Attendance Management' :
                 activeTab === 'notes' ? 'Course Notes Publishing' :
                 activeTab === 'timetable' ? 'Timetable & Schedules' :
                 activeTab === 'notices' ? 'Official Notices & Circulars' :
                 activeTab === 'news' ? 'Daily Campus News' :
                 activeTab === 'notifications' ? 'Real-Time Alert Broadcasts' :
                 activeTab === 'faculty' ? 'Faculty & Teacher Directory' :
                 'Institutes & Specializations'}
              </h1>
              <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Sri Balaji University Pune</span>
                <span>•</span>
                <span style={{ color: '#10B981', fontWeight: 600 }}>Active Portal Sync</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={loadAllData}
              title="Refresh Data"
              style={{
                padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
                background: '#fff', color: 'var(--navy)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600
              }}
            >
              <RefreshCw size={14} className={loading ? 'btn-spinner' : ''} />
              <span className="hidden-mobile">Refresh</span>
            </button>

            <Link
              to="/dashboard"
              target="_blank"
              style={{
                padding: '8px 14px', borderRadius: 10, border: 'none',
                background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700,
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)'
              }}
            >
              <Eye size={14} />
              <span>Student View</span>
            </Link>
          </div>
        </header>

        {/* Content body */}
        <main className="admin-content">
          {/* ══════════════ TAB: DASHBOARD ══════════════ */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Quick stats */}
              <div className="admin-stats">
                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">Total Enrolled Students</div>
                      <div className="stat-value">{students.length}</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={22} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#0284C7', fontWeight: 600, marginTop: 10 }}>Across 5 SBUP Institutes</div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">Registered Accounts</div>
                      <div className="stat-value">{registeredCount}</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={22} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 10 }}>
                    {students.length > 0 ? Math.round((registeredCount / students.length) * 100) : 0}% Activation Rate
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">Published Course Notes</div>
                      <div className="stat-value">{notes.length}</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={22} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600, marginTop: 10 }}>Partitioned by Institute & Spec</div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">Active Timetables</div>
                      <div className="stat-value">{timetables.length}</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={22} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#D97706', fontWeight: 600, marginTop: 10 }}>Real-time schedules</div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '24px', marginTop: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', marginBottom: 16 }}>Quick Administrative Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <button
                    onClick={() => { setActiveTab('students'); setShowAddStudentModal(true); }}
                    className="btn btn-primary"
                    style={{ justifyContent: 'center', padding: '12px 16px', borderRadius: 12 }}
                  >
                    <Plus size={16} /> Add New Student
                  </button>

                  <button
                    onClick={() => { setActiveTab('notes'); setShowAddNoteModal(true); }}
                    className="btn"
                    style={{ justifyContent: 'center', padding: '12px 16px', borderRadius: 12, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}
                  >
                    <FileText size={16} /> Publish Course Notes
                  </button>

                  <button
                    onClick={() => { setActiveTab('notices'); setShowAddNoticeModal(true); }}
                    className="btn"
                    style={{ justifyContent: 'center', padding: '12px 16px', borderRadius: 12, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
                  >
                    <Bell size={16} /> Issue Official Notice
                  </button>

                  <button
                    onClick={() => { setActiveTab('notifications'); setShowAddNotifModal(true); }}
                    className="btn"
                    style={{ justifyContent: 'center', padding: '12px 16px', borderRadius: 12, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}
                  >
                    <AlertTriangle size={16} /> Broadcast Live Alert
                  </button>
                </div>
              </div>

              {/* Recent Students Overview */}
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '24px', marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>Recently Enrolled Students</h3>
                  <button onClick={() => setActiveTab('students')} className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--primary-dark)' }}>
                    View Full Roster →
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Roll Number</th>
                        <th>Institute</th>
                        <th>Specialization</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 6).map(s => {
                        const isReg = registeredRolls.has(String(s.rollNumber));
                        return (
                          <tr key={s.rollNumber}>
                            <td style={{ fontWeight: 700 }}>{s.name}</td>
                            <td style={{ fontFamily: 'monospace' }}>{s.rollNumber}</td>
                            <td><span className="badge badge-primary">{s.institute}</span></td>
                            <td style={{ color: 'var(--slate)', fontSize: 13 }}>{s.specialization}</td>
                            <td>
                              <span className={`badge ${isReg ? 'badge-success' : 'badge-warning'}`}>
                                {isReg ? 'Registered' : 'Pending Activation'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: STUDENTS ══════════════ */}
          {activeTab === 'students' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, minWidth: 260 }}>
                  <div className="input-wrapper" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={16} className="input-icon" />
                    <input
                      className="form-input"
                      style={{ height: 42, paddingLeft: 38 }}
                      placeholder="Search student name or roll number…"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-input"
                    style={{ width: 'auto', height: 42, paddingLeft: 12 }}
                    value={instituteFilter}
                    onChange={e => setInstituteFilter(e.target.value)}
                  >
                    <option value="all">All Institutes</option>
                    {INSTITUTES.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.id}</option>
                    ))}
                  </select>

                  <select
                    className="form-input"
                    style={{ width: 'auto', height: 42, paddingLeft: 12 }}
                    value={semesterFilter}
                    onChange={e => setSemesterFilter(e.target.value)}
                  >
                    <option value="all">All Semesters</option>
                    {SEMESTERS.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <label
                    className="btn btn-ghost"
                    style={{ height: 42, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: '1px dashed var(--border)' }}
                    title="Upload student roster via Excel/CSV"
                  >
                    <Upload size={16} />
                    <span>Import Excel</span>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleStudentExcelImport} style={{ display: 'none' }} />
                  </label>

                  <button
                    onClick={() => {
                      setEditingStudent(null);
                      setStudentForm({ name: '', rollNumber: '', institute: 'BIMM', specialization: 'Data Science and Business Analytics', semester: 'Semester 1' });
                      setShowAddStudentModal(true);
                    }}
                    className="btn btn-primary"
                    style={{ height: 42, padding: '0 18px' }}
                  >
                    <Plus size={16} />
                    <span>Add Student</span>
                  </button>
                </div>
              </div>

              {studentUploadReport && (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#065F46' }}>
                  <span>Excel import completed at {studentUploadReport.time}: {studentUploadReport.importedCount} of {studentUploadReport.total} students processed successfully.</span>
                  <button onClick={() => setStudentUploadReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}><X size={16} /></button>
                </div>
              )}

              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Institute</th>
                        <th>Specialization</th>
                        <th>Semester</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                            No student records matching your search or filters.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(s => {
                          const isReg = registeredRolls.has(String(s.rollNumber));
                          return (
                            <tr key={s.rollNumber}>
                              <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{s.rollNumber}</td>
                              <td style={{ fontWeight: 600 }}>{s.name}</td>
                              <td><span className="badge badge-primary">{s.institute}</span></td>
                              <td style={{ fontSize: 13, color: 'var(--slate)' }}>{s.specialization}</td>
                              <td style={{ fontSize: 13 }}>{s.semester || 'Semester 1'}</td>
                              <td>
                                <span className={`badge ${isReg ? 'badge-success' : 'badge-warning'}`}>
                                  {isReg ? 'Registered' : 'Pending'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: 6 }}>
                                  <button
                                    onClick={() => {
                                      setEditingStudent(s);
                                      setStudentForm({
                                        name: s.name || '',
                                        rollNumber: s.rollNumber || '',
                                        institute: s.institute || 'BIMM',
                                        specialization: s.specialization || '',
                                        semester: s.semester || 'Semester 1'
                                      });
                                      setShowAddStudentModal(true);
                                    }}
                                    title="Edit Student"
                                    style={{ padding: '6px', borderRadius: 6, border: '1px solid var(--border)', background: '#F8FAFC', cursor: 'pointer' }}
                                  >
                                    <Edit2 size={14} color="var(--navy)" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudent(s.rollNumber)}
                                    title="Delete Student"
                                    style={{ padding: '6px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer' }}
                                  >
                                    <Trash2 size={14} color="#EF4444" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: ATTENDANCE ══════════════ */}
          {activeTab === 'attendance' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, minWidth: 260 }}>
                  <div className="input-wrapper" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={16} className="input-icon" />
                    <input
                      className="form-input"
                      style={{ height: 42, paddingLeft: 38 }}
                      placeholder="Search by student name or roll number…"
                      value={attSearch}
                      onChange={e => setAttSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-input"
                    style={{ width: 'auto', height: 42, paddingLeft: 12 }}
                    value={attInstFilter}
                    onChange={e => setAttInstFilter(e.target.value)}
                  >
                    <option value="all">All Institutes</option>
                    {INSTITUTES.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.id}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <label
                    className="btn btn-ghost"
                    style={{ height: 42, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: '1px dashed var(--border)' }}
                    title="Upload attendance percentage via Excel"
                  >
                    <Upload size={16} />
                    <span>Upload Attendance Excel</span>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleAttendanceExcelImport} style={{ display: 'none' }} />
                  </label>

                  <button
                    onClick={() => {
                      setAttForm({ rollNumber: '', studentName: '', institute: 'BIMM', specialization: '', attendance: 85 });
                      setShowAddAttendanceModal(true);
                    }}
                    className="btn btn-primary"
                    style={{ height: 42, padding: '0 18px' }}
                  >
                    <Plus size={16} />
                    <span>Set Attendance</span>
                  </button>
                </div>
              </div>

              {attUploadReport && (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#065F46' }}>
                  <span>Attendance spreadsheet processed at {attUploadReport.time}: {attUploadReport.successCount} student records updated successfully.</span>
                  <button onClick={() => setAttUploadReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}><X size={16} /></button>
                </div>
              )}

              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Institute</th>
                        <th>Specialization</th>
                        <th>Attendance %</th>
                        <th>Eligibility Status</th>
                        <th>Last Updated</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                            No attendance records available. Import Excel or set individual attendance.
                          </td>
                        </tr>
                      ) : (
                        filteredAttendance.map(a => {
                          const pct = a.attendance ?? 85;
                          const isEligible = pct >= 75;
                          return (
                            <tr key={a.rollNumber}>
                              <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{a.rollNumber}</td>
                              <td style={{ fontWeight: 600 }}>{a.studentName || '—'}</td>
                              <td><span className="badge badge-primary">{a.institute || 'BIMM'}</span></td>
                              <td style={{ fontSize: 13, color: 'var(--slate)' }}>{a.specialization || '—'}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <strong style={{ fontSize: 14, color: isEligible ? '#059669' : '#DC2626' }}>{pct}%</strong>
                                  <div style={{ width: 60, height: 6, borderRadius: 99, background: '#E2E8F0', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: isEligible ? '#10B981' : '#EF4444' }} />
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${isEligible ? 'badge-success' : 'badge-danger'}`}>
                                  {isEligible ? 'Eligible (≥75%)' : 'Shortage (<75%)'}
                                </span>
                              </td>
                              <td style={{ fontSize: 12, color: 'var(--muted)' }}>{a.lastUpdated || 'Recent'}</td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  onClick={() => {
                                    setAttForm({
                                      rollNumber: a.rollNumber,
                                      studentName: a.studentName || '',
                                      institute: a.institute || 'BIMM',
                                      specialization: a.specialization || '',
                                      attendance: a.attendance ?? 85
                                    });
                                    setShowAddAttendanceModal(true);
                                  }}
                                  title="Edit Attendance"
                                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: '#F8FAFC', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                >
                                  Update
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: NOTES ══════════════ */}
          {activeTab === 'notes' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select
                    className="form-input"
                    style={{ width: 'auto', height: 42, paddingLeft: 12 }}
                    value={notesInstFilter}
                    onChange={e => setNotesInstFilter(e.target.value)}
                  >
                    <option value="all">All Institutes</option>
                    {INSTITUTES.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.id}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Notes are strictly isolated by Institute & Specialization.
                  </span>
                </div>

                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="btn btn-primary"
                  style={{ height: 42, padding: '0 18px' }}
                >
                  <Plus size={16} />
                  <span>Upload Course Note</span>
                </button>
              </div>

              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Topic / Title</th>
                        <th>Target Institute</th>
                        <th>Target Specialization</th>
                        <th>Semester</th>
                        <th>Faculty</th>
                        <th>Uploaded</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotes.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                            No notes uploaded yet. Click "Upload Course Note" to publish.
                          </td>
                        </tr>
                      ) : (
                        filteredNotes.map(n => (
                          <tr key={n.id}>
                            <td style={{ fontWeight: 700, color: 'var(--navy)' }}>{n.subject}</td>
                            <td style={{ fontWeight: 600 }}>{n.title}</td>
                            <td><span className="badge badge-primary">{n.institute}</span></td>
                            <td style={{ fontSize: 13, color: 'var(--slate)' }}>{n.specialization}</td>
                            <td style={{ fontSize: 12 }}>{n.semester}</td>
                            <td style={{ fontSize: 13, color: 'var(--slate)' }}>{n.facultyName || 'Department'}</td>
                            <td style={{ fontSize: 12, color: 'var(--muted)' }}>{n.uploadDate}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteNote(n.id)}
                                title="Delete Note"
                                style={{ padding: '6px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer' }}
                              >
                                <Trash2 size={14} color="#EF4444" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: TIMETABLE ══════════════ */}
          {activeTab === 'timetable' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Institute:</label>
                  <select
                    className="form-input"
                    style={{ width: 'auto', height: 40, paddingLeft: 12 }}
                    value={selectedTTInstitute}
                    onChange={e => setSelectedTTInstitute(e.target.value)}
                  >
                    {INSTITUTES.map(i => <option key={i.id} value={i.id}>{i.id}</option>)}
                  </select>

                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginLeft: 8 }}>Semester:</label>
                  <select
                    className="form-input"
                    style={{ width: 'auto', height: 40, paddingLeft: 12 }}
                    value={selectedTTSemester}
                    onChange={e => setSelectedTTSemester(e.target.value)}
                  >
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <button
                  onClick={() => setShowAddSlotModal(true)}
                  className="btn btn-primary"
                  style={{ height: 40, padding: '0 16px' }}
                >
                  <Plus size={16} />
                  <span>Add Lecture Slot</span>
                </button>
              </div>

              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>
                      Schedule for {selectedTTInstitute} — {selectedTTSemester}
                    </h3>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {currentTT?.schedule?.length || 0} scheduled sessions configured
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Time Interval</th>
                        <th>Subject</th>
                        <th>Faculty</th>
                        <th>Break</th>
                        <th>Venue / Remarks</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!currentTT || !currentTT.schedule || currentTT.schedule.length === 0) ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                            No lecture slots scheduled for {selectedTTInstitute} ({selectedTTSemester}). Click "Add Lecture Slot" to configure.
                          </td>
                        </tr>
                      ) : (
                        currentTT.schedule.map((slot, idx) => (
                          <tr key={idx}>
                            <td><span className="badge badge-primary">{slot.day}</span></td>
                            <td style={{ fontWeight: 600, fontSize: 13 }}>{slot.time}</td>
                            <td style={{ fontWeight: 700, color: 'var(--navy)' }}>{slot.subject}</td>
                            <td style={{ color: 'var(--slate)' }}>{slot.faculty || '—'}</td>
                            <td style={{ fontSize: 12, color: 'var(--muted)' }}>{slot.breakTime || 'None'}</td>
                            <td style={{ fontSize: 12, color: 'var(--slate)' }}>{slot.remarks || '—'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteSlot(idx)}
                                title="Remove Slot"
                                style={{ padding: '6px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer' }}
                              >
                                <Trash2 size={14} color="#EF4444" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: NOTICES ══════════════ */}
          {activeTab === 'notices' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Important notices are highlighted on student overview dashboards.
                </span>
                <button
                  onClick={() => setShowAddNoticeModal(true)}
                  className="btn btn-primary"
                  style={{ height: 42, padding: '0 18px' }}
                >
                  <Plus size={16} />
                  <span>Issue New Notice</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notices.map(notice => (
                  <div key={notice.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        {notice.isPinned && (
                          <span style={{ background: '#EFF6FF', color: '#0284C7', border: '1px solid #BAE6FD', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            📌 Pinned to Top
                          </span>
                        )}
                        <span className={`badge ${notice.priority === 'urgent' ? 'badge-danger' : notice.priority === 'important' ? 'badge-warning' : 'badge-primary'}`}>
                          {notice.priority?.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{notice.date}</span>
                        <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600 }}>• Target: {notice.institute}</span>
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>{notice.title}</h4>
                      <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5 }}>{notice.description}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleTogglePinNotice(notice)}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: '#F8FAFC', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        {notice.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        style={{ padding: '8px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ TAB: NEWS ══════════════ */}
          {activeTab === 'news' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Campus news highlights appear on the student dashboard news tab.
                </span>
                <button
                  onClick={() => setShowAddNewsModal(true)}
                  className="btn btn-primary"
                  style={{ height: 42, padding: '0 18px' }}
                >
                  <Plus size={16} />
                  <span>Publish Campus News</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {news.map(item => (
                  <div key={item.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                    )}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{item.date}</div>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 8, lineHeight: 1.3 }}>{item.title}</h4>
                        <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5, marginBottom: 12 }}>{item.description}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                        <a href={item.externalLink || '#'} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>Read Link</span>
                          <ExternalLink size={12} />
                        </a>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          style={{ padding: '6px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ TAB: NOTIFICATIONS ══════════════ */}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Active notifications appear in the top alert banner on all student portal screens.
                </span>
                <button
                  onClick={() => setShowAddNotifModal(true)}
                  className="btn btn-primary"
                  style={{ height: 42, padding: '0 18px' }}
                >
                  <Plus size={16} />
                  <span>Broadcast New Alert</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className={`badge ${n.type === 'urgent' ? 'badge-danger' : n.type === 'exam' ? 'badge-primary' : 'badge-warning'}`}>
                          {n.type?.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{n.date}</span>
                        <span className={`badge ${n.isActive !== false ? 'badge-success' : 'badge-ghost'}`}>
                          {n.isActive !== false ? 'Broadcast Active' : 'Inactive'}
                        </span>
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>{n.title}</h4>
                      <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 2 }}>{n.message}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleToggleNotif(n.id)}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: '#F8FAFC', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        {n.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteNotif(n.id)}
                        style={{ padding: '8px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ TAB: FACULTY DIRECTORY ══════════════ */}
          {activeTab === 'faculty' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Manage faculty details, office hours, and contact info visible to students.
                </span>
                <button
                  onClick={() => setShowAddFacultyModal(true)}
                  className="btn btn-primary"
                  style={{ height: 42, padding: '0 18px' }}
                >
                  <Plus size={16} />
                  <span>Add Faculty Member</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {facultyList.map(f => (
                  <div key={f.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <span className="badge badge-primary">{f.institute}</span>
                        <button
                          onClick={() => handleDeleteFaculty(f.id)}
                          style={{ padding: '4px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} color="#EF4444" />
                        </button>
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>{f.name}</h4>
                      <div style={{ fontSize: 12, color: 'var(--primary-dark)', fontWeight: 600, marginTop: 2 }}>{f.designation}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>Dept: {f.department}</div>

                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #F1F5F9', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div><strong style={{ color: 'var(--navy)' }}>Email:</strong> {f.email}</div>
                        <div><strong style={{ color: 'var(--navy)' }}>Cabin:</strong> {f.cabin}</div>
                        <div><strong style={{ color: 'var(--navy)' }}>Hours:</strong> {f.officeHours}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ TAB: INSTITUTES & SPECIALIZATIONS ══════════════ */}
          {activeTab === 'institutes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '24px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>
                  Configured Sri Balaji University Pune Institutes
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                  Content posted for specific institutes is strictly partitioned and only visible to students belonging to that institute.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {INSTITUTES.map(inst => {
                    const specs = SPECIALIZATIONS_BY_INSTITUTE[inst.id] || [];
                    const instStudents = students.filter(s => s.institute === inst.id).length;
                    return (
                      <div key={inst.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <span className="badge badge-primary" style={{ marginRight: 8 }}>{inst.id}</span>
                            <strong style={{ fontSize: 15, color: 'var(--navy)' }}>{inst.name}</strong>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)', background: '#EFF6FF', padding: '4px 10px', borderRadius: 99 }}>
                            {instStudents} Students Enrolled
                          </span>
                        </div>

                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', marginBottom: 6 }}>
                            Configured Specializations:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {specs.map(sp => (
                              <span key={sp} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: '#fff', border: '1px solid #CBD5E1', color: 'var(--navy)' }}>
                                {sp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL: ADD / EDIT STUDENT ─────────────────────────── */}
      {showAddStudentModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleSaveStudent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>
                {editingStudent ? 'Edit Student Details' : 'Add Student to Roster'}
              </h3>
              <button type="button" onClick={() => setShowAddStudentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={studentForm.name}
                onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="Student full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">University Roll Number</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={studentForm.rollNumber}
                onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                placeholder="e.g. 20230948280"
                disabled={Boolean(editingStudent)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institute</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={studentForm.institute}
                onChange={e => {
                  const newInst = e.target.value;
                  const newSpecs = SPECIALIZATIONS_BY_INSTITUTE[newInst] || [];
                  setStudentForm({ ...studentForm, institute: newInst, specialization: newSpecs[0] || '' });
                }}
              >
                {INSTITUTES.map(i => <option key={i.id} value={i.id}>{i.id} — {i.short}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Specialization</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={studentForm.specialization}
                onChange={e => setStudentForm({ ...studentForm, specialization: e.target.value })}
              >
                {activeStudentSpecs.map(sp => <option key={sp} value={sp}>{sp}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semester / Term</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={studentForm.semester}
                onChange={e => setStudentForm({ ...studentForm, semester: e.target.value })}
              >
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowAddStudentModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Record</button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: SET ATTENDANCE ─────────────────────────────── */}
      {showAddAttendanceModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleSaveSingleAttendance}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Update Student Attendance</h3>
              <button type="button" onClick={() => setShowAddAttendanceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={attForm.rollNumber}
                onChange={e => {
                  const rn = e.target.value;
                  const found = students.find(s => String(s.rollNumber).trim() === rn.trim());
                  setAttForm({
                    ...attForm,
                    rollNumber: rn,
                    studentName: found ? found.name : attForm.studentName,
                    institute: found ? found.institute : attForm.institute,
                    specialization: found ? found.specialization : attForm.specialization
                  });
                }}
                placeholder="Student roll number"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={attForm.studentName}
                onChange={e => setAttForm({ ...attForm, studentName: e.target.value })}
                placeholder="Student Name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Attendance Percentage (0-100%)</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                type="number"
                min="0"
                max="100"
                value={attForm.attendance}
                onChange={e => setAttForm({ ...attForm, attendance: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowAddAttendanceModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Attendance</button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: ADD NOTE ───────────────────────────────────── */}
      {showAddNoteModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleSaveNote}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Upload Course Notes</h3>
              <button type="button" onClick={() => setShowAddNoteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Target Institute</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={noteForm.institute}
                onChange={e => {
                  const newInst = e.target.value;
                  const newSpecs = newInst === 'All' ? ['All Specializations'] : (SPECIALIZATIONS_BY_INSTITUTE[newInst] || ['All Specializations']);
                  setNoteForm({ ...noteForm, institute: newInst, specialization: newSpecs[0] });
                }}
              >
                <option value="All">All Institutes (University-Wide)</option>
                {INSTITUTES.map(i => <option key={i.id} value={i.id}>{i.id} — {i.name.split('—')[1]}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Specialization</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={noteForm.specialization}
                onChange={e => setNoteForm({ ...noteForm, specialization: e.target.value })}
              >
                {activeNoteSpecs.map(sp => <option key={sp} value={sp}>{sp}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semester</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={noteForm.semester}
                onChange={e => setNoteForm({ ...noteForm, semester: e.target.value })}
              >
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={noteForm.subject}
                onChange={e => setNoteForm({ ...noteForm, subject: e.target.value })}
                placeholder="e.g. Predictive Analytics"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Topic / Title</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={noteForm.title}
                onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                placeholder="e.g. Regression Models (Unit 2)"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Faculty Name (Optional)</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={noteForm.facultyName}
                onChange={e => setNoteForm({ ...noteForm, facultyName: e.target.value })}
                placeholder="e.g. Dr. S. Kulkarni"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowAddNoteModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publish Note</button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: ADD TIMETABLE SLOT ─────────────────────────── */}
      {showAddSlotModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleAddSlotToTimetable}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Add Lecture to Timetable</h3>
              <button type="button" onClick={() => setShowAddSlotModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
              Configuring for: <strong>{selectedTTInstitute}</strong> • <strong>{selectedTTSemester}</strong>
            </div>

            <div className="form-group">
              <label className="form-label">Day</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={newSlotForm.day}
                onChange={e => setNewSlotForm({ ...newSlotForm, day: e.target.value })}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Time Interval</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={newSlotForm.time}
                onChange={e => setNewSlotForm({ ...newSlotForm, time: e.target.value })}
                placeholder="e.g. 09:00 AM - 10:30 AM"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={newSlotForm.subject}
                onChange={e => setNewSlotForm({ ...newSlotForm, subject: e.target.value })}
                placeholder="e.g. Corporate Finance"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Faculty Name</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={newSlotForm.faculty}
                onChange={e => setNewSlotForm({ ...newSlotForm, faculty: e.target.value })}
                placeholder="e.g. Prof. V. Sharma"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Venue / Remarks</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={newSlotForm.remarks}
                onChange={e => setNewSlotForm({ ...newSlotForm, remarks: e.target.value })}
                placeholder="e.g. Hall 4B • Mandatory attendance"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowAddSlotModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add to Schedule</button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: ADD NOTICE ─────────────────────────────────── */}
      {showAddNoticeModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleSaveNotice}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Issue Official Notice</h3>
              <button type="button" onClick={() => setShowAddNoticeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Notice Title</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={noticeForm.title}
                onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                placeholder="e.g. End-Term Examination Timetable"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Institute</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={noticeForm.institute}
                onChange={e => setNoticeForm({ ...noticeForm, institute: e.target.value })}
              >
                <option value="All">All Institutes (University-Wide)</option>
                {INSTITUTES.map(i => <option key={i.id} value={i.id}>{i.id}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={noticeForm.priority}
                onChange={e => setNoticeForm({ ...noticeForm, priority: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Notice Body</label>
              <textarea
                className="form-input"
                style={{ padding: '12px 14px', height: 110, resize: 'vertical' }}
                value={noticeForm.description}
                onChange={e => setNoticeForm({ ...noticeForm, description: e.target.value })}
                placeholder="Detailed instructions for students…"
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <input
                type="checkbox"
                id="pinNoticeCheck"
                checked={noticeForm.isPinned}
                onChange={e => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
              />
              <label htmlFor="pinNoticeCheck" style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}>
                Pin this notice to the top of the dashboard
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button type="button" onClick={() => setShowAddNoticeModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publish Circular</button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: ADD NEWS ───────────────────────────────────── */}
      {showAddNewsModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleSaveNews}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Publish Campus News</h3>
              <button type="button" onClick={() => setShowAddNewsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Headline Title</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={newsForm.title}
                onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                placeholder="e.g. SBUP Hosts Global Leadership Conclave"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={newsForm.imageUrl}
                onChange={e => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">External Read More Link</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={newsForm.externalLink}
                onChange={e => setNewsForm({ ...newsForm, externalLink: e.target.value })}
                placeholder="https://www.sbup.edu.in/news"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Summary / Description</label>
              <textarea
                className="form-input"
                style={{ padding: '12px 14px', height: 100, resize: 'vertical' }}
                value={newsForm.description}
                onChange={e => setNewsForm({ ...newsForm, description: e.target.value })}
                placeholder="Article content summary…"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowAddNewsModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publish Article</button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: ADD NOTIFICATION ALERT ─────────────────────── */}
      {showAddNotifModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleSaveNotif}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Broadcast Alert Banner</h3>
              <button type="button" onClick={() => setShowAddNotifModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Alert Category</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={notifForm.type}
                onChange={e => setNotifForm({ ...notifForm, type: e.target.value })}
              >
                <option value="urgent">Urgent Announcement</option>
                <option value="exam">Examination Alert</option>
                <option value="timetable">Timetable Revision</option>
                <option value="general">General Notice</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Alert Headline</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={notifForm.title}
                onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                placeholder="e.g. Hall Ticket Download Available"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Text</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={notifForm.message}
                onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                placeholder="Brief high-priority message for top banner"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowAddNotifModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Broadcast Immediately</button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: ADD FACULTY ─────────────────────────────────── */}
      {showAddFacultyModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleSaveFaculty}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Add Faculty Member</h3>
              <button type="button" onClick={() => setShowAddFacultyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Faculty Full Name</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={facultyForm.name}
                onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })}
                placeholder="e.g. Dr. Rajesh Kulkarni"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={facultyForm.designation}
                onChange={e => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                placeholder="e.g. Associate Professor & HOD"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institute</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={facultyForm.institute}
                onChange={e => setFacultyForm({ ...facultyForm, institute: e.target.value })}
              >
                {INSTITUTES.map(i => <option key={i.id} value={i.id}>{i.id}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department / Specialization</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={facultyForm.department}
                onChange={e => setFacultyForm({ ...facultyForm, department: e.target.value })}
                placeholder="e.g. Data Science & Business Analytics"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official University Email</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                type="email"
                value={facultyForm.email}
                onChange={e => setFacultyForm({ ...facultyForm, email: e.target.value })}
                placeholder="r.kulkarni@bimm.sbup.edu.in"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cabin / Office Location</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={facultyForm.cabin}
                onChange={e => setFacultyForm({ ...facultyForm, cabin: e.target.value })}
                placeholder="e.g. BIMM Faculty Floor, Cabin 204"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Consultation Hours</label>
              <input
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={facultyForm.officeHours}
                onChange={e => setFacultyForm({ ...facultyForm, officeHours: e.target.value })}
                placeholder="e.g. Mon-Wed 3:00 PM - 5:00 PM"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowAddFacultyModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Faculty Member</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
