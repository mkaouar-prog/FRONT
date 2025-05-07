import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaUsers, FaGraduationCap, FaChartLine, FaClock } from 'react-icons/fa';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeUsers: number;
  usersByRole: {
    students: number;
    teachers: number;
    admins: number;
  };
  enrollmentsByMonth: { month: string; count: number }[];
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5135/api/Admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load analytics');
        setData(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Quick stats
  const { totalUsers, totalCourses, totalEnrollments, activeUsers, usersByRole, enrollmentsByMonth } = data;

  // Line chart for enrollments
  const lineChartData = {
    labels: enrollmentsByMonth.map(e => e.month),
    datasets: [
      {
        label: 'Inscriptions',
        data: enrollmentsByMonth.map(e => e.count),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Doughnut for user distribution
  const distributionData = {
    labels: ['Étudiants', 'Enseignants', 'Administrateurs'],
    datasets: [
      {
        data: [usersByRole.students, usersByRole.teachers, usersByRole.admins],
        backgroundColor: ['#818CF8', '#34D399', '#F472B6']
      }
    ]
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Analytics Overview</h1>
        <p className="text-sm text-gray-500">Last 30 days performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Users</p>
              <h3 className="text-xl font-bold text-gray-800">{totalUsers}</h3>
            </div>
            <FaUsers className="text-2xl text-indigo-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Courses</p>
              <h3 className="text-xl font-bold text-gray-800">{totalCourses}</h3>
            </div>
            <FaGraduationCap className="text-2xl text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Enrollments</p>
              <h3 className="text-xl font-bold text-gray-800">{totalEnrollments}</h3>
            </div>
            <FaChartLine className="text-2xl text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Active Users</p>
              <h3 className="text-xl font-bold text-gray-800">{activeUsers}</h3>
            </div>
            <FaClock className="text-2xl text-pink-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrollment Trends */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Enrollment Trends</h3>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
              },
              scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
              },
              elements: { point: { radius: 2 } }
            }}
          />
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">User Distribution</h3>
          <div className="h-[250px] flex items-center justify-center">
            <Doughnut
              data={distributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom', labels: { padding: 20 } }
                },
                cutout: '65%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
