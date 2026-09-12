import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Portal           from './pages/Portal';
import StudentDashboard from './pages/StudentDashboard';
import AdminLogin       from './pages/AdminLogin';
import Admin            from './pages/Admin';
import Seed             from './pages/Seed';

function ProtectedStudent({ children }) {
  const { student, loading } = useAuth();
  if (loading) return null;
  return student ? children : <Navigate to="/" replace />;
}

function ProtectedAdmin({ children }) {
  const { student, role, loading } = useAuth();
  if (loading) return null;
  return (student && (role === 'admin' || student.role === 'admin')) ? children : <Navigate to="/admin" replace />;
}

function PublicStudentRoute({ children }) {
  const { student, role, loading } = useAuth();
  if (loading) return null;
  if (student) {
    if (role === 'admin' || student.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function PublicAdminRoute({ children }) {
  const { student, role, loading } = useAuth();
  if (loading) return null;
  if (student && (role === 'admin' || student.role === 'admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                  element={<PublicStudentRoute><Login /></PublicStudentRoute>} />
          <Route path="/register"          element={<PublicStudentRoute><Register /></PublicStudentRoute>} />
          <Route path="/portal"            element={<ProtectedStudent><Portal /></ProtectedStudent>} />
          <Route path="/dashboard"         element={<ProtectedStudent><StudentDashboard /></ProtectedStudent>} />
          <Route path="/dashboard/:page"    element={<ProtectedStudent><StudentDashboard /></ProtectedStudent>} />
          <Route path="/student-dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin"             element={<PublicAdminRoute><AdminLogin /></PublicAdminRoute>} />
          <Route path="/admin/dashboard"   element={<ProtectedAdmin><Admin /></ProtectedAdmin>} />
          <Route path="/seed"              element={<Seed />} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
