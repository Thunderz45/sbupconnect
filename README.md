# 🎓 SBUP Connect — University Student Portal & Management Suite

**SBUP Connect** is a unified, production-grade student portal and administrative suite engineered for **Sri Balaji University Pune (SBUP)**. It powers real-time academic workflows across all constituent institutes: **BIMM**, **BITM**, **BIIB**, **BIMHRD**, and **SBSCS**.

---

## 🌟 Key Capabilities

### 📱 Student Portal
- **Mobile-First Responsive Interface**: Handcrafted for iOS (iPhone SE to 15 Pro Max), Android phones, tablets, laptops, and 4K desktops.
- **2-Step Verified Registration**: Verifies roll numbers against the university database, shows verified identity details, and enforces secure password creation.
- **Strict Institute & Specialization Isolation**: Notes, schedules, and circulars are partitioned so students only see materials meant for their institute and program.
- **Biometric Attendance Tracking**: Live attendance percentage with automatic 75% threshold status badges and eligibility monitoring.
- **Day-Wise Academic Timetable**: Filterable lecture schedules displaying faculty names, hall numbers, and break timings.
- **Course Notes & Lecture Materials**: Subject-wise search, filter by specialization, and download course documents.
- **Real-Time Broadcast Alerts & Notices**: Instant university-wide and institute-specific administrative announcements.
- **Faculty Directory**: Contact information, office hours, and cabin locations for academic mentors.

### 🛡️ Administration Management Suite
- **Student Roster Management**: Search, filter by institute/semester, add/edit records, and batch import via Excel/CSV spreadsheets.
- **Attendance Processing**: Excel batch upload with validation and percentage sanitization, plus individual student attendance adjustments.
- **Course Notes Publishing**: Direct uploads with dynamic specialization mapping per institute.
- **Timetable Scheduling**: Day-wise lecture slot builder and spreadsheet importer.
- **Official Notices & News**: Priority categorization (Urgent, Important, Normal), pinned notices, and campus news bulletins.
- **Real-Time Alert Broadcasts**: Push urgent banners across all connected student sessions without requiring manual page reloads.
- **Faculty Management**: Add and manage faculty profiles and consultation schedules.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18 with modern Hooks & React Router DOM v7
- **Styling**: Modern Vanilla CSS Design System with responsive tokens, glassmorphic cards, and zero external CSS bloat
- **Icons**: Lucide React
- **Spreadsheet Engine**: SheetJS (XLSX) for bidirectional Excel roster and attendance processing
- **Backend & Real-Time Sync**: Firebase Firestore with cross-tab/window BroadcastChannel synchronization and local offline fallback
- **Bundler & Build**: Vite 8 with ES modules and optimized production chunks
- **Deployment**: Vercel ready with SPA rewrites (`vercel.json`)

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 2. Installation
```bash
# Clone repository
git clone https://github.com/Thunderz45/sbupconnect.git
cd sbupconnect

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory (or configure in Vercel project settings):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Running Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
```

---

## 🔐 Default Credentials for Testing

- **Student Login**:
  - Roll Number: `20230948271`
  - Password: `password123` (or register any roll number in the roster)
- **Admin Portal**:
  - URL: `/admin`
  - Email: `admin@sbup.edu.in`
  - Password: `sbup@admin2026`

---

## 🏛️ Constituent Institutes

| Code | Full Name | Focus Areas |
|---|---|---|
| **BIMM** | Balaji Institute of Modern Management | Data Science, Marketing, Finance, HR |
| **BITM** | Balaji Institute of Telecom and Management | Telecom, Technology Management, Analytics |
| **BIIB** | Balaji Institute of International Business | International Business, Global Supply Chain |
| **BIMHRD** | Balaji Institute of Management & HRD | HR Leadership, Talent Analytics |
| **SBSCS** | School of Computer Studies | AI Systems, Software Engineering, Cloud |

---

## 📄 License
Sri Balaji University Pune — All Rights Reserved.
