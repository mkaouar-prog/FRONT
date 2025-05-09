import React, { useState, useEffect } from 'react';
import { 
  FaGraduationCap, 
  FaBook, 
  FaCalendarAlt, 
  FaBell, 
  FaRobot, 
  FaCog, 
  FaSignOutAlt,
  FaCrown,
  FaCompass
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { useAuth } from 'hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { PiCertificateFill } from "react-icons/pi";

interface Subscription {
  type: 'basic' | 'premium' | 'pro';
  status: 'Pending' | 'Approved' | 'Expired';
}

interface MenuItem {
  id: 'overview' | 'courses' | 'discover' | 'schedule' | 'progress' | 'notifications' | 'chatbot' | 'settings';
  icon: IconType;
  label: string;
  count?: number;
  notification?: number;
  isPremium?: boolean;
}

const StudentDashboardSidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<MenuItem['id']>('overview');
  const [enrolledCourses, setEnrolledCourses] = useState(0);
  const [certificatesCompleted, setCertificatesCompleted] = useState(0);
  const [notificationCount, setNotifications] = useState(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
 
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Determine active menu item from URL
  useEffect(() => {
    const p = location.pathname;
    if (p === '/dashboard' || p === '/dashboard/') setActiveItem('overview');
    else if (p.includes('/courses')) setActiveItem('courses');
    else if (p.includes('/discover-courses')) setActiveItem('discover');
    else if (p.includes('/schedule')) setActiveItem('schedule');
    else if (p.includes('/c')) setActiveItem('progress');
    else if (p.includes('/notifications')) setActiveItem('notifications');
    else if (p.includes('/chatbot')) setActiveItem('chatbot');
    else if (p.includes('/settings')) setActiveItem('settings');
  }, [location.pathname]);

  // Fetch sidemine (courses + certs + plan + status)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5135/api/Courses/sidemine`, 
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(res.statusText);
        const data: {
          totalCoursesEnrolled: number;
          totalNotifications: number;
          totalCertificatesCompleted: number;
          plan: number;
          status: 'Pending' | 'Approved' | 'Expired';
        } = await res.json();

        setEnrolledCourses(data.totalCoursesEnrolled);
        setCertificatesCompleted(data.totalCertificatesCompleted);
        setNotifications(data.totalNotifications);
        // Map plan number to type
        let type: Subscription['type'] = 'basic';
        if (data.plan === 1) type = 'premium';
        else if (data.plan === 2) type = 'pro';

        setSubscription({ type, status: data.status });
      } catch (err) {
        console.error('Failed to load sidemine:', err);
      }
    })();
  }, [token]);

  const menuItems: MenuItem[] = [
    { id: 'overview', icon: FaGraduationCap, label: 'Tableau de bord' },
    { id: 'courses', icon: FaBook, label: 'Mes Cours', count: enrolledCourses },
    { id: 'discover', icon: FaCompass, label: 'Découvrir des Cours', isPremium: true },
    { id: 'schedule', icon: FaCalendarAlt, label: 'Emploi du temps' },
    { id: 'progress', icon: PiCertificateFill, label: 'Mes Certificats' },
    { id: 'notifications', icon: FaBell, label: 'Notifications', notification: notificationCount },
    { id: 'chatbot', icon: FaRobot, label: 'Assistant IA' },
    { id: 'settings', icon: FaCog, label: 'Paramètres' },
  ];

  const routeMapping: Record<MenuItem['id'], string> = {
    overview: '/dashboard',
    courses: '/dashboard/courses',
    discover: '/dashboard/discover-courses',
    schedule: '/dashboard/schedule',
    progress: '/dashboard/c',
    notifications: '/dashboard/notifications',
    chatbot: '/dashboard/chatbot',
    settings: '/dashboard/profile',
  };

  const handleItemClick = (id: MenuItem['id']) => {
    setActiveItem(id);
    navigate(routeMapping[id]);
  };

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 bg-white h-screen border-r border-gray-200 flex flex-col shadow-lg"
    >
      {/* Profile */}
      <div className="p-6 border-b border-gray-200">
        <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-4">
          <div className="relative">
            <img   src="http://localhost:3000/assets/s.png" alt="Profile" className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover"/>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"/>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{user?.name || 'Student Name'}</h2>
            <p className="text-xs text-gray-500">Étudiant</p>
          </div>
        </motion.div>
      </div>

      {/* Subscription Card */}
      <div className="px-6 py-3 border-b border-gray-200">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 text-white"
        >
          <div className="flex items-center space-x-2">
            <FaCrown className="text-yellow-300" />
            <div>
              <p className="text-sm font-semibold">
                {subscription
                  ? subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1)
                  : 'Basic'} Plan
              </p>
              <p className="text-xs opacity-75">
                {subscription
                  ? subscription.status === 'Approved'
                    ? 'Actif'
                    : subscription.status === 'Pending'
                      ? 'En attente'
                      : 'Expiré'
                  : 'Plan gratuit'}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/sub')}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full"
          >
            Upgrade
          </motion.button>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1 relative">
          {menuItems.map(item => {
            const restricted = item.id === 'chatbot' || item.id === 'schedule';
            const isPro = subscription?.type === 'pro' && subscription.status == 'Approved';
            const disabled = restricted && !isPro;

            return (
              <motion.button
                key={item.id}
                onClick={() => disabled ? navigate('/dashboard/sub') : handleItemClick(item.id)}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group relative
                  ${activeItem === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon 
                    size={20}
                    className={`${activeItem === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors`} 
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`px-2 py-1 text-xs rounded-full
                    ${activeItem === item.id ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {item.count}
                  </span>
                )}
                {item.notification && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {item.notification}
                  </motion.span>
                )}
                {activeItem === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div whileHover={{ scale: 1.02 }} className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Progression Globale</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-500">Cours Suivis</div>
              <div className="text-lg font-semibold text-indigo-600">{enrolledCourses}</div>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-500">Certificats Obtenus</div>
              <div className="text-lg font-semibold text-indigo-600">{certificatesCompleted}</div>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaSignOutAlt size={16} />
          <span>Déconnexion</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default StudentDashboardSidebar;
