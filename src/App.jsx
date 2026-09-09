import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login      from './pages/Login';
import Portal     from './pages/Portal';
import AdminLogin from './pages/AdminLogin';
import Admin      from './pages/Admin';

function ProtectedStudent({ children }) {
  const { student, loading } = useAuth();
  if (loading) return null;
  return student ? children : <Navigate to="/" replace />;
}

function ProtectedAdmin({ children }) {
  const { student, role, loading } = useAuth();
  if (loading) return null;
  return (student && role === 'admin') ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<Login />} />
          <Route path="/portal" element={<ProtectedStudent><Portal /></ProtectedStudent>} />
          <Route path="/admin"  element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedAdmin><Admin /></ProtectedAdmin>} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
