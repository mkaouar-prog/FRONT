import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, FaSearch, FaUserCircle, FaCog, FaSignOutAlt, 
  FaUsers, FaClipboardList, FaExclamationCircle 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface AdminNotification {
  id: number;
  type: 'user' | 'course' | 'system';
  message: string;
  time: string;
  isRead: boolean;
}

const AdminDashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifications: AdminNotification[] = [
    { 
      id: 1, 
      type: 'user',
      message: "Nouvelle demande d'inscription enseignant", 
      time: "Il y a 5 min", 
      isRead: false 
    },
    { 
      id: 2, 
      type: 'course',
      message: "Nouveau cours en attente de validation", 
      time: "Il y a 1 heure", 
      isRead: false 
    },
    { 
      id: 3, 
      type: 'system',
      message: "Mise à jour système disponible", 
      time: "Il y a 2 heures", 
      isRead: true 
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'user': return <FaUsers className="text-blue-500" />;
      case 'course': return <FaClipboardList className="text-green-500" />;
      case 'system': return <FaExclamationCircle className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <img
              src="/assets/aze.png"
              alt="Logo"
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold">Administration</h1>
              <p className="text-xs text-white/80">Admin: {user?.name}</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex justify-center space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('users')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 
                rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200"
            >
              <FaUsers className="text-xl" />
              <span className="font-medium">Utilisateurs</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('courses')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 
                rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200"
            >
              <FaClipboardList className="text-xl" />
              <span className="font-medium">Cours</span>
            </motion.button>
          </motion.div>

          {/* Right Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-6"
          >
            {/* Notifications Section remains similar but with admin-specific styling */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white/90 hover:text-white focus:outline-none"
              >
                <FaBell className="h-6 w-6" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 
                    rounded-full bg-red-500 ring-2 ring-gray-900" />
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-700"
                  >
                    {/* Notifications content remains similar but with admin-specific styling */}
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

export default AdminDashboardHeader;