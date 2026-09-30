import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { initGA, trackPageView } from './lib/analytics';
import { CookieBanner } from './components/CookieBanner';
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

function AdminRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();

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

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
}

export function AppRoutes() {
  usePageTracking();
  useEffect(() => {
    initGA();
  }, []);
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServiceDetail />} />
          <Route path="/blog" element={<BlogPost />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/admin/quotes"
            element={
              <AdminRoute>
                <AdminQuotes />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="/consultant-portal" element={<ConsultantPortal />} />
      </Routes>
      <CookieBanner />
    </AuthProvider>
  );
}

export function App() {
  return <AppRoutes />;
}