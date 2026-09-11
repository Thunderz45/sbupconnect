import { db } from './config';
import {
  collection, getDocs, getDoc, doc, setDoc, deleteDoc,
  query, where, limit, writeBatch, serverTimestamp, onSnapshot
} from 'firebase/firestore';

const SESSION_KEY = 'sbup_session';

// ── Password Hashing (SHA-256 via Web Crypto API) ────────────
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Local Storage Keys ─────────────────────────────────────────
const LOCAL_STUDENT_LIST_KEY = 'sbup_local_student_list';
const LOCAL_REGISTERED_KEY   = 'sbup_local_registered';
const LOCAL_ATTENDANCE_KEY   = 'sbup_local_attendance';
const LOCAL_NOTES_KEY        = 'sbup_local_notes';
const LOCAL_TIMETABLE_KEY    = 'sbup_local_timetable';
const LOCAL_NOTICES_KEY      = 'sbup_local_notices';
const LOCAL_NEWS_KEY         = 'sbup_local_news';
const LOCAL_NOTIF_KEY        = 'sbup_local_notifications';
const LOCAL_FACULTY_KEY      = 'sbup_local_faculty';

// ── Real-Time Cross-Tab / Cross-Window Sync Channel ────────────
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('sbup_connect_sync');
  }
} catch (e) {
  /* ignore */
}

export function notifyDataChanged(entity = 'all') {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'DATA_UPDATED', entity, timestamp: Date.now() });
    } catch (e) { /* ignore */ }
  }
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('sbup:datasync', { detail: { entity, timestamp: Date.now() } }));
    } catch (e) { /* ignore */ }
  }
}

export function subscribeToSync(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (e) => {
    if (e.data && e.data.type === 'DATA_UPDATED') {
      callback(e.data);
    }
  };

  const handleCustomEvent = (e) => {
    if (e.detail) {
      callback(e.detail);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleMessage);
  }
  window.addEventListener('sbup:datasync', handleCustomEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('sbup:datasync', handleCustomEvent);
  };
}

// ── Institutes & Specializations ───────────────────────────────
export const INSTITUTES = [
  { id: 'BIMM',   name: 'BIMM — Balaji Institute of Modern Management', short: 'Management' },
  { id: 'BITM',   name: 'BITM — Balaji Institute of Telecom and Management', short: 'Telecom & Tech' },
  { id: 'BIIB',   name: 'BIIB — Balaji Institute of International Business', short: 'International Business' },
  { id: 'BIMHRD', name: 'BIMHRD — Balaji Institute of Management & HRD', short: 'HR Development' },
  { id: 'SBSCS',  name: 'SBSCS — School of Computer Studies', short: 'Computer Studies' },
];

export const SPECIALIZATIONS_BY_INSTITUTE = {
  'BIMM': [
    'Data Science and Business Analytics',
    'Marketing Management',
    'Financial Management',
    'Operations & Supply Chain',
    'Human Resources Management',
    'All Specializations'
  ],
  'BITM': [
    'Telecom Management',
    'Technology Management',
    'Business Analytics',
    'Digital Transformation',
    'All Specializations'
  ],
  'BIIB': [
    'International Business',
    'Global Finance & Banking',
    'Export & Import Management',
    'Digital Supply Chain',
    'All Specializations'
  ],
  'BIMHRD': [
    'Human Resources',
    'Talent Analytics',
    'Organizational Development',
    'Labor Relations & Employment Law',
    'All Specializations'
  ],
  'SBSCS': [
    'Computer Science and AI Systems',
    'Software Engineering',
    'Data Engineering & Cloud Computing',
    'Cybersecurity & Network Systems',
    'All Specializations'
  ]
};

export const SEMESTERS = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Trimester 1', 'Trimester 2', 'Trimester 3', 'Trimester 4', 'Trimester 5', 'Trimester 6'
];

// ── Default Mock Data ──────────────────────────────────────────
const DEFAULT_STUDENTS = [
  { name: 'Bhushan Padghan',  rollNumber: '20230948271', institute: 'BIMM',   specialization: 'Data Science and Business Analytics', semester: 'Semester 1' },
  { name: 'Aarav Sharma',     rollNumber: '20230948272', institute: 'BITM',   specialization: 'Telecom Management',                  semester: 'Semester 1' },
  { name: 'Priya Patel',      rollNumber: '20230948273', institute: 'BIIB',   specialization: 'International Business',              semester: 'Semester 2' },
  { name: 'Rohit Joshi',      rollNumber: '20230948274', institute: 'BIMHRD', specialization: 'Human Resources',                     semester: 'Semester 1' },
  { name: 'Sneha Deshmukh',   rollNumber: '20230948275', institute: 'SBSCS',  specialization: 'Computer Science and AI Systems',     semester: 'Semester 3' },
];

const DEFAULT_ATTENDANCE = {
  '20230948271': { studentName: 'Bhushan Padghan', rollNumber: '20230948271', institute: 'BIMM', specialization: 'Data Science and Business Analytics', attendance: 88, lastUpdated: 'Sept 10, 2026' },
  '20230948272': { studentName: 'Aarav Sharma',    rollNumber: '20230948272', institute: 'BITM', specialization: 'Telecom Management', attendance: 78, lastUpdated: 'Sept 10, 2026' },
  '20230948273': { studentName: 'Priya Patel',     rollNumber: '20230948273', institute: 'BIIB', specialization: 'International Business', attendance: 92, lastUpdated: 'Sept 10, 2026' },
  '20230948274': { studentName: 'Rohit Joshi',     rollNumber: '20230948274', institute: 'BIMHRD', specialization: 'Human Resources', attendance: 71, lastUpdated: 'Sept 10, 2026' },
  '20230948275': { studentName: 'Sneha Deshmukh',  rollNumber: '20230948275', institute: 'SBSCS', specialization: 'Computer Science and AI Systems', attendance: 95, lastUpdated: 'Sept 10, 2026' },
};

const DEFAULT_NOTES = [
  {
    id: 'note-1',
    subject: 'Advanced Predictive Analytics',
    title: 'Time-Series & Forecasting Models (Unit 1)',
    facultyName: 'Dr. S. Kulkarni',
    institute: 'BIMM',
    specialization: 'Data Science and Business Analytics',
    semester: 'Semester 1',
    fileName: 'Predictive_Analytics_Unit1.pdf',
    fileUrl: '#',
    uploadDate: '2026-09-08'
  },
  {
    id: 'note-2',
    subject: 'Business Intelligence',
    title: 'Data Warehousing & PowerBI Architecture',
    facultyName: 'Prof. Anjali Verma',
    institute: 'BIMM',
    specialization: 'Data Science and Business Analytics',
    semester: 'Semester 1',
    fileName: 'BI_Architecture_Lecture.pdf',
    fileUrl: '#',
    uploadDate: '2026-09-06'
  },
  {
    id: 'note-3',
    subject: 'Telecom Network Architecture',
    title: '5G Infrastructure & Core Routing Protocols',
    facultyName: 'Dr. R. Nair',
    institute: 'BITM',
    specialization: 'Telecom Management',
    semester: 'Semester 1',
    fileName: '5G_Architecture_Notes.pdf',
    fileUrl: '#',
    uploadDate: '2026-09-07'
  },
  {
    id: 'note-4',
    subject: 'Global Supply Chain Management',
    title: 'Cross-Border Logistics & Tariffs Unit 2',
    facultyName: 'Dr. K. Mehta',
    institute: 'BIIB',
    specialization: 'International Business',
    semester: 'Semester 2',
    fileName: 'Global_Supply_Chain_Unit2.pdf',
    fileUrl: '#',
    uploadDate: '2026-09-05'
  },
  {
    id: 'note-5',
    subject: 'Strategic Human Resource Management',
    title: 'Talent Acquisition & Compensation Frameworks',
    facultyName: 'Prof. S. Joshi',
    institute: 'BIMHRD',
    specialization: 'Human Resources',
    semester: 'Semester 1',
    fileName: 'Strategic_HR_Unit1.pdf',
    fileUrl: '#',
    uploadDate: '2026-09-04'
  },
  {
    id: 'note-6',
    subject: 'Managerial Economics',
    title: 'Market Structures and Macroeconomic Policies',
    facultyName: 'Dr. P. Joshi',
    institute: 'All',
    specialization: 'All Specializations',
    semester: 'Semester 1',
    fileName: 'Managerial_Economics_Foundations.pdf',
    fileUrl: '#',
    uploadDate: '2026-09-02'
  }
];

const DEFAULT_TIMETABLES = [
  {
    id: 'tt-bimm-sem1',
    institute: 'BIMM',
    specialization: 'Data Science and Business Analytics',
    semester: 'Semester 1',
    schedule: [
      { day: 'Monday',    time: '09:00 AM - 10:30 AM', subject: 'Business Analytics & Decision Science', faculty: 'Dr. S. Kulkarni', breakTime: '10:30 AM - 10:45 AM', remarks: 'Hall 4B • Mandatory attendance' },
      { day: 'Monday',    time: '10:45 AM - 12:15 PM', subject: 'Financial Management & Corporate Finance', faculty: 'Prof. V. Sharma', breakTime: '12:15 PM - 01:15 PM (Lunch)', remarks: 'Hall 4B' },
      { day: 'Monday',    time: '01:15 PM - 02:45 PM', subject: 'Strategic Marketing Management', faculty: 'Dr. P. Deshpande', breakTime: 'None', remarks: 'Case Study discussion in Lab 2' },
      { day: 'Tuesday',   time: '09:00 AM - 10:30 AM', subject: 'Data Visualization & BI Tools', faculty: 'Dr. S. Kulkarni', breakTime: '10:30 AM - 10:45 AM', remarks: 'Lab 1 • Bring laptops' },
      { day: 'Tuesday',   time: '10:45 AM - 12:15 PM', subject: 'Managerial Economics', faculty: 'Dr. P. Joshi', breakTime: '12:15 PM - 01:15 PM (Lunch)', remarks: 'Hall 4B' },
      { day: 'Wednesday', time: '09:00 AM - 10:30 AM', subject: 'Business Analytics & Decision Science', faculty: 'Dr. S. Kulkarni', breakTime: '10:30 AM - 10:45 AM', remarks: 'Hall 4B' },
      { day: 'Wednesday', time: '10:45 AM - 12:15 PM', subject: 'Financial Management & Corporate Finance', faculty: 'Prof. V. Sharma', breakTime: '12:15 PM - 01:15 PM (Lunch)', remarks: 'Hall 4B' },
      { day: 'Thursday',  time: '09:00 AM - 10:30 AM', subject: 'Data Visualization & BI Tools', faculty: 'Dr. S. Kulkarni', breakTime: '10:30 AM - 10:45 AM', remarks: 'Lab 1' },
      { day: 'Thursday',  time: '10:45 AM - 12:15 PM', subject: 'Managerial Economics', faculty: 'Dr. P. Joshi', breakTime: '12:15 PM - 01:15 PM (Lunch)', remarks: 'Hall 4B' },
      { day: 'Friday',    time: '09:00 AM - 10:30 AM', subject: 'Strategic Marketing Management', faculty: 'Dr. P. Deshpande', breakTime: '10:30 AM - 10:45 AM', remarks: 'Hall 4B' },
      { day: 'Friday',    time: '10:45 AM - 01:15 PM', subject: 'Python Analytics Practical Lab', faculty: 'Dr. S. Kulkarni', breakTime: '15 min tea break', remarks: 'Lab 2 • Graded submission' },
    ]
  },
  {
    id: 'tt-bitm-sem1',
    institute: 'BITM',
    specialization: 'Telecom Management',
    semester: 'Semester 1',
    schedule: [
      { day: 'Monday',    time: '09:00 AM - 10:30 AM', subject: 'Telecom Network Architecture', faculty: 'Dr. R. Nair', breakTime: '10:30 AM - 10:45 AM', remarks: 'Hall 2A' },
      { day: 'Monday',    time: '10:45 AM - 12:15 PM', subject: 'Wireless & Mobile Comm Systems', faculty: 'Prof. A. Patil', breakTime: 'Lunch Break', remarks: 'Hall 2A' },
      { day: 'Wednesday', time: '09:00 AM - 10:30 AM', subject: 'Telecom Network Architecture', faculty: 'Dr. R. Nair', breakTime: '10:30 AM - 10:45 AM', remarks: 'Hall 2A' },
      { day: 'Friday',    time: '10:00 AM - 01:00 PM', subject: 'Telecom Systems Hands-on Lab', faculty: 'Dr. R. Nair', breakTime: '15 min tea break', remarks: 'Telecom Lab' },
    ]
  },
  {
    id: 'tt-biib-sem2',
    institute: 'BIIB',
    specialization: 'International Business',
    semester: 'Semester 2',
    schedule: [
      { day: 'Monday',    time: '09:30 AM - 11:00 AM', subject: 'Global Logistics & Shipping', faculty: 'Dr. K. Mehta', breakTime: 'Tea Break', remarks: 'Auditorium 2' },
      { day: 'Tuesday',   time: '11:15 AM - 12:45 PM', subject: 'International Trade Law & WTO', faculty: 'Prof. D. Roy', breakTime: 'Lunch Break', remarks: 'Hall 3' },
      { day: 'Thursday',  time: '02:00 PM - 04:00 PM', subject: 'Forex Markets & Risk Management', faculty: 'Dr. V. Rao', breakTime: 'None', remarks: 'FinLab' },
    ]
  }
];

const DEFAULT_NOTICES = [
  {
    id: 'notice-1',
    title: 'Trimester I End-Term Examination Schedule & Hall Tickets',
    date: 'Sept 10, 2026',
    category: 'Examination',
    institute: 'All',
    isPinned: true,
    priority: 'urgent',
    description: 'End-term examinations for Trimester I commence from October 15, 2026. Students must ensure a minimum of 75% attendance to be eligible for hall ticket issuance. The detailed day-wise timetable is published under Examination cell.'
  },
  {
    id: 'notice-2',
    title: 'Campus Placement Prep & Fortune 500 Mock Interviews 2026',
    date: 'Sept 08, 2026',
    category: 'Placement',
    institute: 'All',
    isPinned: true,
    priority: 'important',
    description: 'The Corporate Relations Department is organizing intensive pre-placement interviews and resume refinement clinics starting this weekend. All registered batch students must attend mandatory mock GD sessions.'
  },
  {
    id: 'notice-3',
    title: 'BIMM Specialization Electives Selection Window Opens',
    date: 'Sept 07, 2026',
    category: 'Academic',
    institute: 'BIMM',
    isPinned: false,
    priority: 'normal',
    description: 'Students of BIMM are requested to submit their final elective preferences for next semester through the academic coordinator before September 20, 2026.'
  },
  {
    id: 'notice-4',
    title: 'Library Digital Resource Access & Bloomberg Terminal Workshop',
    date: 'Sept 04, 2026',
    category: 'General',
    institute: 'All',
    isPinned: false,
    priority: 'normal',
    description: 'A hands-on training workshop on utilizing Bloomberg Terminals, EBSCOhost databases, and Harvard Case collections will be held this Saturday at 11:00 AM in the Central Library.'
  }
];

const DEFAULT_NEWS = [
  {
    id: 'news-1',
    title: 'SBUP Ranked Among Top Management Institutions in Western India',
    date: 'Sept 09, 2026',
    description: 'Sri Balaji University Pune achieves landmark recognition for corporate connect, rigorous trimester model, and stellar placement track record across leading corporate sectors.',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
    externalLink: 'https://www.sbup.edu.in'
  },
  {
    id: 'news-2',
    title: 'Annual Leadership Conclave 2026 Hosted at Tathawade Campus',
    date: 'Sept 06, 2026',
    description: 'Over 40 Fortune 500 corporate leaders and alumni convened at SBUP Tathawade campus to discuss AI integration in business operations, sustainability, and leadership resilience.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    externalLink: 'https://www.sbup.edu.in'
  },
  {
    id: 'news-3',
    title: 'SBUP Innovation & Startup Incubator Receives University Grants',
    date: 'Sept 02, 2026',
    description: 'The new on-campus incubator offers seed capital, legal advisory, and mentorship to student-founded ventures in fintech, analytics, and sustainable logistics.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    externalLink: 'https://www.sbup.edu.in'
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Admit Card Alert',
    message: 'Trimester I End-Term Examination Schedule is now published. Check exam dates.',
    type: 'exam',
    link: '/dashboard',
    isActive: true,
    date: 'Sept 10, 2026',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Placement Drive Alert',
    message: 'Pre-Placement orientation session scheduled for tomorrow at 10:00 AM.',
    type: 'urgent',
    link: '/dashboard',
    isActive: true,
    date: 'Sept 09, 2026',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Timetable Update',
    message: 'Friday lab session for Business Analytics shifted to Lab 2.',
    type: 'timetable',
    link: '/dashboard',
    isActive: true,
    date: 'Sept 08, 2026',
    read: true
  }
];

const DEFAULT_FACULTY = [
  {
    id: 'fac-1',
    name: 'Dr. S. Kulkarni',
    designation: 'Professor & HOD, Data Science',
    institute: 'BIMM',
    department: 'Business Analytics',
    email: 's.kulkarni@bimm.sbup.edu.in',
    cabin: 'BIMM Admin Block, Room 304',
    officeHours: 'Mon-Wed 3:00 PM - 5:00 PM'
  },
  {
    id: 'fac-2',
    name: 'Prof. Anjali Verma',
    designation: 'Associate Professor',
    institute: 'BIMM',
    department: 'Business Intelligence',
    email: 'anjali.verma@bimm.sbup.edu.in',
    cabin: 'BIMM Faculty Floor, Cabin 12',
    officeHours: 'Tue-Thu 2:00 PM - 4:00 PM'
  },
  {
    id: 'fac-3',
    name: 'Dr. R. Nair',
    designation: 'Dean & Professor',
    institute: 'BITM',
    department: 'Telecom & Networks',
    email: 'r.nair@bitm.sbup.edu.in',
    cabin: 'BITM Main Building, Cabin 201',
    officeHours: 'Wed-Fri 11:00 AM - 1:00 PM'
  },
  {
    id: 'fac-4',
    name: 'Dr. K. Mehta',
    designation: 'Head, Corporate Relations & Professor',
    institute: 'BIIB',
    department: 'International Trade',
    email: 'k.mehta@biib.sbup.edu.in',
    cabin: 'BIIB Tower, Cabin 402',
    officeHours: 'Mon-Fri 4:00 PM - 5:30 PM'
  }
];

// ── Generic Local Storage Helpers ──────────────────────────────
function getLocalItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function saveLocalItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

// ── 1. Student List & Verification ─────────────────────────────

export async function verifyRollNumber(rollNumber) {
  const clean = String(rollNumber).trim();
  if (!clean) return { exists: false, error: 'Please enter a roll number.' };

  try {
    const docRef = doc(db, 'student_list', clean);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { exists: true, student: { rollNumber: clean, ...snap.data() } };
    }
  } catch (e) {
    console.warn('Firestore verifyRollNumber unavailable, checking local store:', e.message);
  }

  const localList = getLocalItem(LOCAL_STUDENT_LIST_KEY, DEFAULT_STUDENTS);
  const found = localList.find(s => String(s.rollNumber).trim() === clean);
  if (found) {
    return { exists: true, student: { ...found, rollNumber: clean, semester: found.semester || 'Semester 1' } };
  }

  return { exists: false, error: 'Roll number not found in the university database. Contact your admin.' };
}

export async function isAlreadyRegistered(rollNumber) {
  const clean = String(rollNumber).trim();
  try {
    const docRef = doc(db, 'registered_students', clean);
    const snap = await getDoc(docRef);
    if (snap.exists()) return true;
  } catch (e) {
    console.warn('Firestore isAlreadyRegistered error:', e.message);
  }

  const localReg = getLocalItem(LOCAL_REGISTERED_KEY, {});
  return Boolean(localReg[clean]);
}

export async function registerStudent(rollNumber, password, studentData) {
  const clean = String(rollNumber).trim();

  const verify = await verifyRollNumber(clean);
  if (!verify.exists) {
    return { success: false, error: verify.error };
  }

  const alreadyRegistered = await isAlreadyRegistered(clean);
  if (alreadyRegistered) {
    return { success: false, error: 'This roll number is already registered. Please login instead.' };
  }

  const hashedPassword = await hashPassword(password);
  const record = {
    rollNumber: clean,
    name: studentData?.name || '',
    institute: studentData?.institute || '',
    specialization: studentData?.specialization || '',
    semester: studentData?.semester || 'Semester 1',
    passwordHash: hashedPassword,
    registeredAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'registered_students', clean), {
      ...record,
      registeredAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('Firestore registerStudent write failed, saving to local store:', e.message);
  }

  const localReg = getLocalItem(LOCAL_REGISTERED_KEY, {});
  localReg[clean] = record;
  saveLocalItem(LOCAL_REGISTERED_KEY, localReg);

  notifyDataChanged('registered_students');
  return { success: true, student: record };
}

export async function authenticateStudent(rollNumber, password) {
  const clean = String(rollNumber).trim();
  const cleanPass = (password || '').trim();

  if (!clean || !cleanPass) {
    return { success: false, error: 'Please enter your Roll Number and Password.' };
  }

  const hashedInput = await hashPassword(cleanPass);

  try {
    const docRef = doc(db, 'registered_students', clean);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (hashedInput !== data.passwordHash) {
        return { success: false, error: 'Incorrect password.' };
      }

      const studentSession = {
        rollNumber: clean,
        name: data.name || '',
        institute: data.institute || '',
        specialization: data.specialization || '',
        semester: data.semester || 'Semester 1',
        role: 'student'
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(studentSession));
      return { success: true, student: studentSession };
    }
  } catch (e) {
    console.warn('Firestore authenticateStudent error, checking local store:', e.message);
  }

  const localReg = getLocalItem(LOCAL_REGISTERED_KEY, {});
  const studentDoc = localReg[clean];

  if (!studentDoc) {
    const localList = getLocalItem(LOCAL_STUDENT_LIST_KEY, DEFAULT_STUDENTS);
    const inList = localList.find(s => String(s.rollNumber).trim() === clean);
    if (inList) {
      return { success: false, error: 'Account not yet activated. Please register your roll number first.' };
    }
    return { success: false, error: 'Account not found. Please register first.' };
  }

  if (hashedInput !== studentDoc.passwordHash) {
    return { success: false, error: 'Incorrect password.' };
  }

  const studentSession = {
    rollNumber: clean,
    name: studentDoc.name || '',
    institute: studentDoc.institute || '',
    specialization: studentDoc.specialization || '',
    semester: studentDoc.semester || 'Semester 1',
    role: 'student'
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(studentSession));
  return { success: true, student: studentSession };
}

export function getCurrentSession() {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) { /* ignore */ }
}

// ── 2. Admin: Student Management ───────────────────────────────

export async function fetchStudentList() {
  try {
    const snap = await getDocs(query(collection(db, 'student_list'), limit(1000)));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_STUDENT_LIST_KEY, list);
      return list;
    }
  } catch (e) {
    console.warn('Firestore fetchStudentList warning, using local store:', e.message);
  }
  return getLocalItem(LOCAL_STUDENT_LIST_KEY, DEFAULT_STUDENTS).map(s => ({ id: s.rollNumber, ...s }));
}

export async function fetchRegisteredStudents() {
  const registeredSet = new Set();
  try {
    const snap = await getDocs(query(collection(db, 'registered_students'), limit(1000)));
    snap.docs.forEach(d => registeredSet.add(d.id));
  } catch (e) {
    console.warn('Firestore fetchRegisteredStudents warning:', e.message);
  }
  const localReg = getLocalItem(LOCAL_REGISTERED_KEY, {});
  Object.keys(localReg).forEach(k => registeredSet.add(k));
  return Array.from(registeredSet);
}

export async function addStudent(student) {
  const rollNumber = String(student.rollNumber || '').trim();
  if (!rollNumber) return { success: false, error: 'Roll number is required.' };

  const record = {
    rollNumber,
    name: (student.name || '').trim(),
    institute: (student.institute || '').trim(),
    specialization: (student.specialization || '').trim(),
    semester: (student.semester || 'Semester 1').trim(),
    uploadedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'student_list', rollNumber), record);
  } catch (e) {
    console.warn('Firestore addStudent write warning:', e.message);
  }

  const localList = getLocalItem(LOCAL_STUDENT_LIST_KEY, DEFAULT_STUDENTS);
  const idx = localList.findIndex(s => String(s.rollNumber).trim() === rollNumber);
  if (idx >= 0) {
    localList[idx] = record;
  } else {
    localList.unshift(record);
  }
  saveLocalItem(LOCAL_STUDENT_LIST_KEY, localList);

  notifyDataChanged('students');
  return { success: true, student: record };
}

export async function updateStudent(rollNumber, studentData) {
  const clean = String(rollNumber).trim();
  const localList = getLocalItem(LOCAL_STUDENT_LIST_KEY, DEFAULT_STUDENTS);
  const idx = localList.findIndex(s => String(s.rollNumber).trim() === clean);
  if (idx >= 0) {
    localList[idx] = { ...localList[idx], ...studentData };
    saveLocalItem(LOCAL_STUDENT_LIST_KEY, localList);
  }
  try {
    await setDoc(doc(db, 'student_list', clean), studentData, { merge: true });
  } catch (e) {
    console.warn('Firestore updateStudent warning:', e.message);
  }

  notifyDataChanged('students');
  return { success: true };
}

export async function deleteStudentFromList(rollNumber) {
  const clean = String(rollNumber).trim();
  try {
    await deleteDoc(doc(db, 'student_list', clean));
    try { await deleteDoc(doc(db, 'registered_students', clean)); } catch (e) { /* ignore */ }
  } catch (e) {
    console.warn('Firestore deleteStudentFromList warning:', e.message);
  }

  const localList = getLocalItem(LOCAL_STUDENT_LIST_KEY, DEFAULT_STUDENTS).filter(s => String(s.rollNumber).trim() !== clean);
  saveLocalItem(LOCAL_STUDENT_LIST_KEY, localList);

  const localReg = getLocalItem(LOCAL_REGISTERED_KEY, {});
  delete localReg[clean];
  saveLocalItem(LOCAL_REGISTERED_KEY, localReg);

  notifyDataChanged('students');
  return { success: true };
}

export async function batchUploadStudentList(studentsArray, onProgress) {
  let count = 0;
  try {
    const batchSize = 400;
    for (let i = 0; i < studentsArray.length; i += batchSize) {
      const chunk = studentsArray.slice(i, i + batchSize);
      const batch = writeBatch(db);

      chunk.forEach(student => {
        const rollNumber = String(student.rollNumber || '').trim();
        if (!rollNumber) return;
        const ref = doc(db, 'student_list', rollNumber);
        batch.set(ref, {
          name: (student.name || '').trim(),
          rollNumber: rollNumber,
          institute: (student.institute || '').trim(),
          specialization: (student.specialization || '').trim(),
          semester: (student.semester || 'Semester 1').trim(),
          uploadedAt: serverTimestamp()
        }, { merge: true });
      });

      await batch.commit();
      count += chunk.length;
      if (onProgress) onProgress(count, studentsArray.length);
    }
  } catch (e) {
    console.warn('Firestore Batch upload warning (saving locally):', e.message);
  }

  try {
    const localList = getLocalItem(LOCAL_STUDENT_LIST_KEY, DEFAULT_STUDENTS);
    const map = new Map(localList.map(s => [String(s.rollNumber).trim(), s]));
    studentsArray.forEach(s => {
      const rn = String(s.rollNumber || '').trim();
      if (rn) {
        map.set(rn, {
          ...s,
          rollNumber: rn,
          semester: s.semester || 'Semester 1'
        });
      }
    });
    saveLocalItem(LOCAL_STUDENT_LIST_KEY, Array.from(map.values()));
    count = studentsArray.length;
  } catch (err) {
    console.error('Local store update error:', err);
  }

  notifyDataChanged('students');
  return { success: true, importedCount: count };
}

// ── 3. Attendance Management ───────────────────────────────────

export async function getStudentAttendance(rollNumber) {
  const clean = String(rollNumber).trim();
  try {
    const docRef = doc(db, 'attendance', clean);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
  } catch (e) {
    console.warn('Firestore getStudentAttendance warning:', e.message);
  }

  const attMap = getLocalItem(LOCAL_ATTENDANCE_KEY, DEFAULT_ATTENDANCE);
  return attMap[clean] || { rollNumber: clean, attendance: 85, lastUpdated: 'Recent' };
}

export async function getAllAttendance() {
  try {
    const snap = await getDocs(collection(db, 'attendance'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ rollNumber: d.id, ...d.data() }));
      return list;
    }
  } catch (e) {
    console.warn('Firestore getAllAttendance warning:', e.message);
  }
  const attMap = getLocalItem(LOCAL_ATTENDANCE_KEY, DEFAULT_ATTENDANCE);
  return Object.values(attMap);
}

export async function setSingleStudentAttendance(rollNumber, attendancePct, studentName = '', institute = '', specialization = '') {
  const cleanRn = String(rollNumber).trim();
  const numPct = Math.min(100, Math.max(0, parseFloat(attendancePct) || 0));
  const record = {
    rollNumber: cleanRn,
    studentName: studentName.trim(),
    institute: institute.trim(),
    specialization: specialization.trim(),
    attendance: numPct,
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  const attMap = getLocalItem(LOCAL_ATTENDANCE_KEY, DEFAULT_ATTENDANCE);
  attMap[cleanRn] = { ...(attMap[cleanRn] || {}), ...record };
  saveLocalItem(LOCAL_ATTENDANCE_KEY, attMap);

  try {
    await setDoc(doc(db, 'attendance', cleanRn), record, { merge: true });
  } catch (e) {
    console.warn('Firestore setSingleStudentAttendance write warning:', e.message);
  }

  notifyDataChanged('attendance');
  return { success: true, record };
}

export async function batchUploadAttendance(recordsArray) {
  const attMap = getLocalItem(LOCAL_ATTENDANCE_KEY, DEFAULT_ATTENDANCE);
  let successCount = 0;
  let failedCount = 0;

  recordsArray.forEach(rec => {
    const rn = String(rec.rollNumber || '').trim();
    if (!rn) {
      failedCount++;
      return;
    }
    const cleanPct = String(rec.attendance || '').replace('%', '').trim();
    const numPct = parseFloat(cleanPct);
    const pct = isNaN(numPct) ? 0 : Math.min(100, Math.max(0, numPct));

    attMap[rn] = {
      rollNumber: rn,
      studentName: rec.studentName || '',
      institute: rec.institute || '',
      specialization: rec.specialization || '',
      attendance: pct,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    successCount++;
  });

  saveLocalItem(LOCAL_ATTENDANCE_KEY, attMap);

  try {
    const batch = writeBatch(db);
    Object.keys(attMap).forEach(rn => {
      const ref = doc(db, 'attendance', rn);
      batch.set(ref, attMap[rn], { merge: true });
    });
    await batch.commit();
  } catch (e) {
    console.warn('Firestore batchUploadAttendance warning:', e.message);
  }

  notifyDataChanged('attendance');
  return { success: true, successCount, failedCount };
}

// ── 4. Notes Management (Strict Institute Separation) ──────────

export async function getNotes(institute, specialization) {
  try {
    const snap = await getDocs(collection(db, 'notes'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_NOTES_KEY, list);
    }
  } catch (e) {
    console.warn('Firestore getNotes fetch warning, reading cached/local store:', e.message);
  }

  const all = getLocalItem(LOCAL_NOTES_KEY, DEFAULT_NOTES);
  return all.filter(n => {
    // Institute Match: 'All' matches all institutes, otherwise must match student's institute exactly
    const instMatch = n.institute === 'All' || !institute || n.institute === institute;
    // Specialization Match: 'All' or 'All Specializations' matches all
    const specMatch = n.specialization === 'All' || n.specialization === 'All Specializations' ||
                      !specialization || n.specialization === specialization;
    return instMatch && specMatch;
  });
}

export async function getAllNotes() {
  try {
    const snap = await getDocs(collection(db, 'notes'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_NOTES_KEY, list);
      return list;
    }
  } catch (e) {
    console.warn('Firestore getAllNotes warning:', e.message);
  }
  return getLocalItem(LOCAL_NOTES_KEY, DEFAULT_NOTES);
}

export async function createNote(note) {
  const newNote = {
    ...note,
    id: note.id || 'note-' + Date.now(),
    institute: note.institute || 'All',
    specialization: note.specialization || 'All Specializations',
    uploadDate: new Date().toISOString().slice(0, 10)
  };

  try {
    await setDoc(doc(db, 'notes', newNote.id), newNote);
  } catch (e) {
    console.warn('Firestore createNote write warning:', e.message);
  }

  const notes = getLocalItem(LOCAL_NOTES_KEY, DEFAULT_NOTES);
  notes.unshift(newNote);
  saveLocalItem(LOCAL_NOTES_KEY, notes);

  notifyDataChanged('notes');
  return { success: true, note: newNote };
}

export async function deleteNote(noteId) {
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (e) {
    console.warn('Firestore deleteNote warning:', e.message);
  }

  const notes = getLocalItem(LOCAL_NOTES_KEY, DEFAULT_NOTES);
  const filtered = notes.filter(n => n.id !== noteId);
  saveLocalItem(LOCAL_NOTES_KEY, filtered);

  notifyDataChanged('notes');
  return { success: true };
}

// ── 5. Timetable Management (Strict Institute Separation) ──────

export async function getTimetable(institute, semester) {
  try {
    const snap = await getDocs(collection(db, 'timetables'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_TIMETABLE_KEY, list);
    }
  } catch (e) {
    console.warn('Firestore getTimetable fetch warning:', e.message);
  }

  const all = getLocalItem(LOCAL_TIMETABLE_KEY, DEFAULT_TIMETABLES);
  const found = all.find(t => t.institute === institute && (!semester || t.semester === semester));
  if (found) return found;
  return all.find(t => t.institute === institute) || all[0] || null;
}

export async function getAllTimetables() {
  try {
    const snap = await getDocs(collection(db, 'timetables'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_TIMETABLE_KEY, list);
      return list;
    }
  } catch (e) {
    console.warn('Firestore getAllTimetables warning:', e.message);
  }
  return getLocalItem(LOCAL_TIMETABLE_KEY, DEFAULT_TIMETABLES);
}

export async function saveTimetable(timetableData) {
  const all = getLocalItem(LOCAL_TIMETABLE_KEY, DEFAULT_TIMETABLES);
  const id = timetableData.id || `tt-${timetableData.institute}-${(timetableData.semester || 'sem1').replace(/\s+/g, '-').toLowerCase()}`;
  const record = { ...timetableData, id };

  const idx = all.findIndex(t => t.id === id || (t.institute === timetableData.institute && t.semester === timetableData.semester));
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.unshift(record);
  }
  saveLocalItem(LOCAL_TIMETABLE_KEY, all);

  try {
    await setDoc(doc(db, 'timetables', id), record, { merge: true });
  } catch (e) {
    console.warn('Firestore saveTimetable warning:', e.message);
  }

  notifyDataChanged('timetable');
  return { success: true, timetable: record };
}

export async function deleteTimetable(id) {
  try {
    await deleteDoc(doc(db, 'timetables', id));
  } catch (e) {
    console.warn('Firestore deleteTimetable warning:', e.message);
  }

  const all = getLocalItem(LOCAL_TIMETABLE_KEY, DEFAULT_TIMETABLES);
  const filtered = all.filter(t => t.id !== id);
  saveLocalItem(LOCAL_TIMETABLE_KEY, filtered);

  notifyDataChanged('timetable');
  return { success: true };
}

export async function batchUploadTimetable(institute, semester, slotsArray) {
  const all = getLocalItem(LOCAL_TIMETABLE_KEY, DEFAULT_TIMETABLES);
  const id = `tt-${institute}-${(semester || 'sem1').replace(/\s+/g, '-').toLowerCase()}`;
  const record = {
    id,
    institute,
    semester: semester || 'Semester 1',
    specialization: 'Core Batch',
    schedule: slotsArray,
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
  const idx = all.findIndex(t => t.institute === institute && t.semester === semester);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.unshift(record);
  }
  saveLocalItem(LOCAL_TIMETABLE_KEY, all);

  try {
    await setDoc(doc(db, 'timetables', id), record, { merge: true });
  } catch (e) {
    console.warn('Firestore batchUploadTimetable warning:', e.message);
  }

  notifyDataChanged('timetable');
  return { success: true, count: slotsArray.length, timetable: record };
}

// ── 6. Important Notices Management ────────────────────────────

export async function getNotices(institute) {
  try {
    const snap = await getDocs(collection(db, 'notices'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_NOTICES_KEY, list);
    }
  } catch (e) {
    console.warn('Firestore getNotices fetch warning:', e.message);
  }

  const all = getLocalItem(LOCAL_NOTICES_KEY, DEFAULT_NOTICES);
  const filtered = all.filter(n => n.institute === 'All' || !institute || n.institute === institute);
  return filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
}

export async function getAllNotices() {
  try {
    const snap = await getDocs(collection(db, 'notices'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_NOTICES_KEY, list);
      return list;
    }
  } catch (e) {
    console.warn('Firestore getAllNotices warning:', e.message);
  }
  return getLocalItem(LOCAL_NOTICES_KEY, DEFAULT_NOTICES);
}

export async function createNotice(notice) {
  const newNotice = {
    ...notice,
    id: notice.id || 'notice-' + Date.now(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  try {
    await setDoc(doc(db, 'notices', newNotice.id), newNotice);
  } catch (e) {
    console.warn('Firestore createNotice warning:', e.message);
  }

  const all = getLocalItem(LOCAL_NOTICES_KEY, DEFAULT_NOTICES);
  all.unshift(newNotice);
  saveLocalItem(LOCAL_NOTICES_KEY, all);

  notifyDataChanged('notices');
  return { success: true, notice: newNotice };
}

export async function updateNotice(id, data) {
  const all = getLocalItem(LOCAL_NOTICES_KEY, DEFAULT_NOTICES);
  const idx = all.findIndex(n => n.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data };
    saveLocalItem(LOCAL_NOTICES_KEY, all);
  }

  try {
    await setDoc(doc(db, 'notices', id), data, { merge: true });
  } catch (e) {
    console.warn('Firestore updateNotice warning:', e.message);
  }

  notifyDataChanged('notices');
  return { success: true };
}

export async function deleteNotice(id) {
  try {
    await deleteDoc(doc(db, 'notices', id));
  } catch (e) {
    console.warn('Firestore deleteNotice warning:', e.message);
  }

  const all = getLocalItem(LOCAL_NOTICES_KEY, DEFAULT_NOTICES);
  saveLocalItem(LOCAL_NOTICES_KEY, all.filter(n => n.id !== id));

  notifyDataChanged('notices');
  return { success: true };
}

// ── 7. Daily News Management ───────────────────────────────────

export async function getDailyNews() {
  try {
    const snap = await getDocs(collection(db, 'news'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_NEWS_KEY, list);
      return list;
    }
  } catch (e) {
    console.warn('Firestore getDailyNews warning:', e.message);
  }
  return getLocalItem(LOCAL_NEWS_KEY, DEFAULT_NEWS);
}

export async function createDailyNews(newsItem) {
  const newNews = {
    ...newsItem,
    id: newsItem.id || 'news-' + Date.now(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  try {
    await setDoc(doc(db, 'news', newNews.id), newNews);
  } catch (e) {
    console.warn('Firestore createDailyNews warning:', e.message);
  }

  const all = getLocalItem(LOCAL_NEWS_KEY, DEFAULT_NEWS);
  all.unshift(newNews);
  saveLocalItem(LOCAL_NEWS_KEY, all);

  notifyDataChanged('news');
  return { success: true, news: newNews };
}

export async function deleteDailyNews(id) {
  try {
    await deleteDoc(doc(db, 'news', id));
  } catch (e) {
    console.warn('Firestore deleteDailyNews warning:', e.message);
  }

  const all = getLocalItem(LOCAL_NEWS_KEY, DEFAULT_NEWS);
  saveLocalItem(LOCAL_NEWS_KEY, all.filter(n => n.id !== id));

  notifyDataChanged('news');
  return { success: true };
}

// ── 8. Notifications & Top Announcement Bar ────────────────────

export async function getActiveNotifications() {
  try {
    const snap = await getDocs(collection(db, 'notifications'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_NOTIF_KEY, list);
      return list.filter(n => n.isActive !== false);
    }
  } catch (e) {
    console.warn('Firestore getActiveNotifications warning:', e.message);
  }

  const all = getLocalItem(LOCAL_NOTIF_KEY, DEFAULT_NOTIFICATIONS);
  return all.filter(n => n.isActive !== false);
}

export async function getAllNotifications() {
  try {
    const snap = await getDocs(collection(db, 'notifications'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_NOTIF_KEY, list);
      return list;
    }
  } catch (e) {
    console.warn('Firestore getAllNotifications warning:', e.message);
  }
  return getLocalItem(LOCAL_NOTIF_KEY, DEFAULT_NOTIFICATIONS);
}

export async function createNotification(notif) {
  const newNotif = {
    ...notif,
    id: notif.id || 'notif-' + Date.now(),
    isActive: true,
    read: false,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  try {
    await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
  } catch (e) {
    console.warn('Firestore createNotification warning:', e.message);
  }

  const all = getLocalItem(LOCAL_NOTIF_KEY, DEFAULT_NOTIFICATIONS);
  all.unshift(newNotif);
  saveLocalItem(LOCAL_NOTIF_KEY, all);

  notifyDataChanged('notifications');
  return { success: true, notification: newNotif };
}

export async function toggleNotificationStatus(id) {
  const all = getLocalItem(LOCAL_NOTIF_KEY, DEFAULT_NOTIFICATIONS);
  const idx = all.findIndex(n => n.id === id);
  if (idx >= 0) {
    all[idx].isActive = !all[idx].isActive;
    saveLocalItem(LOCAL_NOTIF_KEY, all);

    try {
      await setDoc(doc(db, 'notifications', id), { isActive: all[idx].isActive }, { merge: true });
    } catch (e) {
      console.warn('Firestore toggleNotificationStatus warning:', e.message);
    }
  }

  notifyDataChanged('notifications');
  return { success: true };
}

export async function markNotificationAsRead(id) {
  const all = getLocalItem(LOCAL_NOTIF_KEY, DEFAULT_NOTIFICATIONS);
  const idx = all.findIndex(n => n.id === id);
  if (idx >= 0) {
    all[idx].read = true;
    saveLocalItem(LOCAL_NOTIF_KEY, all);
  }
  return { success: true };
}

export async function deleteNotification(id) {
  try {
    await deleteDoc(doc(db, 'notifications', id));
  } catch (e) {
    console.warn('Firestore deleteNotification warning:', e.message);
  }

  const all = getLocalItem(LOCAL_NOTIF_KEY, DEFAULT_NOTIFICATIONS);
  saveLocalItem(LOCAL_NOTIF_KEY, all.filter(n => n.id !== id));

  notifyDataChanged('notifications');
  return { success: true };
}

// ── 9. Faculty & Teacher Directory ─────────────────────────────

export async function getFaculty(institute) {
  try {
    const snap = await getDocs(collection(db, 'faculty'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_FACULTY_KEY, list);
    }
  } catch (e) {
    console.warn('Firestore getFaculty warning:', e.message);
  }

  const all = getLocalItem(LOCAL_FACULTY_KEY, DEFAULT_FACULTY);
  return all.filter(f => f.institute === 'All' || !institute || f.institute === institute);
}

export async function getAllFaculty() {
  try {
    const snap = await getDocs(collection(db, 'faculty'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalItem(LOCAL_FACULTY_KEY, list);
      return list;
    }
  } catch (e) {
    console.warn('Firestore getAllFaculty warning:', e.message);
  }
  return getLocalItem(LOCAL_FACULTY_KEY, DEFAULT_FACULTY);
}

export async function createFaculty(facultyMember) {
  const newFaculty = {
    ...facultyMember,
    id: facultyMember.id || 'fac-' + Date.now()
  };

  try {
    await setDoc(doc(db, 'faculty', newFaculty.id), newFaculty);
  } catch (e) {
    console.warn('Firestore createFaculty warning:', e.message);
  }

  const all = getLocalItem(LOCAL_FACULTY_KEY, DEFAULT_FACULTY);
  all.unshift(newFaculty);
  saveLocalItem(LOCAL_FACULTY_KEY, all);

  notifyDataChanged('faculty');
  return { success: true, faculty: newFaculty };
}

export async function deleteFaculty(id) {
  try {
    await deleteDoc(doc(db, 'faculty', id));
  } catch (e) {
    console.warn('Firestore deleteFaculty warning:', e.message);
  }

  const all = getLocalItem(LOCAL_FACULTY_KEY, DEFAULT_FACULTY);
  saveLocalItem(LOCAL_FACULTY_KEY, all.filter(f => f.id !== id));

  notifyDataChanged('faculty');
  return { success: true };
}
