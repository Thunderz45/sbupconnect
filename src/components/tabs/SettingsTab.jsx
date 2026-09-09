import React, { useState } from 'react';
import { useNotices } from '../../context/NoticesContext';
import { useAuth } from '../../context/AuthContext';
import { playNotificationSound, sendPhoneNotification } from '../../data/appData';
import { Bell, BellOff, Moon, Globe, Shield, RefreshCw, Smartphone, ChevronRight, CheckCircle } from 'lucide-react';

export default function SettingsTab() {
  const { logout } = useAuth();
  const { addNotice } = useNotices();
  const [darkMode, setDarkMode] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(() => 'Notification' in window ? Notification.permission === 'granted' : false);
  const [lang, setLang] = useState('en');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEnablePush = async () => {
    if (!('Notification' in window)) return showToast('Push notifications are not supported in this browser.');
    if (Notification.permission === 'default') {
      const p = await Notification.requestPermission();
      if (p === 'granted') {
        setPushEnabled(true);
        playNotificationSound();
        sendPhoneNotification({ id: Date.now(), title: 'Notifications Enabled!', body: 'You will now receive SBUP notices on your phone.' });
        showToast('Phone notifications enabled!');
      } else {
        showToast('Notification permission denied.');
      }
    } else if (Notification.permission === 'granted') {
      playNotificationSound();
      sendPhoneNotification({ id: Date.now(), title: 'SBUP Notification Test', body: 'Your phone notifications are working perfectly!' });
      showToast('Test notification sent to your phone!');
    } else {
      showToast('Notifications are blocked. Please enable them in your browser settings.');
    }
  };

  const handleTestNotice = () => {
    addNotice({
      id: Date.now(),
      title: 'Test Notice: System Check Complete ✅',
      category: 'Academic', priority: 'Normal',
      date: 'Just now', author: 'SBUP Connect System',
      body: 'This is a test notice to verify the notification system is working correctly.'
    });
    showToast('Test notice sent!');
  };

  const SECTIONS = [
    {
      label: 'Notifications',
      items: [
        {
          icon: Bell, title: 'Phone Notifications',
          desc: pushEnabled ? 'Active — receiving alerts on this device' : 'Get notices directly on your phone',
          action: handleEnablePush,
          badge: pushEnabled ? 'Active' : 'Enable',
          badgeColor: pushEnabled ? '#059669' : '#0EA5E9',
        },
        {
          icon: Bell, title: 'Test Notice',
          desc: 'Send a test notification to verify the system',
          action: handleTestNotice,
          badge: 'Send Test',
          badgeColor: '#8B5CF6',
        },
      ]
    },
    {
      label: 'Appearance',
      items: [
        {
          icon: Moon, title: 'Dark Mode',
          desc: 'Coming soon — toggle dark theme',
          action: () => showToast('Dark mode coming soon!'),
          badge: 'Soon',
          badgeColor: '#94A3B8',
        }
      ]
    },
    {
      label: 'Language',
      items: [
        {
          icon: Globe, title: 'App Language',
          desc: `Currently: ${lang === 'en' ? 'English' : 'हिंदी / Marathi'}`,
          action: () => { setLang(l => l === 'en' ? 'hi' : 'en'); showToast('Language preference updated.'); },
          badge: lang === 'en' ? 'English' : 'हिंदी',
          badgeColor: '#0EA5E9',
        }
      ]
    },
    {
      label: 'Account',
      items: [
        {
          icon: RefreshCw, title: 'Clear App Cache',
          desc: 'Reset locally stored data and preferences',
          action: () => { localStorage.clear(); showToast('Cache cleared! Page will reload…'); setTimeout(() => window.location.reload(), 1500); },
          badge: 'Clear',
          badgeColor: '#F59E0B',
        },
        {
          icon: Shield, title: 'Privacy & Security',
          desc: 'Your data stays on SBUP servers. We do not share your information.',
          action: () => {},
          badge: 'Secured',
          badgeColor: '#10B981',
        },
      ]
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-sub">Manage your app preferences and notifications</div>
      </div>

      {SECTIONS.map(section => (
        <div key={section.label} style={{ marginBottom: 20 }}>
          <div className="nav-group-label" style={{ marginBottom: 8, marginLeft: 0, paddingLeft: 0 }}>{section.label}</div>
          <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
            {section.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: i < section.items.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: '0.15s' }}
                onClick={item.action}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${item.badgeColor}18`, color: item.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 99, background: `${item.badgeColor}18`, color: item.badgeColor, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {item.badge}
                </span>
                <ChevronRight size={14} color="var(--muted)" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ padding: '14px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
        SBUP Connect v2.0 · Sri Balaji University Pune<br />
        <span style={{ fontSize: 11, opacity: 0.6 }}>© 2026 Sri Balaji Society, Pune. All rights reserved.</span>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeIn 0.3s ease', whiteSpace: 'nowrap' }}>
          <CheckCircle size={16} color="#10B981" /> {toast}
        </div>
      )}
    </div>
  );
}
