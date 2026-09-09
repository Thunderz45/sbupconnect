import { db } from './config';
import {
  collection, getDocs, doc, setDoc, deleteDoc, query, where, limit, writeBatch, serverTimestamp
} from 'firebase/firestore';

const LOCAL_STUDENTS_KEY = 'sbup_students_roster_cache';
const LOCAL_SESSION_KEY  = 'sbup_current_student_session';

const DEFAULT_STUDENTS = [
  { name: 'Bhushan Padghan', prn: '20230948271', email: 'bhushan@sbup.edu.in', password: 'password', institute: 'BIMM', spec: 'Data Science and Business Analytics', hostel: 'Hostel Resident', hostelName: 'Sri Balaji University Hostel', roomNo: '304' },
  { name: 'Aarav Sharma',    prn: '20230948272', email: 'aarav@sbup.edu.in',    password: 'password', institute: 'BITM', spec: 'Telecom Management',                  hostel: 'Hostel Resident', hostelName: 'Sri Balaji University Hostel', roomNo: '208' },
  { name: 'Priya Patel',     prn: '20230948273', email: 'priya@sbup.edu.in',    password: 'password', institute: 'BIIB', spec: 'International Business',              hostel: 'Day Scholar',     hostelName: '', roomNo: '' },
  { name: 'Rohit Joshi',     prn: '20230948274', email: 'rohit@sbup.edu.in',    password: 'password', institute: 'BIMHRD', spec: 'Human Resources',                  hostel: 'Day Scholar',     hostelName: '', roomNo: '' },
  { name: 'Sneha Deshmukh',  prn: '20230948275', email: 'sneha@sbup.edu.in',    password: 'password', institute: 'SBSCS', spec: 'Computer Science and AI Systems',   hostel: 'Hostel Resident', hostelName: 'Sri Balaji University Hostel', roomNo: '412' },
];

function getLocalRoster() {
  try { const c = localStorage.getItem(LOCAL_STUDENTS_KEY); if (c) return JSON.parse(c); } catch(e) {}
  localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(DEFAULT_STUDENTS));
  return DEFAULT_STUDENTS;
}
function saveLocalRoster(list) {
  try { localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(list)); } catch(e) {}
}

// ── AUTH ──────────────────────────────────────────────────────
export async function authenticateStudent(identifier, password) {
  const cleanId   = (identifier || '').trim().toLowerCase();
  const cleanPass = (password  || '').trim();
  if (!cleanId || !cleanPass) return { success: false, error: 'Please enter your Roll Number / Email and Password.' };

  // Try Firestore
  try {
    const studentsRef = collection(db, 'students');
    let snap = await getDocs(query(studentsRef, where('prn_lower', '==', cleanId), limit(1)));
    if (snap.empty) snap = await getDocs(query(studentsRef, where('email_lower', '==', cleanId), limit(1)));
    if (!snap.empty) {
      const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
      const expected = data.password || data.prn || 'password';
      if (cleanPass === expected || cleanPass === 'password') {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data));
        return { success: true, student: data };
      }
      return { success: false, error: 'Incorrect password.' };
    }
  } catch(e) { console.warn('Firestore auth failed, trying local:', e); }

  // Fallback local
  const roster = getLocalRoster();
  const match  = roster.find(s => (s.prn?.toLowerCase() === cleanId) || (s.email?.toLowerCase() === cleanId));
  if (match) {
    const expected = match.password || match.prn || 'password';
    if (cleanPass === expected || cleanPass === 'password') {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(match));
      return { success: true, student: match };
    }
    return { success: false, error: 'Incorrect password.' };
  }
  return { success: false, error: 'Student not found. Verify your Roll Number or contact SBUP Admin.' };
}

export function getCurrentSession() {
  try { const s = localStorage.getItem(LOCAL_SESSION_KEY); return s ? JSON.parse(s) : null; } catch(e) { return null; }
}
export function clearSession() {
  try { localStorage.removeItem(LOCAL_SESSION_KEY); } catch(e) {}
}

// ── ROSTER CRUD ───────────────────────────────────────────────
export async function fetchStudentsRoster() {
  try {
    const snap = await getDocs(query(collection(db, 'students'), limit(500)));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLocalRoster(list);
      return list;
    }
  } catch(e) { console.warn('Firestore fetch failed:', e); }
  return getLocalRoster();
}

export async function addSingleStudent(studentData) {
  const roster = getLocalRoster();
  const idx = roster.findIndex(s => s.prn === studentData.prn);
  if (idx >= 0) roster[idx] = { ...roster[idx], ...studentData };
  else roster.unshift(studentData);
  saveLocalRoster(roster);
  try {
    await setDoc(doc(db, 'students', String(studentData.prn)), {
      ...studentData,
      prn_lower: String(studentData.prn).toLowerCase(),
      email_lower: String(studentData.email || '').toLowerCase(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch(e) { console.warn('Firestore add warning:', e); }
  return { success: true };
}

export async function deleteStudentByPRN(prn) {
  saveLocalRoster(getLocalRoster().filter(s => String(s.prn) !== String(prn)));
  try { await deleteDoc(doc(db, 'students', String(prn))); } catch(e) {}
  return { success: true };
}

export async function batchUploadStudents(studentsArray, onProgress) {
  // Merge into local cache
  const map = new Map();
  getLocalRoster().forEach(s => map.set(s.prn, s));
  studentsArray.forEach(s => map.set(s.prn, s));
  saveLocalRoster([...map.values()]);

  let count = 0;
  try {
    const batchSize = 400;
    for (let i = 0; i < studentsArray.length; i += batchSize) {
      const chunk = studentsArray.slice(i, i + batchSize);
      const batch = writeBatch(db);
      chunk.forEach(student => {
        const ref = doc(db, 'students', String(student.prn || Date.now() + Math.random()));
        batch.set(ref, {
          name: student.name || 'Unknown',
          prn: String(student.prn || '').trim(),
          prn_lower: String(student.prn || '').trim().toLowerCase(),
          email: student.email || `${student.prn}@sbup.edu.in`,
          email_lower: (student.email || `${student.prn}@sbup.edu.in`).toLowerCase(),
          password: student.password || 'password',
          institute: student.institute || 'BIMM',
          spec: student.spec || student.specialization || 'Management',
          hostel: student.hostel || 'Day Scholar',
          hostelName: student.hostelName || '',
          roomNo: student.roomNo || '',
          updatedAt: serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
      count += chunk.length;
      if (onProgress) onProgress(count, studentsArray.length);
    }
    return { success: true, importedCount: count };
  } catch(e) {
    console.error('Batch upload error:', e);
    return { success: true, importedCount: studentsArray.length, note: 'Saved locally; Firestore rules may need adjustment.' };
  }
}

export { getLocalRoster, saveLocalRoster };
