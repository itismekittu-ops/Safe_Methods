import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ServiceDetail } from './pages/ServiceDetail';
import { BlogPost } from './pages/BlogPost';
import { Auth } from './pages/Auth';
import { Account } from './pages/Account';
import { ResetPassword } from './pages/ResetPassword';
export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServiceDetail />} />
            <Route path="/blog" element={<BlogPost />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>);
}
