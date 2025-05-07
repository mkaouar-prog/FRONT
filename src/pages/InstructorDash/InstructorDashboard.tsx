// src/pages/InstructorDash/InstructorDashboard.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from 'components/InstructorDash/DashboardHeader';
import DashboardSidebar from 'components/InstructorDash/DashboardSidebar';

const InstructorDashboard: React.FC = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 p-8">
          <Outlet /> {/* Nested routes will render here */}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
