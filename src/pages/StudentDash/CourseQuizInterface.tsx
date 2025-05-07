import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaClock, 
  FaCheckCircle, 
  FaFlag,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
  quizId: number;
}

interface QuizData {
  id: number;
  title: string;
  courseId: number;
  chapterId: number | null;
  questions: Question[];
  description?: string;
  timeLimit?: number; // in minutes; if not provided, a default value will be used.
}

const CourseQuizInterface: React.FC = () => {
  const { quizzId } = useParams<{ quizzId: string }>();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Stores selected answer index for each question (keyed by question id)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  // Computed score state (percentage)
  const [score, setScore] = useState<number>(0);
  // Time used (in seconds)
  const [timeUsed, setTimeUsed] = useState<number>(0);
  // State to toggle review answers mode
  const [reviewAnswers, setReviewAnswers] = useState<boolean>(false);

  // Fetch quiz data
  useEffect(() => {
    fetch(`http://localhost:5135/api/Quizz/${quizzId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: QuizData) => {
        setQuizData(data);
        const defaultTimeLimit = data.timeLimit ? data.timeLimit : 15; // default to 15 minutes if not provided
        const totalSeconds = defaultTimeLimit * 60;
        setTimeRemaining(totalSeconds);
        setInitialTime(totalSeconds);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch quiz data');
        setLoading(false);
      });
  }, [quizzId]);

  // Timer effect: decrement timeRemaining every second.
  useEffect(() => {
    if (quizSubmitted || loading) return;
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleSubmitQuiz(); // auto-submit if time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [quizSubmitted, loading]);

  const totalQuestions = quizData ? quizData.questions.length : 0;

  const handleAnswerSelection = (questionId: number, selectedIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: selectedIndex
    }));
  };

  const toggleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Function to calculate the score and submit the quiz result
  const handleSubmitQuiz = useCallback(() => {
    if (!quizData) return;
    let correctCount = 0;
    quizData.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctOptionIndex) {
        correctCount++;
      }
    });
    const computedScore = Math.round((correctCount / totalQuestions) * 100);
    setScore(computedScore);
    const computedTimeUsed = initialTime - timeRemaining;
    setTimeUsed(computedTimeUsed);
    setQuizSubmitted(true);

    const resultDto = {
      QuizId: quizData.id,
      Score: computedScore,
      TimeTakenInSeconds: computedTimeUsed
    };

    // Get token from localStorage and add Bearer token to the header.
    const token = localStorage.getItem('token');

    fetch('http://localhost:5135/api/QuizResult', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resultDto)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to submit quiz result');
        }
        return response.json();
      })
      .then(data => {
        console.log('Quiz result submitted:', data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [quizData, selectedAnswers, totalQuestions, initialTime, timeRemaining]);

  if (loading) return <div>Loading quiz data...</div>;
  if (error) return <div>{error}</div>;
  if (!quizData) return <div>No quiz data available</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Quiz Header */}
      <div className="bg-white border-b border-gray-200  top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{quizData.title}</h1>
              {quizData.description && (
                <p className="text-sm text-gray-600">{quizData.description}</p>
              )}
            </div>
            {/* Timer */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-lg">
              <FaClock className="text-indigo-600" />
              <span className="text-indigo-600 font-medium">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-1 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      {!quizSubmitted && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            {/* Question Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-sm text-gray-500">
                  Question {currentQuestion + 1} sur {totalQuestions}
                </span>
                <h2 className="text-lg font-medium text-gray-900 mt-1">
                  {quizData.questions[currentQuestion].text}
                </h2>
              </div>
              <button
                onClick={() => toggleFlagQuestion(quizData.questions[currentQuestion].id)}
                className={`p-2 rounded-lg transition-colors ${
                  flaggedQuestions.includes(quizData.questions[currentQuestion].id)
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <FaFlag />
              </button>
            </div>
            {/* Answer Options */}
            <div className="space-y-3">
              {quizData.questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelection(quizData.questions[currentQuestion].id, index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswers[quizData.questions[currentQuestion].id] === index
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswers[quizData.questions[currentQuestion].id] === index
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswers[quizData.questions[currentQuestion].id] === index && (
                        <FaCheckCircle className="text-sm" />
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <FaChevronLeft />
                <span>Précédent</span>
              </button>

              {currentQuestion === totalQuestions - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Soumettre le Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <span>Suivant</span>
                  <FaChevronRight />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Quiz Summary Modal */}
      {quizSubmitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 overflow-y-auto max-h-full"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Résultats du Quiz</h2>
            {/* New block: Quiz Title and Timer */}
            <div className="mb-4">
              <p className="text-lg font-medium text-gray-900">Quiz: {quizData.title}</p>
              <div className="flex items-center space-x-2">
                <FaClock className="text-indigo-600" />
                <span className="text-indigo-600 font-medium">
                  {Math.floor(initialTime / 60)}:{(initialTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Score</span>
                <span className="text-2xl font-bold text-indigo-600">{score}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Temps utilisé</span>
                <span className="font-medium">
                  {Math.floor(timeUsed / 60)}:{(timeUsed % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Statut</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  {score >= 50 ? 'Réussi' : 'Échoué'}
                </span>
              </div>
            </div>
            {/* Review Answers Section */}
            {reviewAnswers ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Revue des réponses</h3>
                {quizData.questions.map((question, idx) => (
                  <div key={question.id} className="mb-4 p-4 border rounded-lg">
                    <p className="font-medium">
                      {idx + 1}. {question.text}
                    </p>
                    <ul className="mt-2">
                      {question.options.map((option, index) => {
                        const isCorrect = index === question.correctOptionIndex;
                        const isSelected = selectedAnswers[question.id] === index;
                        return (
                          <li key={index} className={`ml-4 ${isCorrect ? 'text-green-600' : ''} ${!isCorrect && isSelected ? 'text-red-600' : ''}`}>
                            {option} {isCorrect && ' (Correct)'} {isSelected && !isCorrect && ' (Votre réponse)'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                <button
                  onClick={() => setReviewAnswers(false)}
                  className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Masquer les réponses
                </button>
              </div>
            ) : (
              <button
                onClick={() => setReviewAnswers(true)}
                className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Revoir les réponses
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CourseQuizInterface;
