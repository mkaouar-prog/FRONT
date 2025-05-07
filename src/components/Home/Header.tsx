import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaUserCircle, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from 'hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
const {user } = useAuth();
  const isAuthenticated = localStorage.getItem('token');
  const userRole = user?.role;

  const navigationLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: 'dashboard/discover-courses' },
    ...(userRole === 'Eleve' ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
    ...(userRole === 'Enseignant' ? [{ name: 'My Courses', path: '/i/' }] : []),
    ...(userRole === 'Admin' ? [{ name: 'Dashboard', path: '/admin' }] : [])
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/dashboard/discover-courses?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`${
        isScrolled ? 'bg-white/80 backdrop-blur-md' : 'bg-white'
      } shadow-sm sticky top-0 z-50 transition-all duration-300`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <Link to="/">
  <motion.div 
    className="flex items-center cursor-pointer h-20" // Added h-20 to match parent height
    whileHover={{ scale: 1.05 }}
  >
    <img 
      src="/x.jpg" 
      alt="Logo" 
      className="h-12 w-auto my-auto" // Added my-auto for vertical centering
    />
    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ml-2">
      EduTech
    </span>
  </motion.div>
</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            {navigationLinks.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`text-gray-700 hover:text-indigo-600 font-medium transition-colors ${
                    location.pathname === item.path ? 'text-indigo-600' : ''
                  }`}
                >
                  {item.name}
                </motion.span>
              </Link>
            ))}

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <motion.div whileHover={{ scale: 1.02 }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="px-4 py-2 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-64"
                />
                <button type="submit" className=" solute right-3 top-2.5">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </button>
              </motion.div>
            </form>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Link to="dashboard/notifications">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative">
                    <FaBell className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
                 
                  </motion.div>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2"
                  >
                    <FaUserCircle className="h-8 w-8 text-gray-600" />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2"
                      >
                        <Link to="/profile">
                          <motion.div
                            whileHover={{ backgroundColor: '#F3F4F6' }}
                            className="px-4 py-2 text-gray-700 hover:text-indigo-600"
                          >
                            Profile
                          </motion.div>
                        </Link>
                        <motion.button
                          whileHover={{ backgroundColor: '#F3F4F6' }}
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:text-red-600 flex items-center"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Logout
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                  >
                    Sign in
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
                  >
                    Get started
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationLinks.map((item) => (
                  <Link 
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, x: 10 }}
                      className={`block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 ${
                        location.pathname === item.path ? 'text-indigo-600 bg-gray-50' : ''
                      }`}
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                ))}
              </div>
              
              {isAuthenticated ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    >
                      Profile
                    </motion.div>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200 space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="block w-full px-4 py-2 text-center font-medium text-indigo-600 hover:bg-gray-50 rounded-lg"
                    >
                      Sign in
                    </motion.div>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="block w-full px-4 py-2 text-center font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                      Get started
                    </motion.div>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;