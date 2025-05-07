import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaSearch, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

interface Notification {
  id: number;
  message: string;
  time: string;
  isRead: boolean;
}

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifications: Notification[] = [
    { id: 1, message: "Nouveau message d'un étudiant", time: "Il y a 5 min", isRead: false },
    { id: 2, message: "Rappel: Cours à venir", time: "Il y a 1 heure", isRead: false },
    { id: 3, message: "Mise à jour du système", time: "Il y a 2 heures", isRead: true },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <img
              src="/assets/aze.png"
              alt="Logo"
              className="h-8 w-auto mr-4"
            />
            <h1 className="text-xl font-semibold text-gray-900">
              Tableau de Bord Enseignant
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none
                ${searchFocused ? 'text-purple-500' : 'text-gray-400'}`}>
                <FaSearch className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm
                  ${searchFocused 
                    ? 'border-purple-500 ring-1 ring-purple-500' 
                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  } transition-all duration-200`}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full"
              >
                <FaBell className="h-6 w-6" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    <div className="mt-2 divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="py-3">
                          <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <img
                src='assets/p.png'
                 /* src={user?.avatar || '/default-avatar.png'}*/
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name || 'Enseignant'}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaUserCircle className="mr-3 h-5 w-5 text-gray-400" />
                    Mon Profil
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaCog className="mr-3 h-5 w-5 text-gray-400" />
                    Paramètres
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <FaSignOutAlt className="mr-3 h-5 w-5 text-red-400" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;