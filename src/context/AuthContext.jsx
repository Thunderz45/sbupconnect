import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSession, clearSession } from '../firebase/service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [role, setRole] = useState('student'); // 'student' | 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getCurrentSession();
    if (session) setStudent(session);
    setLoading(false);
  }, []);

  const login = (studentData, userRole = 'student') => {
    setStudent(studentData);
    setRole(userRole);
  };

  const logout = () => {
    clearSession();
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
