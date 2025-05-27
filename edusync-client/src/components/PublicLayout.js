// src/components/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

const PublicLayout = () => {
  return (
    <>
      <PublicNavbar />
      <main className="container mt-4">
        <Outlet />
      </main>
    </>
  );
};

export default PublicLayout;
