import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaPlay, 
  FaBook, 
  FaQuestionCircle, 
  FaClipboardCheck, 
  FaLock,
  FaCheck,
  FaChevronDown,
  FaChevronRight,
  FaDownload,
  FaTrophy,
  FaRegFilePdf,
  FaStar,
  FaStarHalfAlt 
} from 'react-icons/fa';
import { LuBookMinus } from "react-icons/lu";
import { FaClipboardQuestion } from "react-icons/fa6";
import { GrCertificate } from "react-icons/gr";
import axios from 'axios';

interface Quiz {
  id: number;
  title: string;
  courseId?: number;
  chapterId?: number | null;
  questions?: any[];
  isCompleted?: boolean;
}

interface ContentItem {
  id: string;
  type: string;
  url: string;
  title: string;
  duration?: string;
  completed: boolean;
  locked: boolean;
  score?: number;
  courseId: number;
  chapterId: number;                     
}

interface Chapter {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  contents: ContentItem[];
  quiz?: Quiz;
}

interface CourseProgress {
  overallProgress: number;
  chaptersCompleted: number;
  totalChapters: number;
  timeSpent: string;
  lastAccessed: string;
}

interface CourseData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  instructorId: string;
  createdAt: string;
  chapters: Chapter[];
  finalQuizzes: Quiz[];
  duration: string;
  rating: number;
  studentsCount: number;
  isPremium: boolean;
  categorie: string;
  niveau: string;
  sousCategorie: string | null;
  progress?: CourseProgress;
  overallProgress?: number;
  chaptersCompletedCount?: number;
  instructorName: string;
  hasRated?: boolean;
  enId: number;
}

const CourseContentDashboard: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
 
  const [hasRated, setHasRated] = useState<boolean>(false);
  // New state for displaying the certificate dialog
  const [showCertificateDialog, setShowCertificateDialog] = useState<boolean>(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5135/api/courses/${courseId}/progress`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        setCourseData(response.data);
       
        if (response.data.hasRated) {
          setRating(response.data.rating);
          setHasRated(true);
          
        } else {
          setRating(0);
          setHasRated(false);
         
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching course data');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, token]);


  const handleViewCertificate = async ( ) => {
    try {
      const response = await axios.get(`http://localhost:5135/api/certificate/${courseData?.enId}`, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      // Create a URL for the returned PDF blob.
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      // Open the certificate in a new tab or window.
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };



  // When courseData is updated, check if overallProgress is 100 to show the certificate dialog.
  useEffect(() => {
    if (courseData && courseData.overallProgress === 100) {
      setShowCertificateDialog(true);
    }
  }, [courseData]);

  const handleRating = (selectedRating: number) => {
    if (hasRated) {
      alert("You have already rated this course.");
      return;
    }
    axios
      .post(`http://localhost:5135/api/courses/${courseId}/rate`, { stars: selectedRating } , {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        console.log('Rating submitted successfully:', response.data);
        setRating(selectedRating);
        setHasRated(true);
      })
      .catch(error => {
        console.error('Error submitting rating:', error);
      });
  };

  // Compute the progress display values.
  const computedProgress: CourseProgress = courseData && courseData.overallProgress !== undefined
    ? {
        overallProgress: courseData.overallProgress,
        chaptersCompleted: courseData.chaptersCompletedCount || 0,
        totalChapters: courseData.chapters.length,
        timeSpent: courseData.duration,
        lastAccessed: courseData.createdAt
          ? new Date(courseData.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
      }
    : {
        overallProgress: courseData && courseData.chapters.length > 0
          ? Math.round(
              (courseData.chapters.filter(chapter => chapter.completed).length / courseData.chapters.length) * 100
            )
          : 0,
        chaptersCompleted: courseData ? courseData.chapters.filter(ch => ch.completed).length : 0,
        totalChapters: courseData ? courseData.chapters.length : 0,
        timeSpent: "0h",
        lastAccessed: courseData 
          ? new Date(courseData.createdAt).toLocaleDateString() 
          : new Date().toLocaleDateString(),
      };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "Video": return <FaPlay className="text-blue-500" />;
      case "Link": return <FaBook className="text-blue-500" />;
      case "Document": return <FaRegFilePdf className="text-blue-500" />;
      case "3": return <FaRegFilePdf className="text-purple-500" />;
      default: return null;
    }
  };

  const handleMarkContentComplete = async (chapterId: string, contentId: string) => {
    try {
      await axios.post(`http://localhost:5135/api/courses/${courseId}/chapters/${chapterId}/content/${contentId}/complete`);
      if (courseData) {
        const updatedChapters = courseData.chapters.map(chapter => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              contents: (chapter.contents || []).map(item =>
                item.id === contentId ? { ...item, completed: true } : item
              )
            };
          }
          return chapter;
        });
        setCourseData({ ...courseData, chapters: updatedChapters });
      }
    } catch (err) {
      console.error('Error marking content as complete', err);
    }
  };

  if (loading) return <p>Loading course content...</p>;
  if (error) return <p>{error}</p>;
  if (!courseData) return <p>No course data available.</p>;

  const { title, instructorName, chapters, finalQuizzes } = courseData;
  const instructor = `Enseignant: ${instructorName}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Certificate Dialog Modal */}
      {showCertificateDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-xl font-bold mb-4">Félicitations!</h3>
            <p className="mb-6">Vous avez complété le cours. Cliquez ci-dessous pour voir votre certificat.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleViewCertificate}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Voir Your Certificate
              </button>
              <button
                onClick={() => setShowCertificateDialog(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Course Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">{instructor}</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-2">Progression Globale</h3>
          <div className="text-3xl font-bold">{computedProgress.overallProgress}%</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-2">Chapitres Complétés</h3>
          <div className="text-3xl font-bold">
            {computedProgress.chaptersCompleted}/{computedProgress.totalChapters}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-2">Temps d'Étude</h3>
          <div className="text-3xl font-bold">{computedProgress.timeSpent}</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-2">Dernière Session</h3>
          <div className="text-xl font-bold">
            {computedProgress.lastAccessed}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chapters and Quizzes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chapters List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Contenu du Cours</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="divide-y divide-gray-100">
                  <motion.button
                    onClick={() => setActiveChapter(activeChapter === chapter.id ? null : chapter.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {chapter.completed ? (
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <FaCheck className="text-green-600" />
                        </div>
                      ) : chapter.locked ? (
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <FaLock className="text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <LuBookMinus className="text-blue-600" />
                        </div>
                      )}
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">{chapter.title}</h3>
                        <p className="text-sm text-gray-500">{chapter.duration}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: activeChapter === chapter.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown className="text-gray-400" />
                    </motion.div>
                  </motion.button>

                  {/* Chapter Contents & Quiz */}
                  {activeChapter === chapter.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50"
                    >
                      {(chapter.contents || []).map((item) => (
                        <motion.button
                          key={item.id}
                          onClick={() => {
                            if (item.type === "Video") {
                              const contentData = {
                                id: item.id.toString(),
                                title: item.title,
                                description: "No description available",
                                url: item.url,
                                duration: item.duration || "N/A",
                                completionStatus: item.completed ? 100 : 0,
                                courseId: courseData.id,
                                chapterId: chapter.id,
                                completed: item.completed
                              };
                              navigate(`/dashboard/video/${item.id}`, { state: { content: contentData } });
                            } else if (item.type === "Document") {
                              const contentData = {
                                id: item.id.toString(),
                                title: item.title,
                                description: "No description available",
                                documentUrl: item.url,
                                duration: item.duration || "N/A",
                                completionStatus: item.completed ? 100 : 0,
                                courseId: courseData.id,
                                chapterId: chapter.id,
                                completed: item.completed
                              };
                              navigate(`/dashboard/pdf/${item.id}`, { state: { content: contentData } });
                            } else  {
                              const contentData = {
                                id: item.id.toString(),
                                title: item.title,
                                description: "No description available",
                                url: item.url,
                                duration: item.duration || "N/A",
                                completionStatus: item.completed ? 100 : 0,
                                courseId: courseData.id,
                                chapterId: chapter.id,
                                completed: item.completed
                              };
                              navigate(`/dashboard/web/${item.id}`, { state: { content: contentData } });
                            }
                          }}
                          whileHover={{ x: 4 }}
                          className={`w-full px-8 py-3 flex items-center justify-between ${selectedContent === item.id ? 'bg-indigo-50' : ''}`}
                        >
                          <div className="flex items-center space-x-3">
                            {getContentIcon(item.type)}
                            <div className="text-left">
                              <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                              {item.duration && (
                                <p className="text-xs text-gray-500">{item.duration}</p>
                              )}
                            </div>
                          </div>
                          {item.completed ? (
                            <FaCheck className="text-green-500" />
                          ) : item.locked ? (
                            <FaLock className="text-gray-400" />
                          ) : (
                            <FaChevronRight className="text-gray-400" />
                          )}
                        </motion.button>
                      ))}
                      {chapter.quiz && (
                        <motion.button
                          disabled={chapter.quiz?.isCompleted || false}
                          onClick={() => {
                            if (chapter.quiz && !chapter.quiz.isCompleted) {
                              setSelectedContent(chapter.quiz.id.toString());
                              navigate(`/dashboard/quizz/${chapter.quiz.id.toString()}`);
                            }
                          }}
                          whileHover={{ x: 4 }}
                          className={`w-full px-8 py-3 flex items-center justify-between ${selectedContent === chapter.quiz?.id.toString() ? 'bg-indigo-50' : ''} ${chapter.quiz?.isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center space-x-3">
                            <GrCertificate className="text-red-500" />
                            <div className="text-left">
                              <h4 className="text-sm font-medium text-gray-900">{chapter.quiz.title}</h4>
                              {chapter.quiz.isCompleted && (
                                <p className="text-xs text-gray-500">Quiz terminé</p>
                              )}
                            </div>
                          </div>
                          <FaChevronRight className="text-gray-400" />
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Final Quizzes Section */}
          {finalQuizzes && finalQuizzes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Final Test</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {finalQuizzes.map((quiz) => (
                  <motion.button
                    key={quiz.id}
                    disabled={quiz.isCompleted || false}
                    onClick={() => {
                      if (!quiz.isCompleted) {
                        setSelectedContent(quiz.id.toString());
                        navigate(`/dashboard/quizz/${quiz.id.toString()}`);
                      }
                    }}
                    whileHover={{ x: 4 }}
                    className={`w-full px-8 py-3 flex items-center justify-between ${selectedContent === quiz.id.toString() ? 'bg-indigo-50' : ''} ${quiz.isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <GrCertificate className="text-red-500" />
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-gray-900">{quiz.title}</h4>
                        {quiz.isCompleted && (
                          <p className="text-xs text-gray-500">Quiz terminé</p>
                        )}
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Resources */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FaBook className="text-gray-400" />
                  <span className="text-sm font-medium">Guide du cours</span>
                </div>
                <FaDownload className="text-gray-400" />
              </button>
            </div>
          </motion.div>

          {/* Rating Section */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Rate this Course</h2>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                if (rating >= star) {
                  return (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className="focus:outline-none"
                    >
                      <FaStar className="text-yellow-500" size={20} />
                    </button>
                  );
                } else if (rating >= star - 0.5) {
                  return (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className="focus:outline-none"
                    >
                      <FaStarHalfAlt className="text-yellow-500" size={20} />
                    </button>
                  );
                } else {
                  return (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className="focus:outline-none"
                    >
                      <FaStar className="text-gray-300" size={20} />
                    </button>
                  );
                }
              })}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Réalisations</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <FaTrophy className="text-yellow-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Premier Chapitre</h3>
                  <p className="text-sm text-gray-500">Complété avec succès</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseContentDashboard;
