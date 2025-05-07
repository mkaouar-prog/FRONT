// src/components/InstructorDash/DashboardSidebar.tsx
import React, { useState, useEffect } from 'react';
import { FaBook, FaPlus, FaCog, FaRobot, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { useAuth } from 'hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  id: 'dashboard' | 'addCourse' | 'settings' | 'chatbot';
  icon: IconType;
  label: string;
  count?: number;
}

const DashboardSidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<'dashboard' | 'addCourse' | 'settings' | 'chatbot'>('dashboard');
  const [courseCount, setCourseCount] = useState<number>(0);
  const { user } = useAuth();
  const instructorId = user?.id;
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch the number of courses for the instructor
  useEffect(() => {
    fetch(`http://localhost:5135/api/Courses/instructor/${instructorId}/count`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data: number) => setCourseCount(data))
      .catch((error) => console.error("Error fetching courses count:", error));
  }, [instructorId]);

  // Update active item based on the current URL
  useEffect(() => {
    if (location.pathname === '/i' || location.pathname === '/i/') {
      setActiveItem('dashboard');
    } else if (location.pathname.includes('/i/add-course')) {
      setActiveItem('addCourse');
    } else if (location.pathname.includes('/i/settings')) {
      setActiveItem('settings');
    } else if (location.pathname.includes('/i/chatbot')) {
      setActiveItem('chatbot');
    }
  }, [location.pathname]);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: FaBook, label: 'Mes Cours', count: courseCount },
    { id: 'addCourse', icon: FaPlus, label: 'Ajouter un Cours' },
    { id: 'settings', icon: FaCog, label: 'Paramètres' },
    { id: 'chatbot', icon: FaRobot, label: 'Assistant IA' },
  ];

  // Map each menu item id to its route
  const routeMapping: Record<MenuItem["id"], string> = {
    dashboard: '/i',
    addCourse: '/i/add-course',
    settings: '/i/settings',
    chatbot: '/i/chatbot',
  };

  const handleItemClick = (id: MenuItem["id"]) => {
    setActiveItem(id);
    navigate(routeMapping[id]);
  };

  return (
    <aside className="w-72 bg-white h-screen border-r border-gray-200 flex flex-col">
      {/* Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src="assets/p.png"
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-xs text-gray-500">Instructeur Principal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1 relative">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeItem === item.id ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon
                  size={20}
                  className={`${
                    activeItem === item.id ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-500'
                  } transition-colors`}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    activeItem === item.id ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.count}
                </span>
              )}
              {activeItem === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-purple-600 rounded-r-full"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Aperçu Rapide</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-500">Étudiants</div>
              <div className="text-lg font-semibold text-purple-600">1,234</div>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm text-gray-500">Cours Actifs</div>
              <div className="text-lg font-semibold text-purple-600">{courseCount}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <FaSignOutAlt size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
