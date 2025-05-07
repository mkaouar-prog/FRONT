// src/components/Header/StudentDashboardHeader.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBell, FaSearch, FaUserCircle, FaCog, FaSignOutAlt, 
  FaGraduationCap, FaBookReader, FaStar, FaVideo, FaCircle 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface Notification {
  id: number;
  courseId?: number;
  meetingId?: number;
  type: 'course' | 'assignment' | 'achievement';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const StudentDashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // helper to compute “time ago”
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const intervals = [
      { label: 'year',  secs: 31536000 },
      { label: 'month', secs: 2592000 },
      { label: 'day',   secs: 86400 },
      { label: 'hour',  secs: 3600 },
      { label: 'minute',secs: 60 },
    ];
    for (let {label, secs} of intervals) {
      const count = Math.floor(seconds / secs);
      if (count >= 1) return `Il y a ${count} ${label}${count > 1 ? 's' : ''}`;
    }
    return `Il y a ${seconds} sec`;
  };

  // pick icon per type
  const getNotificationIcon = (n: Notification) => {
    if (n.meetingId) return <FaVideo className="text-purple-500" />;
    switch(n.type) {
      case 'course':      return <FaBookReader className="text-blue-500" />;
      case 'assignment':  return <FaGraduationCap className="text-green-500" />;
      case 'achievement': return <FaStar className="text-yellow-500" />;
      default:            return <FaCircle className="text-gray-400" />;
    }
  };

  // fetch on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get<Notification[]>(
          'http://localhost:5135/api/notifications/student',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // mark as read in UI
  const handleNotificationClick = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
    // TODO: call PATCH /api/notifications/{id}/read if available
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Welcome */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4">
            <img src="/assets/aze.png" alt="Logo" className="h-8 w-auto" />
            <div>
              <h1 className="text-lg font-bold">Espace Étudiant</h1>
              <p className="text-xs text-white/80">Bienvenue, {user?.name}</p>
            </div>
          </motion.div>

          {/* Discover Courses */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex justify-center">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('discover-courses')}
              className="flex items-center space-x-2 px-6 py-2 bg-white/10 hover:bg-white/20 
                         rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200">
              <FaBookReader className="text-xl" />
              <span className="font-medium">Découvrir les cours</span>
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 
                               rounded-full flex items-center justify-center ml-2 animate-pulse">
                <span className="text-xs font-bold">+</span>
              </div>
            </motion.button>
          </motion.div>

          {/* Notification & Profile */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-6">
            
            {/* 🔔 */}
            <div className="relative">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white/90 hover:text-white focus:outline-none">
                <FaBell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 
                                   rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b">
                      <h2 className="text-gray-800 font-semibold text-sm">Notifications</h2>
                    </div>
                    {loading ? (
                      <div className="p-4 text-center text-gray-600">Chargement...</div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id}
                               onClick={() => handleNotificationClick(n.id)}
                               className={`flex items-center space-x-3 p-3 border-b hover:bg-gray-100 cursor-pointer ${
                                 n.isRead ? 'bg-gray-50' : 'bg-white'
                               }`}>
                            <div className="text-xl">{getNotificationIcon(n)}</div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">{n.message}</p>
                              <span className="text-xs text-gray-500">{getTimeAgo(n.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="p-4 text-center text-gray-500">Aucune notification</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 👤 */}
            <div className="relative">
              <motion.button whileHover={{ scale: 1.05 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 focus:outline-none">
                <div className="relative">
                  <img src="http://localhost:3000/assets/s.png"
                       alt="Profile"
                       className="h-10 w-10 rounded-full object-cover ring-2 ring-white/50" />
                  <div className="absolute bottom-0 right-0 h-3 w-3 
                                  bg-green-400 rounded-full ring-2 ring-white"></div>
                </div>
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl py-1 z-50">
                    <a href="/dashboard/profile"
                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FaUserCircle className="mr-2" /> Profile
                    </a>
                    <button onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FaSignOutAlt className="mr-2" /> Déconnexion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default StudentDashboardHeader;
