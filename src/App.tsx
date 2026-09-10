import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ServiceDetail } from './pages/ServiceDetail';
import { BlogPost } from './pages/BlogPost';
import { Auth } from './pages/Auth';
import { Account } from './pages/Account';
import { ResetPassword } from './pages/ResetPassword';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ConsultantPortal } from './pages/ConsultantPortal';
import { AdminQuotes } from './pages/AdminQuotes';
function AdminRoute({
  children


}: {children: React.ReactElement;}) {
  const {
    user,
    loading
  } = useAuth();
  if (loading) {
    return null;
  }

  // Not logged in -> send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in with non-admin email -> send to account dashboard
  if (user.email !== 'info@safemethods.org') {
    return <Navigate to="/account" replace />;
  }
  return children;
}
export function AppRoutes() {
  return <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServiceDetail />} />
          <Route path="/blog" element={<BlogPost />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/admin/quotes" element={<AdminRoute>
                <AdminQuotes />
              </AdminRoute>} />
        </Route>
        <Route path="/consultant-portal" element={<ConsultantPortal />} />
      </Routes>
    </AuthProvider>;
}
export function App() {
  return <AppRoutes />;
}