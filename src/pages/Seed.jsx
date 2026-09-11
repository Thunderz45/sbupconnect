import React, { useState } from 'react';
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const TEST_STUDENTS = [
  { name: 'Bhushan Padghan',  rollNumber: '20230948271', institute: 'BIMM',   specialization: 'Data Science and Business Analytics' },
  { name: 'Aarav Sharma',     rollNumber: '20230948272', institute: 'BITM',   specialization: 'Telecom Management' },
  { name: 'Priya Patel',      rollNumber: '20230948273', institute: 'BIIB',   specialization: 'International Business' },
  { name: 'Rohit Joshi',      rollNumber: '20230948274', institute: 'BIMHRD', specialization: 'Human Resources' },
  { name: 'Sneha Deshmukh',   rollNumber: '20230948275', institute: 'SBSCS',  specialization: 'Computer Science and AI Systems' },
];

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function SeedPage() {
  const [status, setStatus] = useState('');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const runSeed = async () => {
    setRunning(true);
    setStatus('');
    try {
      let log = '';

      // Add to student_list
      log += '⏳ Adding students to student_list...\n';
      setStatus(log);
      for (const s of TEST_STUDENTS) {
        await setDoc(doc(db, 'student_list', s.rollNumber), {
          ...s,
          uploadedAt: serverTimestamp()
        });
        log += `  ✅ ${s.name} (${s.rollNumber})\n`;
        setStatus(log);
      }

      // Register first student
      const testStudent = TEST_STUDENTS[0];
      const hashedPwd = await hashPassword('password123');
      await setDoc(doc(db, 'registered_students', testStudent.rollNumber), {
        rollNumber: testStudent.rollNumber,
        name: testStudent.name,
        institute: testStudent.institute,
        specialization: testStudent.specialization,
        passwordHash: hashedPwd,
        registeredAt: serverTimestamp()
      });

      log += '\n🔐 Registered test student for immediate login:\n';
      log += `   Name: ${testStudent.name}\n`;
      log += `   Roll Number: ${testStudent.rollNumber}\n`;
      log += `   Password: password123\n`;
      log += '\n✅ Seed complete! You can now test.\n';
      setStatus(log);
      setDone(true);
    } catch (e) {
      setStatus(prev => prev + '\n❌ Error: ' + e.message);
    }
    setRunning(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
          🌱 Seed Test Data
        </h1>
        <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24, lineHeight: 1.6 }}>
          This will add 5 test students to Firestore and register one for immediate login testing.
        </p>

        {!done && (
          <button
            onClick={runSeed}
            disabled={running}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 12, border: 'none',
              background: running ? '#94A3B8' : 'linear-gradient(135deg, #0EA5E9, #0284C7)',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: running ? 'not-allowed' : 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: '0 4px 14px rgba(14,165,233,0.3)'
            }}
          >
            {running ? 'Seeding...' : 'Run Seed'}
          </button>
        )}

        {status && (
          <pre style={{
            marginTop: 20, padding: 16, background: '#0F172A', color: '#38BDF8',
            borderRadius: 12, fontSize: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap',
            fontFamily: 'monospace', overflow: 'auto', maxHeight: 300
          }}>
            {status}
          </pre>
        )}

        {done && (
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <a href="/" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px 16px', borderRadius: 12, background: '#EFF6FF', color: '#0284C7',
              fontWeight: 700, fontSize: 13, textDecoration: 'none', border: '1px solid #BAE6FD'
            }}>
              → Student Login
            </a>
            <a href="/admin" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px 16px', borderRadius: 12, background: '#FFFBEB', color: '#D97706',
              fontWeight: 700, fontSize: 13, textDecoration: 'none', border: '1px solid #FDE68A'
            }}>
              → Admin Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
