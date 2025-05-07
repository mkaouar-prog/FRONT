import React, { useState, useEffect } from 'react';
import { 
  FaBook, 
  FaSearch, 
  FaFilter,
  FaEdit,
  FaTrash,
  FaStar,
  FaUsers,
  FaPlus,
  FaEye
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  instructorId: string;
  createdAt: string;
  duration: string;
  rating: number;
  ratingCounts: number;
  studentsCount: number;
  isPremium: boolean;
  categorie: string;
  niveau: string;
  sousCategorie?: string;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Helper to sort descending by createdAt
  const sortByDateDesc = (list: Course[]) =>
    [...list].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5135/api/Admin/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data: Course[] = await response.json();
          
          // 1) initial sort newest first
          const sorted = sortByDateDesc(data);

          setCourses(sorted);
          setFilteredCourses(sorted);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Re-run filters + resort when category or search changes
  useEffect(() => {
    let subset = courses;

    // category filter
    if (selectedCategory !== 'all') {
      subset = subset.filter(c => c.categorie === selectedCategory);
    }

    // search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      subset = subset.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }

    // 2) resort before display
    setFilteredCourses(sortByDateDesc(subset));
  }, [courses, selectedCategory, searchTerm]);

  if (isLoading) {
    return <p className="p-6">Chargement des cours…</p>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Cours</h1>
          <p className="text-gray-600">Gérez tous les cours de la plateforme</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus />
          Ajouter un cours
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total des cours</p>
              <h3 className="text-2xl font-bold">{courses.length}</h3>
            </div>
            <FaBook className="text-3xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Cours Premium</p>
              <h3 className="text-2xl font-bold">
                {courses.filter(c => c.isPremium).length}
              </h3>
            </div>
            <FaStar className="text-3xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Étudiants</p>
              <h3 className="text-2xl font-bold">
                {courses.reduce((acc, curr) => acc + curr.studentsCount, 0)}
              </h3>
            </div>
            <FaUsers className="text-3xl text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Note Moyenne</p>
              <h3 className="text-2xl font-bold">
                {courses.length > 0
                  ? (
                      courses.reduce((acc, curr) => acc + curr.rating, 0) /
                      courses.length
                    ).toFixed(1)
                  : '0.0'}
              </h3>
            </div>
            <FaStar className="text-3xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'Faculté', 'Lycée', 'Collège', 'Formation'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Tous' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCourses.map(course => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.isPremium && (
                  <span className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                    Premium
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-500" />
                    <span>{course.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({course.ratingCounts})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaUsers className="text-gray-500" />
                    <span>{course.studentsCount} étudiants</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {course.categorie} - {course.niveau}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                      <FaEye />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                      <FaEdit />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CourseManagement;
