// ─── Shared data from SBUP Connect ───────────────────────────

export const NOTES_DATA = [
  { id: 1, title: 'Machine Learning Algorithms & Python Scikit-Learn.pdf', subject: 'Data Science', date: '05 Sep 2026', author: 'Prof. R. Deshmukh', size: '4.2 MB', category: 'datascience' },
  { id: 2, title: 'SQL Indexing & Advanced Query Optimization.pdf', subject: 'Business Analytics', date: '02 Sep 2026', author: 'Dr. Swati Kulkarni', size: '2.8 MB', category: 'analytics' },
  { id: 3, title: 'Financial Risk Modeling & VaR Formula Guide.pdf', subject: 'Finance Analytics', date: '28 Aug 2026', author: 'Prof. Vikram Patil', size: '5.1 MB', category: 'finance' },
  { id: 4, title: 'Digital Marketing Metrics & Google Analytics 4.pdf', subject: 'Marketing', date: '25 Aug 2026', author: 'Dr. Ananya Roy', size: '3.4 MB', category: 'marketing' },
  { id: 5, title: 'People Analytics & HR Metrics Workbook.pdf', subject: 'Human Resources', date: '20 Aug 2026', author: 'Prof. S. Mehta', size: '1.9 MB', category: 'hr' },
  { id: 6, title: 'Autonomous AI Agents & Vector RAG Notes.pdf', subject: 'Computer Science', date: '15 Aug 2026', author: 'Dr. P. Varma', size: '6.5 MB', category: 'cs' },
  { id: 7, title: 'Strategic Management & Porter Five Forces.pdf', subject: 'Management', date: '10 Aug 2026', author: 'Prof. A. Verma', size: '3.1 MB', category: 'analytics' },
  { id: 8, title: 'Microeconomics & Game Theory Workbook.pdf', subject: 'Economics', date: '05 Aug 2026', author: 'Dr. R. Joshi', size: '2.6 MB', category: 'finance' },
];

export const NOTICES_DATA = [
  { id: 1, title: 'Mid-Term Examination Hall Ticket Generation Active', category: 'Academic', priority: 'Important', date: 'Today, 09:30 AM', author: 'Examination Cell SBUP', isRead: false, body: 'All Sem 4 students of BIMM, BITM, BIIB & BIMHRD can now download their official mid-term examination hall tickets. Hall tickets must be printed and stamped by the institute office before 10 Sep 2026.' },
  { id: 2, title: 'Campus Placement Drive: Deloitte US-India & KPMG', category: 'Placement', priority: 'Important', date: 'Yesterday', author: 'Corporate Relations & Placement Cell', isRead: false, body: 'Pre-placement talk and online technical test for Data Science & Finance specializations will take place in the Main Auditorium tomorrow at 10:00 AM. Attendance is mandatory for shortlisted candidates.' },
  { id: 3, title: 'SBUP Annual Cultural Fest 2026 Registrations Open', category: 'Events', priority: 'Normal', date: '04 Sep 2026', author: 'Student Cultural Committee', isRead: false, body: 'Registrations for music, band, street play, and dance competitions for Astitva Cultural Fest 2026 are now open. Prize pool of Rs. 2.5 Lakhs across categories.' },
  { id: 4, title: 'Hostel Night Entry Timings & Gate Pass Circular', category: 'Hostel', priority: 'Important', date: '02 Sep 2026', author: 'Chief Rector & Hostel Office', isRead: false, body: 'Students leaving campus post 08:30 PM must submit an online Gate Pass Request through the SBUP Connect portal. Gate passes must be approved by the hostel warden prior to exit.' },
];

export const NEWS_DATA = [
  { id: 0, title: 'India AI Mission Allocates Rs.10,000 Crore for University Labs', category: 'tech', categoryLabel: 'Technology', source: 'Economic Times', date: '07 Sep 2026', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800', summary: 'National Supercomputing Initiative expands GPU availability to top higher education institutes.', body: 'The Union Cabinet has approved the deployment of high-performance GPU clusters across 100 premier universities. The Rs.10,000 crore outlay aims to build dedicated AI infrastructure.' },
  { id: 1, title: 'RBI Projects 7.2% GDP Growth Driven by Services & Data Technology', category: 'business', categoryLabel: 'Business', source: 'Financial Express', date: '07 Sep 2026', image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800', summary: 'Monetary Policy Committee highlights robust domestic consumption and tech hiring.', body: 'The Reserve Bank of India retained its optimistic GDP projection of 7.2% for FY27, citing technology-led services growth as the primary driver.' },
  { id: 2, title: 'ISRO Successfully Tests Next-Generation Heavy Payload Rocket Booster', category: 'india', categoryLabel: 'India', source: 'The Hindu', date: '06 Sep 2026', image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=800', summary: 'Sriharikota spaceport completes ground test firing of indigenous cryogenic engine.', body: 'ISRO achieved a milestone with the 500-second endurance test of its CE-20 cryogenic engine at the Propulsion Complex.' },
  { id: 3, title: 'Global Tech Summit Concludes: Focus on Ethical AI & Data Sovereignty', category: 'world', categoryLabel: 'World', source: 'Reuters World', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800', summary: 'Delegates from 40 nations sign international AI safety framework.', body: 'International tech leaders aligned on new privacy compliance benchmarks. The agreement includes provisions for ethical AI deployment and data sovereignty.' },
  { id: 4, title: 'Indian Cricket Team Secures T20 Series Victory in Final Over Thriller', category: 'sports', categoryLabel: 'Sports', source: 'SportsStar', date: '06 Sep 2026', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800', summary: 'Spectacular bowling performance in the death overs seals a dramatic 12-run win.', body: 'A packed stadium witnessed an exhilarating finish as India defended 185 runs against Australia.' },
  { id: 5, title: 'Startup India Fund: Rs. 500 Cr Allocated for Campus Incubation Hubs', category: 'business', categoryLabel: 'Business', source: 'LiveMint', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800', summary: 'DPIIT partners with 50 universities to set up state-of-the-art innovation centres.', body: 'New campus-based incubators to support early-stage ventures with seed funding and mentorship.' },
];

export const GALLERY_DATA = [
  { id: 1, category: 'campus',    title: 'SBUP Main Academic Quadrangle', location: 'Main Campus Pune',   image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800', badge: 'Campus',   date: 'Aug 2026' },
  { id: 2, category: 'campus',    title: 'Sri Balaji Central Library',     location: 'Central Library',    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800', badge: 'Campus',   date: 'Jul 2026' },
  { id: 3, category: 'events',    title: 'Annual Convocation Ceremony',    location: 'Grand Auditorium',   image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800', badge: 'Event',    date: 'Jun 2026' },
  { id: 4, category: 'events',    title: 'SBUP Founders Day Celebration',  location: 'Amphitheatre',       image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800', badge: 'Event',    date: 'May 2026' },
  { id: 5, category: 'cultural',  title: 'Astitva Cultural Fest Night',    location: 'Main Ground',        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800', badge: 'Cultural', date: 'Apr 2026' },
  { id: 6, category: 'sports',    title: 'Inter-College Football Finals',  location: 'Sports Complex',     image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800', badge: 'Sports',   date: 'Mar 2026' },
  { id: 7, category: 'workshops', title: 'AI & Data Science Hackathon',    location: 'Tech Lab 4',         image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800', badge: 'Workshop', date: 'Sep 2026' },
  { id: 8, category: 'campus',    title: 'SBUP Research Innovation Hub',   location: 'Block C',            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', badge: 'Campus',   date: 'Sep 2026' },
];

export const TIMETABLE_DATA = [
  { time: '09:00 AM', mon: 'Machine Learning', tue: 'Strategic Mgmt', wed: 'Python Lab', thu: 'Bus. Analytics', fri: 'Research Methods' },
  { time: '11:00 AM', mon: 'Bus. Analytics Lab', tue: 'Python for DS', wed: 'Financial Models', thu: 'ML Algorithms', fri: 'Case Study' },
  { time: '01:00 PM', mon: '— Lunch Break —', tue: '— Lunch Break —', wed: '— Lunch Break —', thu: '— Lunch Break —', fri: '— Lunch Break —' },
  { time: '02:00 PM', mon: 'Python for DS', tue: 'Bus. Analytics', wed: 'Strategic Mgmt', thu: 'Python Lab', fri: 'Research Methods' },
  { time: '04:00 PM', mon: 'Strategic Mgmt', tue: 'ML Algorithms', wed: 'Library / Self', thu: 'Case Study', fri: 'Guest Lecture' },
];

export const INST_MAP = {
  BIMM:   'Balaji Institute of Modern Management',
  BITM:   'Balaji Institute of Telecom and Management',
  BIIB:   'Balaji Institute of International Business',
  BIMHRD: 'Balaji Institute of Management and HRD',
  SBSCS:  'Sri Balaji School of Computer Studies',
};

export const SPECIALIZATIONS = [
  { key: 'Data Science and Business Analytics', icon: '📊', color: '#0EA5E9', bg: '#E0F2FE', desc: 'ML, Python, Predictive Modeling and BI.' },
  { key: 'Marketing and Brand Management', icon: '🎯', color: '#EF4444', bg: '#FEE2E2', desc: 'Digital Marketing, Brand Strategy and B2B Sales.' },
  { key: 'Finance and Financial Analytics', icon: '📈', color: '#10B981', bg: '#D1FAE5', desc: 'Corporate Finance, Fintech and Equity Research.' },
  { key: 'Human Resources and People Analytics', icon: '👥', color: '#8B5CF6', bg: '#EDE9FE', desc: 'Talent Acquisition, HR Tech and Labor Laws.' },
  { key: 'International Business and Global Logistics', icon: '🌐', color: '#F59E0B', bg: '#FEF3C7', desc: 'Cross-Border Trade and Supply Chain.' },
  { key: 'Computer Science and AI Systems', icon: '💻', color: '#6366F1', bg: '#EDE9FE', desc: 'Full-Stack, LLM Agents and Cloud Architecture.' },
];

// Push notification helpers
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine'; osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.2, now); gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.start(now); osc1.stop(now + 0.3);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(1318.5, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12); gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.start(now + 0.12); osc2.stop(now + 0.55);
  } catch(e) {}
}

export function sendPhoneNotification(notice) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (navigator.vibrate) { try { navigator.vibrate([200, 100, 200, 100, 200]); } catch(e) {} }
  const title = `SBUP Alert: ${notice.title}`;
  const opts = {
    body: notice.body || notice.title, icon: '/sbup-logo.png', badge: '/sbup-logo.png',
    vibrate: [200, 100, 200, 100, 200], tag: 'sbup-notice-' + (notice.id || Date.now()),
    renotify: true, requireInteraction: true, data: { url: window.location.origin }
  };
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', title, options: opts });
  } else if (navigator.serviceWorker?.ready) {
    navigator.serviceWorker.ready.then(reg => reg.showNotification(title, opts)).catch(() => {
      try { new Notification(title, opts); } catch(e) {}
    });
  } else {
    try { new Notification(title, opts); } catch(e) {}
  }
}
