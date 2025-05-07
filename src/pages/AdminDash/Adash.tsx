// src/pages/InstructorDash/InstructorDashboard.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from 'components/InstructorDash/DashboardHeader';
import DashboardSidebar from 'components/InstructorDash/DashboardSidebar';
import AdminDashboardHeader from 'components/AdminDash/AdDashHeader';
import AdminDashboardSidebar from 'components/AdminDash/AdDashSide';

const AdminDash: React.FC = () => {
  return (
    <div>
      <AdminDashboardHeader />
      <div className="flex">
        <AdminDashboardSidebar />
        <div className="flex-1 p-8">
          <Outlet /> {/* Nested routes will render here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
