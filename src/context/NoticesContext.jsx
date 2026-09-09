import React, { createContext, useContext, useState, useCallback } from 'react';
import { NOTICES_DATA } from '../data/appData';
import { playNotificationSound, sendPhoneNotification } from '../data/appData';

const NoticesContext = createContext(null);

function loadNotices() {
  try {
    const s = localStorage.getItem('sbup_notices');
    if (s) return JSON.parse(s);
  } catch(e) {}
  return NOTICES_DATA;
}
function saveNotices(list) {
  try { localStorage.setItem('sbup_notices', JSON.stringify(list)); } catch(e) {}
}

export function NoticesProvider({ children }) {
  const [notices, setNotices] = useState(loadNotices);

  const markRead = useCallback((id) => {
    setNotices(prev => {
      const next = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      saveNotices(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotices(prev => {
      const next = prev.map(n => ({ ...n, isRead: true }));
      saveNotices(next);
      return next;
    });
  }, []);

  const addNotice = useCallback((notice) => {
    setNotices(prev => {
      const exists = prev.some(n => n.id === notice.id || n.title === notice.title);
      if (exists) return prev;
      const next = [{ ...notice, isRead: false }, ...prev];
      saveNotices(next);
      // Sound + phone push
      playNotificationSound();
      sendPhoneNotification(notice);
      return next;
    });
  }, []);

  const unreadCount = notices.filter(n => !n.isRead).length;

  return (
    <NoticesContext.Provider value={{ notices, markRead, markAllRead, addNotice, unreadCount }}>
      {children}
    </NoticesContext.Provider>
  );
}

export function useNotices() {
  return useContext(NoticesContext);
}
