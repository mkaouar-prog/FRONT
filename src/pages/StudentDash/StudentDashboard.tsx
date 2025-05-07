// StudentDashboard.tsx (Layout Component)
import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentDashboardHeader from 'components/StudentDash/StDashHeader';
import StudentDashboardSidebar from 'components/StudentDash/StDashSide';

const StudentDashboard: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <StudentDashboardHeader />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <StudentDashboardSidebar />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet /> {/* This renders the nested route component */}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
