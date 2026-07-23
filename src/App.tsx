import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ServiceDetail } from './pages/ServiceDetail';
import { BlogPost } from './pages/BlogPost';
import { Auth } from './pages/Auth';
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
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>);
}
