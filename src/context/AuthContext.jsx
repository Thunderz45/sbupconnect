import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSession, clearSession } from '../firebase/service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      const session = getCurrentSession();
      return session || null;
    } catch (e) {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      const session = getCurrentSession();
      return session?.role || 'student';
    } catch (e) {
      return 'student';
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Re-verify session in background
    const session = getCurrentSession();
    if (session) {
      setStudent(session);
      if (session.role) setRole(session.role);
    }
    setLoading(false);
  }, []);

  const login = (studentData, userRole = 'student') => {
    const sessionObj = { ...studentData, role: userRole };
    try {
      localStorage.setItem('sbup_session', JSON.stringify(sessionObj));
    } catch (e) {
      console.warn('Error saving session:', e);
    }
    setStudent(sessionObj);
    setRole(userRole);
  };

  const logout = () => {
    clearSession();
    try {
      localStorage.removeItem('sbup_session');
    } catch (e) { /* ignore */ }
    setStudent(null);
    setRole('student');
  };

  return (
    <AuthContext.Provider value={{ student, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
