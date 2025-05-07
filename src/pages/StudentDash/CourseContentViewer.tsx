import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaBookmark, FaCheck, FaLightbulb, FaChevronLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ContentViewerProps {
  type: 'Video' | 'document' | 'webview';
  content: {
    id: string;
    title: string;
    description: string;
    url: string;
    duration?: string;
    completionStatus: number;
    courseId: string;
    chapterId: string;
    completed: string; // Expected "true" or "false" (or a boolean)
  };
}

const CourseContentViewer: React.FC<ContentViewerProps> = (props) => {
  // Retrieve state from the router if available.
  const location = useLocation();
  const stateContent = (location.state as any)?.content;
  // Use stateContent if available; otherwise, fallback to props.content.
  const content = stateContent || props.content;
  const type = props.type;
const [completedState, setCompletedState] = useState<boolean>(
    content.completed === true || content.completed === "true"
  );
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState('');
  const token = localStorage.getItem('token');
  // API call to mark a specific content item as complete.
  const handleMarkContentComplete = async () => {
    try {
      const token = localStorage.getItem("token"); // Get JWT from local storage
  
      await axios.post(
        `http://localhost:5135/api/courses/${content.courseId}/chapters/${content.chapterId}/content/${content.id}/complete`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      setCompletedState(true);
      // Optionally add success handling here
      console.log("Content marked as completed.");
    } catch (error) {
      console.error("Error marking content as complete:", error);
      // Optionally display a toast or error message to the user
    }
  };
  

  // Log to see the actual value and type.
  console.log('completed:', content.completed, typeof content.completed);

  // Determine if the content is completed by checking both string and boolean.
  const isCompleted = content.completed === true;

  return (
    <div className="h-full flex flex-col">

<motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center "
            >
              <button
                onClick={() => navigate(-1)}
                className="mr-3 text-gray-600 hover:text-gray-900"
              >
                <FaChevronLeft size={20} />
              </button>
              
            </motion.div>
      {/* Content Header */}
      <div className="bg-white border-b border-gray-200 p-4">
    
        <h1 className="text-xl font-semibold text-gray-900">{content.title}</h1>
        <p className="text-sm text-gray-600 mt-1">{String(content.completed)}</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Content Viewer */}
        <div className="flex-1 bg-gray-900">
          {type === 'Video' && (
            <div className="relative h-full">
              <iframe
                src={content.url}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={content.title}
              />
            </div>
          )}
          {type === 'document' && (
            <div className="h-full bg-gray-100 p-4">
              <iframe
                src={content.url}
                className="w-full h-full rounded-lg shadow-lg"
                title={content.title}
              />
            </div>
          )}
          {type === 'webview' && (
            <iframe src={content.url} className="w-full h-full" title={content.title} />
          )}
        </div>

        {/* Right Sidebar - Notes & Resources */}
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: showNotes ? 350 : 0 }} 
          className="bg-white border-l border-gray-200 overflow-hidden"
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Prenez vos notes ici..."
              className="w-full h-48 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            {/* Resources Section */}
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-3">Resources</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaDownload />
                    <span>Télécharger le support</span>
                  </div>
                </button>
                <button className="w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaLightbulb />
                    <span>Guide d'étude</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showNotes ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaBookmark />
              <span>Notes</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
              <FaBookmark />
              <span>Marquer</span>
            </button>
          </div>

         <button
                     onClick={handleMarkContentComplete}
                     disabled={completedState}
                     className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                       completedState
                         ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                         : "bg-purple-600 text-white hover:bg-purple-700"
                     }`}
                   >
                     <FaCheck />
                     <span>Marquer comme terminé</span>
                   </button>
        </div>
      </div>
    </div>
  );
};

export default CourseContentViewer;
