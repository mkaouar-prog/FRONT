import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaBookOpen, 
  FaChartBar, 
  FaBell, 
  FaTools, 
  FaCog, 
  FaSignOutAlt,
  FaShieldAlt,
  FaClipboardList
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { useAuth } from 'hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdAnalytics } from "react-icons/md";

interface AdminStats {
  totalUsers: number;
  activeCourses: number;
  pendingApprovals: number;
}

interface MenuItem {
  id: 'dashboard' | 'users' | 'courses' | 'analytics' | 'approvals' | 'system' | 'settings';
  icon: IconType;
  label: string;
  count?: number;
  notification?: number;
  isRestricted?: boolean;
}

const AdminDashboardSidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<'dashboard' | 'users' | 'courses' | 'analytics' | 'approvals' | 'system' | 'settings'>('dashboard');
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    activeCourses: 0,
    pendingApprovals: 0
  });
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const { user } = useAuth();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname.split('/').pop() || 'dashboard';
    setActiveItem(currentPath as typeof activeItem);
  }, [location.pathname]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5135/api/Admin/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAdminStats({
            totalUsers: data.totalUsers,
            activeCourses: data.totalCourses,
            pendingApprovals: data.pendingApprovals
          });
          setNotificationCount(data.pendingNotifications);
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    fetchAdminStats();
  }, []);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: FaChartBar, label: 'Tableau de bord' },
    { id: 'users', icon: FaUsers, label: 'Utilisateurs', count: adminStats.totalUsers },
    { id: 'courses', icon: FaBookOpen, label: 'Gestion des Cours', count: adminStats.activeCourses },
    { id: 'analytics', icon: MdAnalytics, label: 'Analytiques' },
    { id: 'approvals', icon: FaClipboardList, label: 'Approbations', notification: adminStats.pendingApprovals },
  
    { id: 'system', icon: FaTools, label: 'Système', isRestricted: true },
    { id: 'settings', icon: FaCog, label: 'Paramètres' },
  ];

  const routeMapping: Record<typeof activeItem, string> = {
    dashboard: '/admin',
    users: '/admin/users',
    courses: '/admin/courses',
    analytics: '/admin/analytics',
    approvals: '/admin/approvals',
    system: '/admin/system',
    settings: '/admin/settings',
  };

  const handleItemClick = (content: MenuItem["id"]) => {
    setActiveItem(content);
    navigate(routeMapping[content]);
  };

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 bg-gray-900 h-screen border-r border-gray-800 flex flex-col shadow-lg"
    >
      {/* Admin Profile Section */}
      <div className="p-6 border-b border-gray-800">
        <motion.div 
          className="flex items-center space-x-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <img
            src='https://cdn.vectorstock.com/i/500p/38/46/admin-icon-isolated-on-white-background-vector-53093846.jpg'
              alt="Admin Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {user?.name || "Admin Name"}
            </h2>
            <p className="text-xs text-gray-400">Administrateur</p>
          </div>
        </motion.div>
      </div>

      {/* Admin Role Badge */}
      <div className="px-6 py-3 border-b border-gray-800">
        <motion.div 
          className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-3 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-2">
            <FaShieldAlt className="text-xl" />
            <span className="text-sm font-medium">Admin Console</span>
          </div>
        </motion.div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ x: 6 }}
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center justify-between px-6 py-3 text-sm
              ${activeItem === item.id 
                ? 'text-white bg-blue-600' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="text-xl" />
              <span>{item.label}</span>
            </div>
            {(item.count !== undefined || item.notification !== undefined) && (
              <span className={`px-2 py-1 rounded-full text-xs
                ${item.notification ? 'bg-red-500' : 'bg-gray-700'}`}>
                {item.notification ?? item.count}
              </span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <motion.button
         onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          <FaSignOutAlt />
          <span>Déconnexion</span>

        </motion.button>
      </div>
    </motion.aside>
  );
};

export default AdminDashboardSidebar;