import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaBook, FaClock, FaStar, FaChartLine, FaFilter } from 'react-icons/fa';
import { useAuth } from 'hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  thumbnail: string;
  duration: string;
  rating: number;
  category: string;
  lastAccessed?: string;
}

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState<'enrolled' | 'recommended'>('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  // Aggregated totals from the response
  const [totalStudyHours, setTotalStudyHours] = useState<number>(0);
  const [totalCertificatesObtained, setTotalCertificatesObtained] = useState<number>(0);
  const [totalCoursesCompleted, setTotalCoursesCompleted] = useState<number>(0);

  // Fetch courses from the backend for the logged-in user.
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await fetch('http://localhost:5135/api/Enrollment/mine', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // data is expected to be in the shape:
          // {
          //   enrolledCourseDtos: [ ... ],
          //   totalStudyHours: number,
          //   totalCertificatesObtained: number,
          //   totalCoursesCompleted: number
          // }
          const courses = data.enrolledCourseDtos.map((enrollment: any) => {
            return {
              id: enrollment.course.id.toString(),
              title: enrollment.course.title,
              instructor: enrollment.course.instructor,
              progress: enrollment.course.progress || 0,
              thumbnail: enrollment.course.thumbnail,
              duration: enrollment.course.duration,
              rating: enrollment.course.rating,
              category: enrollment.course.category,
              lastAccessed: enrollment.enrollmentDate
            };
          });
          setEnrolledCourses(courses);
          setTotalStudyHours(Number(data.totalStudyHours.toFixed(1)));
          setTotalCertificatesObtained(data.totalCertificatesObtained);
          setTotalCoursesCompleted(data.totalCoursesCompleted);
        } else {
          console.error('Failed to fetch enrollments');
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      }
    };

    if (user) {
      fetchEnrolledCourses();
    }
  }, [user, token]);

  const CourseCard: React.FC<{ course: Course; type: 'enrolled' | 'recommended' }> = ({ course, type }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {type === 'enrolled' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Progression: {course.progress}%</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-indigo-600 text-white p-2 rounded-full"
                onClick={() => navigate(`/dashboard/x/${course.id}`)}
              >
                <FaPlay className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FaClock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaStar className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">{course.rating}</span>
          </div>
        </div>

        {type === 'enrolled' && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                className="bg-indigo-600 h-2 rounded-full"
              />
            </div>
          </div>
        )}

        {type === 'recommended' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            S'inscrire au cours
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Cours</h1>
          <p className="text-gray-600 mt-2">Continuez votre apprentissage</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <FaFilter className="h-4 w-4 text-gray-500" />
          <span>Filtrer</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'enrolled'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Cours Inscrits
        </button>
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'recommended'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Recommandés
        </button>
      </div>

      {/* Progress Overview for enrolled courses */}
      {activeTab === 'enrolled' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* You can rename this card as needed. Here we use "Cours Terminés" */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-2">Cours Terminés</h3>
            <p className="text-3xl font-bold">{totalCoursesCompleted}</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-2">Temps d'apprentissage</h3>
            <p className="text-3xl font-bold">{totalStudyHours}h</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-2">Certificats Obtenus</h3>
            <p className="text-3xl font-bold">{totalCertificatesObtained}</p>
          </motion.div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'enrolled'
          ? enrolledCourses.map(course => (
              <CourseCard key={course.id} course={course} type="enrolled" />
            ))
          : recommendedCourses.map(course => (
              <CourseCard key={course.id} course={course} type="recommended" />
            ))}
      </div>
    </div>
  );
};

export default CoursesPage;
