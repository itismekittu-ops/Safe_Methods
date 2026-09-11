import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
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
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
    if (gaId) {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }
  }, [location]);
}

export function AppRoutes() {
  usePageTracking();
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
    </AuthProvider>
  );
}

export function App() {
  return <AppRoutes />;
}