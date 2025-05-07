import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaDownload,
  FaBookmark,
  FaCheck,
  FaLightbulb,
} from "react-icons/fa";

interface WebContentProps {
  type: "Video" | "document" | "webview";
  content: {
    id: string;
    title: string;
    description: string;
    url: string;
    duration?: string;
    completionStatus: number;
    courseId: string;
    chapterId: string;
    completed: string; 
  };
}

const WebContentViewer: React.FC<WebContentProps> = (props) => {
  
  const location = useLocation();
  const stateContent = (location.state as any)?.content;
 
  const content = stateContent || props.content;
  const type = props.type; 

  
  const [completedState, setCompletedState] = useState<boolean>(
    content.completed === true || content.completed === "true"
  );
 
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState("");
  const token = localStorage.getItem("token"); // Get JWT from local storage
  
  const handleMarkContentComplete = async () => {
    try {
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
      setCompletedState(true); // update local state
      console.log("Content marked as complete");
    } catch (error) {
      console.error("Error marking content as complete:", error);
      
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-semibold text-gray-900">{content.title}</h1>
        <p className="text-sm text-gray-600 mt-1">{String(content.completed)}</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        <div className="flex-1 bg-gray-900">
          {type === "webview" && (
            <iframe
              src={content.url}
              className="w-full h-full"
              frameBorder="0"
              title={content.title}
            />
          )}
        </div>

        {/* Right Sidebar*/}
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
                showNotes ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100"
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

export default WebContentViewer;
