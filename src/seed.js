// Seed script — run in browser console at http://localhost:5173
// This adds test students to student_list and registers one for immediate login

import { db } from './firebase/config.js';
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

async function seed() {
  console.log('⏳ Seeding student_list...');
  for (const s of TEST_STUDENTS) {
    await setDoc(doc(db, 'student_list', s.rollNumber), {
      ...s,
      uploadedAt: serverTimestamp()
    });
    console.log(`  ✅ Added ${s.name} (${s.rollNumber})`);
  }

  // Register first student with password "password123"
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
  console.log(`\n🔐 Registered test student: ${testStudent.name}`);
  console.log('   Roll Number: ' + testStudent.rollNumber);
  console.log('   Password: password123');
  console.log('\n✅ Seed complete!');
}

seed().catch(e => console.error('Seed failed:', e));

export default seed;
