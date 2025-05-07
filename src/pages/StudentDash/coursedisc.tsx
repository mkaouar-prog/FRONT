// src/pages/CourseDiscoveryPage.tsx

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaLock,
  FaCrown,
  FaSearch,
  FaFilter,
  FaStar,
  FaClock,
  FaUserGraduate
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from 'hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  instructor: string;
  imageUrl: string;
  duration: string;
  rating: number;
  studentsCount: number;
  isPremium: boolean;
  categorie: string;
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé';
  sousCategorie?: string;
  description: string;
}

interface SubscriptionInfo {
  plan: number;
  status: 'Pending' | 'Approved' | 'Expired' | string;
  expiresAt?: string;
  proofUrl?: string;
}

const CourseDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [courses, setCourses] = useState<Course[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = 'http://localhost:5135/api/courses';
  const SUB_URL = 'http://localhost:5135/api/subscriptions/current';

  const categories = ['Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Informatique'];
  const levels = ['Débutant', 'Intermédiaire', 'Avancé'];

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Course[]>(API_URL);
        setCourses(res.data.reverse());
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch current subscription
  useEffect(() => {
    if (!token) return;
    axios
      .get<SubscriptionInfo>(SUB_URL, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setSubscription(res.data))
      .catch(() => {
        setSubscription({ plan: 0, status: 'None' });
      });
  }, [token]);

  // any non-zero plan and Approved status means premium access
  const userHasPremium =
    subscription?.status === 'Approved' &&
    subscription.plan > 0;

  const handleEnroll = async (courseId: string) => {
    const selected = courses.find(c => c.id === courseId);
    if (!selected) return;

    // If premium course and user lacks premium, redirect to subscription page
    if (selected.isPremium && !userHasPremium) {
      navigate('/sub');
      return;
    }

    if (!user || !token) {
      alert('Vous devez être connecté pour vous inscrire.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5135/api/Enrollment',
        { courseId, eleveProfileId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Inscription réussie !');
    } catch (e) {
      console.error(e);
      alert("Une erreur est survenue lors de l'inscription.");
    }
  };

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden relative"
    >
      {course.isPremium && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-sm">
          <FaCrown className="text-yellow-200" />
          <span>Premium</span>
        </div>
      )}
      <div className="relative">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {course.isPremium && !userHasPremium && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <FaLock className="text-3xl mx-auto mb-2" />
              <p className="text-sm">Contenu Premium</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
            {course.categorie}
          </span>
          <span className="text-sm font-medium px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
            {course.niveau}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{course.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FaUserGraduate className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {course.studentsCount} étudiants
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <FaStar className="text-yellow-400" />
            <span className="font-medium">{course.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaClock className="text-gray-400" />
            <span className="text-sm text-gray-600">{course.duration}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEnroll(course.id)}
            disabled={course.isPremium && !userHasPremium}
            className={`px-4 py-2 rounded-lg font-medium ${
              course.isPremium && !userHasPremium
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {course.isPremium && !userHasPremium ? 'Débloquer' : "S'inscrire"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Découvrir des Cours</h1>
          <p className="text-gray-600 mt-2">
            Explorez notre catalogue de cours et commencez à apprendre
          </p>
        </div>
        {!userHasPremium && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="mt-4 md:mt-0 bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-xl text-white"
          >
            <div className="flex items-center space-x-2">
              <FaCrown className="text-2xl" />
              <div>
                <h3 className="font-semibold">Passez à Premium</h3>
                <p className="text-sm">Accédez à tous les cours</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg"
          >
            <FaFilter />
            <span>Filtres</span>
          </motion.button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  value={selectedLevel}
                  onChange={e => setSelectedLevel(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option value="all">Tous les niveaux</option>
                  {levels.map(lv => (
                    <option key={lv} value={lv}>
                      {lv}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <p>Chargement des cours…</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading &&
          !error &&
          courses
            .filter(course =>
              (selectedCategory === 'all' || course.categorie === selectedCategory) &&
              (selectedLevel === 'all' || course.niveau === selectedLevel) &&
              (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               course.description.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map(course => <CourseCard key={course.id} course={course} />)}
      </div>
    </div>
  );
};

export default CourseDiscoveryPage;
