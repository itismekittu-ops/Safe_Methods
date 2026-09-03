import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OrganizationSchema } from './OrganizationSchema';

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary/20 flex flex-col">
      <OrganizationSchema />
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
