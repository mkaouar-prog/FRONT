import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaSearchMinus,
  FaSearchPlus,
  FaDownload,
  FaBookmark,
  FaPrint,
  FaChevronLeft,
  FaChevronRight,
  FaExpandAlt,
  FaCompressAlt,
  FaHighlighter,
  FaRegComment,
  FaCheck
} from "react-icons/fa";
import { Document, Page, pdfjs } from "react-pdf";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;

interface PDFViewerContent {
  id: string;
  title: string;
  description: string;
  documentUrl: string;
  duration?: string;
  completionStatus: number;
  courseId: string;
  chapterId: string;
  completed: string | boolean; // "true"/"false" or boolean
}

interface PDFViewerProps {
  type: "Video" | "document" | "webview";
  content: PDFViewerContent;
}

const PDFDocumentViewer: React.FC<PDFViewerProps> = ({ type, content }) => {
  const location = useLocation();
  // Use content from route state if available; otherwise, use the passed-in props.
  const stateContent: any = location.state?.content;
  const finalContent: PDFViewerContent = stateContent || content;
  const { documentUrl, title } = finalContent;

  // State for completion. Initialize based on the content.completed value.
  const [completedState, setCompletedState] = useState<boolean>(
    finalContent.completed === true || finalContent.completed === "true"
  );
  const navigate = useNavigate();
  // Declare other states
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  };

  const toggleBookmark = (page: number) => {
    setBookmarks((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
  };
  const token = localStorage.getItem("token"); // Get JWT from local storage
  // Handler for marking content as complete.
  const handleMarkContentComplete = async () => {
    try {
      await axios.post(
        `http://localhost:5135/api/courses/${finalContent.courseId}/chapters/${finalContent.chapterId}/content/${finalContent.id}/complete`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      // Update the local state so the button becomes disabled.
      setCompletedState(true);
      console.log("Content marked as complete");
    } catch (error) {
      console.error("Error marking content as complete:", error);
    }
  };

  return (
    
    <div className="h-screen flex flex-col bg-gray-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        
        <div className="flex items-center justify-between">
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
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-lg transition-colors ${
                showNotes ? "bg-purple-100 text-purple-600" : "hover:bg-gray-100"
              }`}
            >
              <FaPrint />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaPrint />
            </button>
            <button
              onClick={() => {
                /* Download logic can be implemented here */
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaDownload />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isFullscreen ? <FaCompressAlt /> : <FaExpandAlt />}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaSearchMinus />
              </button>
              <span className="text-sm text-gray-600">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaSearchPlus />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                disabled={pageNumber <= 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {numPages || "--"}
              </span>
              <button
                onClick={() =>
                  setPageNumber((prev) =>
                    Math.min(numPages || prev, prev + 1)
                  )
                }
                disabled={pageNumber >= (numPages || 1)}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher dans le document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Document
              file={documentUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="shadow-xl"
            >
              {/* Force re-render on page change by assigning a unique key */}
              <Page
                key={`page_${pageNumber}`}
                pageNumber={pageNumber}
                scale={scale}
                className="bg-white"
                renderAnnotationLayer={false}
                renderTextLayer={true}
              />
            </Document>
          </div>
        </div>

        {/* Notes Sidebar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: showNotes ? 350 : 0 }}
          className="bg-white border-l border-gray-200 overflow-hidden"
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Notes - Page {pageNumber}
            </h2>
            <textarea
              value={notes[pageNumber] || ""}
              onChange={(e) =>
                setNotes((prev) => ({
                  ...prev,
                  [pageNumber]: e.target.value
                }))
              }
              placeholder="Prenez vos notes ici..."
              className="w-full h-48 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {/* Bookmarks */}
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-3">Signets</h3>
              <div className="space-y-2">
                {bookmarks.map((page) => (
                  <button
                    key={page}
                    onClick={() => setPageNumber(page)}
                    className="w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <span>Page {page}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(page);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Toolbar */}
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

export default PDFDocumentViewer;
