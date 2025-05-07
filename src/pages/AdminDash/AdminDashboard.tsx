import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaBookOpen, 
  FaUserGraduate, 
  FaCertificate 
} from 'react-icons/fa';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  action: string;
  time: string;
}

const AdminDashboard: React.FC = () => {
  // State variables for admin dashboard stats
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [activeEnrollments, setActiveEnrollments] = useState<number>(0);
  const [totalCertificates, setTotalCertificates] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Static data for system notifications (optional)
  const systemNotifications = [
    { id: 1, type: 'user', title: 'Nouvel Utilisateur', action: 'Inscription confirmée', time: 'Il y a 1h' },
    { id: 2, type: 'course', title: 'Nouveau Cours', action: 'Cours ajouté', time: 'Il y a 3h' },
    { id: 3, type: 'report', title: 'Rapport Hebdomadaire', action: 'Disponible', time: 'Il y a 6h' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAdminDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5135/api/Admin/dashboard', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTotalUsers(data.totalUsers);
          setTotalCourses(data.totalCourses);
          setActiveEnrollments(data.activeEnrollments);
          setTotalCertificates(data.totalCertificates);
          setRecentActivities(data.recentActivities);
        } else {
          console.error('Failed to fetch admin dashboard data');
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      }
    };

    fetchAdminDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de Bord Administrateur 🎓
        </h1>
        <p className="text-gray-600 mt-2">
          Supervision et gestion de la plateforme
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Utilisateurs Total</p>
              <h3 className="text-3xl font-bold mt-2">{totalUsers}</h3>
            </div>
            <FaUsers className="text-4xl text-white/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Cours Actifs</p>
              <h3 className="text-3xl font-bold mt-2">{totalCourses}</h3>
            </div>
            <FaBookOpen className="text-4xl text-white/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Inscriptions Actives</p>
              <h3 className="text-3xl font-bold mt-2">{activeEnrollments}</h3>
            </div>
            <FaUserGraduate className="text-4xl text-white/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Certificats Délivrés</p>
              <h3 className="text-3xl font-bold mt-2">{totalCertificates}</h3>
            </div>
            <FaCertificate className="text-4xl text-white/20" />
          </div>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Activités Récentes</h2>
        {recentActivities.length === 0 ? (
          <p className="text-gray-500">Aucune activité récente.</p>
        ) : (
          <ul className="space-y-2">
            {recentActivities.map(activity => (
              <li key={activity.id} className="flex justify-between bg-white p-4 rounded-lg shadow">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
