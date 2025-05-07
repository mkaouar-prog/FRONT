// src/components/DashboardContent.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  order: number;
}

interface QuizQuestion {
  Text: string;
  Options: string[];
  CorrectOptionIndex: number;
}

interface Quiz {
  id: number;
  title: string;
  Questions: QuizQuestion[];
  [key: string]: any;
}

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [openChaptersDialog, setOpenChaptersDialog] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>([]);
  const [openQuizzesDialog, setOpenQuizzesDialog] = useState(false);
  const [selectedQuizzes, setSelectedQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5135/api/courses/instructor/${user.id}`);
        const data = response.data;
        if (Array.isArray(data)) {
          setCourses(data.reverse());
        } else if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses.reverse());
        } else {
          console.error('Unexpected response structure:', data);
          setCourses([]);
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const handleOpenChapters = async (courseId: number) => {
    try {
      const response = await axios.get(`http://localhost:5135/api/courses/${courseId}/chapters`);
      setSelectedChapters(response.data);
      setOpenChaptersDialog(true);
    } catch (err: any) {
      console.error('Error fetching chapters:', err.message || err);
    }
  };

  const handleOpenQuizzes = async (courseId: number) => {
    try {
      const response = await axios.get(`http://localhost:5135/api/courses/${courseId}/quizzes`);
      const quizzesData = response.data;
      const transformedQuizzes: Quiz[] = Array.isArray(quizzesData)
        ? quizzesData.map((quiz: any) => ({
            ...quiz,
            id: quiz.id || quiz.ID,
            title: quiz.title || quiz.Title,
            Questions: (quiz.questions || quiz.Questions || []).map((q: any) => ({
              Text: q.text || q.Text,
              Options: q.options || q.Options,
              CorrectOptionIndex: q.correctOptionIndex || q.CorrectOptionIndex,
            })),
          }))
        : [];
      setSelectedQuizzes(transformedQuizzes);
      setOpenQuizzesDialog(true);
    } catch (err: any) {
      console.error('Error fetching quizzes:', err.message || err);
    }
  };

  const handleCloseChapters = () => {
    setOpenChaptersDialog(false);
    setSelectedChapters([]);
  };

  const handleCloseQuizzes = () => {
    setOpenQuizzesDialog(false);
    setSelectedQuizzes([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-sm text-gray-600">Manage and monitor your educational content</p>
        </div>

        {/* Loading & Error */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                Create Course
              </button>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative pb-48">
                  <img src={course.imageUrl} alt={course.title} className="absolute h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">{course.title}</h2>
                  <p className="mt-2 text-gray-600 text-sm line-clamp-2">{course.description}</p>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => handleOpenChapters(course.id)}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-purple-600 text-sm font-medium rounded-md text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Chapters
                    </button>
                    <button
                      onClick={() => handleOpenQuizzes(course.id)}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Quizzes
                    </button>
                    <button
                      onClick={() => navigate(`live/${course.id}`)}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Schedule Live
                    </button>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chapters Dialog */}
        <Dialog open={openChaptersDialog} onClose={handleCloseChapters} fullWidth maxWidth="sm">
          <div className="bg-white rounded-t-lg px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between">
              <DialogTitle className="text-lg font-medium text-gray-900">Course Chapters</DialogTitle>
              <IconButton onClick={handleCloseChapters} className="text-gray-400 hover:text-gray-500">
                <CloseIcon />
              </IconButton>
            </div>
            <DialogContent className="mt-4">
              {selectedChapters.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No chapters available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedChapters.map((chapter, idx) => (
                    <div key={chapter.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-500 transition-colors">
                      <div className="flex items-center">
                        <span className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{chapter.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{chapter.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </div>
        </Dialog>

        {/* Quizzes Dialog */}
        <Dialog open={openQuizzesDialog} onClose={handleCloseQuizzes} fullWidth maxWidth="md">
          <div className="bg-white rounded-t-lg px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between">
              <DialogTitle className="text-lg font-medium text-gray-900">Course Quizzes</DialogTitle>
              <IconButton onClick={handleCloseQuizzes} className="text-gray-400 hover:text-gray-500">
                <CloseIcon />
              </IconButton>
            </div>
            <DialogContent className="mt-4">
              {selectedQuizzes.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No quizzes available</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {selectedQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                      <div className="mt-4 space-y-6">
                        {quiz.Questions.map((question, qIdx) => (
                          <div key={qIdx} className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900 font-medium">
                              Question {qIdx + 1}: {question.Text}
                            </p>
                            <div className="mt-3 space-y-2">
                              {question.Options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`p-3 rounded-lg ${
                                    oIdx === question.CorrectOptionIndex
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-white text-gray-700'
                                  }`}
                                >
                                  {opt}
                                  {oIdx === question.CorrectOptionIndex && <span className="ml-2 text-green-600">✓</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default DashboardContent;
