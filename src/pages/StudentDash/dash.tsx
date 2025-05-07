import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaCalendarAlt, 
  FaClock, 
  FaTrophy,
  FaChartLine,
  FaBook,
  FaBell,
  FaCheckCircle
} from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const DashboardOverview: React.FC = () => {
  // State variables for dashboard stats
  const [globalProgress, setGlobalProgress] = useState<number>(0);
  const [coursesCompleted, setCoursesCompleted] = useState<number>(0);
  const [studyHours, setStudyHours] = useState<number>(0);
  const [certificates, setCertificates] = useState<number>(0);
  const [currentCourses, setCurrentCourses] = useState<any[]>([]);

  // Static data for recent activities and upcoming deadlines (update later if needed)
  const recentActivities = [
    { id: 1, type: 'course', title: 'Mathématiques Avancées', action: 'Complété le chapitre 3', time: 'Il y a 2h' },
    { id: 2, type: 'quiz', title: 'Quiz Algèbre', action: 'Obtenu 95%', time: 'Il y a 5h' },
    { id: 3, type: 'assignment', title: 'Devoir de Physique', action: 'Soumis', time: 'Hier' },
  ];

  const upcomingDeadlines = [
    { id: 1, title: 'Projet Final - Chimie', dueDate: '2024-03-20', urgency: 'high' },
    { id: 2, title: 'Quiz - Mathématiques', dueDate: '2024-03-22', urgency: 'medium' },
    { id: 3, title: 'Dissertation - Histoire', dueDate: '2024-03-25', urgency: 'low' },
  ];

  // Fetch data from the API endpoint (using the enrollments/mine endpoint as an example)
 useEffect(() => {
  const token = localStorage.getItem('token');
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5135/api/Enrollment/mine', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();

        // Sort courses by enrollmentDate in descending order (most recent access first)
        const sortedCourses = data.enrolledCourseDtos.sort((a: any, b: any) => {
          return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
        });

        setCurrentCourses(sortedCourses);
        setStudyHours(Number(data.totalStudyHours.toFixed(1)));
        setCertificates(data.totalCertificatesObtained);
        setCoursesCompleted(data.totalCoursesCompleted);

        // Compute global progress as an average of each course's progress
        if (sortedCourses && sortedCourses.length > 0) {
          const totalProgress = sortedCourses.reduce((sum: number, enrollment: any) => {
            return sum + (enrollment.course.progress || 0);
          }, 0);
          const averageProgress = totalProgress / sortedCourses.length;
          setGlobalProgress(Math.round(averageProgress));
        }
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  fetchDashboardData();
}, []);


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {/* You can insert the user name here */}👋
        </h1>
        <p className="text-gray-600 mt-2">
          Voici un aperçu de votre progression et de vos activités
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Progression Globale</p>
              <h3 className="text-3xl font-bold mt-2">{globalProgress}%</h3>
            </div>
            <FaChartLine className="text-4xl text-white/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Cours Complétés</p>
              <h3 className="text-3xl font-bold mt-2">{coursesCompleted}</h3>
            </div>
            <FaGraduationCap className="text-4xl text-white/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Heures d'Étude</p>
              <h3 className="text-3xl font-bold mt-2">{studyHours}h</h3>
            </div>
            <FaClock className="text-4xl text-white/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Certificats</p>
              <h3 className="text-3xl font-bold mt-2">{certificates}</h3>
            </div>
            <FaTrophy className="text-4xl text-white/20" />
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Courses Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FaBook className="mr-2 text-indigo-600" />
            Cours en Cours
          </h2>
          
          <div className="space-y-4">
            {currentCourses && currentCourses.length > 0 ? (
              currentCourses.map((enrollment, index) => {
                const course = enrollment.course;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{course.title}</h3>
                      <span className="text-sm text-gray-500">
                        Dernier accès: {new Date(enrollment.enrollmentDate).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        className="bg-indigo-600 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p>Aucun cours en cours</p>
            )}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FaCalendarAlt className="mr-2 text-indigo-600" />
            Échéances à Venir
          </h2>

          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <motion.div
                key={deadline.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-l-4 ${
                  deadline.urgency === 'high' 
                    ? 'border-red-500 bg-red-50'
                    : deadline.urgency === 'medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-green-500 bg-green-50'
                }`}
              >
                <h3 className="font-medium">{deadline.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Date limite: {new Date(deadline.dueDate).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FaBell className="mr-2 text-indigo-600" />
            Activités Récentes
          </h2>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievement Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FaTrophy className="mr-2 text-indigo-600" />
            Réalisations
          </h2>

          <div className="space-y-4">
            {['Or', 'Argent', 'Bronze'].map((level, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    level === 'Or' ? 'bg-yellow-100 text-yellow-600' :
                    level === 'Argent' ? 'bg-gray-100 text-gray-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <FaTrophy />
                  </div>
                  <span className="font-medium">Badge {level}</span>
                </div>
                <span className="text-sm text-gray-500">3 obtenus</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
