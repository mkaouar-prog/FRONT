// src/components/InstructorDash/CreateCourse.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useQuizGenerator } from '../../hooks/useQuizGenerator';

interface Quiz {
  Title: string;
  Questions: {
    Text: string;
    Options: string[];
    CorrectOptionIndex: number;
  }[];
}

interface ChapterContent {
  title: string;
  type: 'Video' | 'Document' | 'Link';
  url: string;
  order: number;
}

interface Chapter {
  title: string;
  description: string;
  order: number;
  contents: ChapterContent[];
  quiz?: Quiz;
}

interface CourseData {
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  isPremium: boolean;
  categorie: string;
  niveau: string;
  sousCategorie?: string;
  chapters: Chapter[];
  quiz: Quiz;
}

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    imageUrl: '',
    duration: '',
    isPremium: false,
    categorie: '',
    niveau: '',
    sousCategorie: '',
    chapters: [],
    quiz: { Title: '', Questions: [] }
  });

  // State for Cloudinary image upload
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Quiz generator hook
  const {
    quiz: generatedQuiz,
    loading: quizLoading,
    error: quizError,
    generateQuiz: generateQuizAI,
  } = useQuizGenerator();

// at top of CreateCourse.tsx
const uploadToCloudinary = async (
  file: File,
  resourceType: 'image' | 'video' | 'raw'
): Promise<string> => {
  const url = `https://api.cloudinary.com/v1_1/esps/${resourceType}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'nmx3ilvz');
  formData.append('api_key', '231595731546417');
  // tell Cloudinary what kind of asset this is:
  formData.append('resource_type', resourceType);

  const res = await fetch(url, { method: 'POST', body: formData });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Upload failed');
  return data.secure_url;
};
// inside your component, add:
const handleContentFileChange = async (
  e: ChangeEvent<HTMLInputElement>,
  chapterIdx: number,
  contentIdx: number
) => {
  const file = e.target.files?.[0];
  if (!file) return;
  // pick resource type based on content type
  const content = courseData.chapters[chapterIdx].contents[contentIdx];
  const resourceType = content.type === 'Video'
    ? 'video'
    : content.type === 'Document'
      ? 'raw'
      : 'image'; // fallback

  try {
    // you might set some loading state here per file
    const uploadedUrl = await uploadToCloudinary(file, resourceType);
    // update the URL in state
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIdx].contents[contentIdx].url = uploadedUrl;
    setCourseData(prev => ({ ...prev, chapters: updatedChapters }));
  } catch (err) {
    console.error('File upload error', err);
    alert('Upload failed');
  }
};









  const [activeChapterForQuiz, setActiveChapterForQuiz] = useState<number | null>(null);
  const [lastProcessedQuiz, setLastProcessedQuiz] = useState<string | null>(null);

  const enumMap: { [key: string]: number } = {
    Video: 0,
    Document: 1,
    Link: 2,
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      title: '',
      description: '',
      order: courseData.chapters.length,
      contents: []
    };
    setCourseData({ ...courseData, chapters: [...courseData.chapters, newChapter] });
  };

  const addContent = (chapterIndex: number) => {
    const updatedChapters = [...courseData.chapters];
    const chapter = updatedChapters[chapterIndex];
    const newContent: ChapterContent = {
      title: '',
      type: 'Video',
      url: '',
      order: chapter.contents.length
    };
    chapter.contents.push(newContent);
    setCourseData({ ...courseData, chapters: updatedChapters });
  };

  // Global quiz generation
  const handleGenerateQuiz = async () => {
    setActiveChapterForQuiz(null);
    await generateQuizAI(
      courseData.title,
      courseData.description,
      courseData.chapters.map(ch => ch.description)
    );
  };

  // Chapter-specific quiz generation
  const handleGenerateChapterQuiz = async (chapterIndex: number) => {
    setActiveChapterForQuiz(chapterIndex);
    const chapter = courseData.chapters[chapterIndex];
    await generateQuizAI(
      chapter.title,
      chapter.description,
      []
    );
  };

  useEffect(() => {
    if (!generatedQuiz) return;
    const quizString = JSON.stringify(generatedQuiz);
    if (lastProcessedQuiz === quizString) return;

    const quizData = generatedQuiz as any;
    const quizWithTitle: Quiz = {
      Title:
        quizData.Title && quizData.Title.trim() !== ''
          ? quizData.Title
          : activeChapterForQuiz !== null
            ? "Chapter Quiz"
            : "Course Quiz",
      Questions: quizData.Questions || [],
    };

    if (activeChapterForQuiz !== null) {
      const updatedChapters = [...courseData.chapters];
      updatedChapters[activeChapterForQuiz].quiz = quizWithTitle;
      setCourseData({ ...courseData, chapters: updatedChapters });
      setActiveChapterForQuiz(null);
    } else {
      setCourseData(prev => ({ ...prev, quiz: quizWithTitle }));
    }
    setLastProcessedQuiz(quizString);
  }, [generatedQuiz, activeChapterForQuiz, courseData.chapters, lastProcessedQuiz]);

  // Cloudinary image handler: update file and preview when a file is selected.
  const handleCourseImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCourseImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Cloudinary image upload function
  const uploadCourseImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!courseImageFile) return;
    setUploadingImage(true);
    try {
      // Ensure file type is acceptable
      if (
        courseImageFile.type === "image/png" ||
        courseImageFile.type === "image/jpg" ||
        courseImageFile.type === "image/jpeg"
      ) {
        const formData = new FormData();
        formData.append("file", courseImageFile);
        formData.append("cloud_name", "nmx3ilvz");
        formData.append("upload_preset", "nmx3ilvz");
        formData.append("api_key", "231595731546417");

        const response = await fetch("https://api.cloudinary.com/v1_1/esps/image/upload", {
          method: "POST",
          body: formData
        });
        const data = await response.json();
        if (data.url) {
          // Set the course image URL in the courseData state.
          setCourseData(prev => ({ ...prev, imageUrl: data.url }));
          setImagePreview(data.url);
          alert("Upload Success");
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit handler for the course form.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a course.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        Title: courseData.title,
        Description: courseData.description,
        InstructorId: user.id,
        ImageUrl: courseData.imageUrl,
        Duration: courseData.duration,
        IsPremium: courseData.isPremium,
        Categorie: courseData.categorie,
        Niveau: courseData.niveau,
        SousCategorie: courseData.sousCategorie,
        Chapters: courseData.chapters.map(chapter => ({
          Title: chapter.title,
          Description: chapter.description,
          Order: chapter.order,
          Contents: chapter.contents.map(content => ({
            Title: content.title,
            Type: enumMap[content.type],
            Url: content.url,
            Order: content.order,
          })),
          Quiz: chapter.quiz
            ? {
                Title: chapter.quiz.Title,
                Questions: chapter.quiz.Questions
              }
            : undefined,
        })),
        Quizzes: [{
          Title: courseData.quiz.Title,
          Questions: courseData.quiz.Questions
        }]
      };

      await axios.post('http://localhost:5135/api/courses', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      navigate('/i');
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below to create a new course for your students.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Information Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe your course"
                  required
                />
              </div>
              {/* Image Upload Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
  <label className="block text-lg font-semibold text-gray-800 mb-4">
    Course Image
  </label>
  
  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
    {/* Image Preview Section */}
    <div className="relative group">
      {imagePreview ? (
        <div className="relative w-48 h-32 rounded-lg overflow-hidden shadow-md">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => {/* Add function to remove image */}}
              className="text-white hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="w-48 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-1 text-sm text-gray-500">No image selected</p>
          </div>
        </div>
      )}
    </div>

    {/* Upload Controls */}
    <div className="flex-1 space-y-4">
      <div className="relative">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleCourseImageChange}
          className="hidden"
          id="course-image-input"
        />
        <label
          htmlFor="course-image-input"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Choose Image
        </label>
        <span className="ml-3 text-sm text-gray-500">PNG, JPG up to 5MB</span>
      </div>

      <button
        onClick={uploadCourseImage}
        className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 rounded-lg text-white font-medium transition-all ${
          uploadingImage 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-sm hover:shadow-md'
        }`}
        disabled={uploadingImage}
      >
        {uploadingImage ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Image
          </>
        )}
      </button>
    </div>
  </div>
</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={courseData.duration}
                  onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter duration (e.g., 3h 20m)"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={courseData.isPremium}
                  onChange={(e) => setCourseData({ ...courseData, isPremium: e.target.checked })}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Premium Course
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <input
                  type="text"
                  value={courseData.categorie}
                  onChange={(e) => setCourseData({ ...courseData, categorie: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter category (e.g., Lycée, Collège)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
                </label>
                <input
                  type="text"
                  value={courseData.niveau}
                  onChange={(e) => setCourseData({ ...courseData, niveau: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter level (e.g., Débutant, Intermédiaire, Avancé)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sous-Categorie (optional)
                </label>
                <input
                  type="text"
                  value={courseData.sousCategorie}
                  onChange={(e) => setCourseData({ ...courseData, sousCategorie: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter sub-category if applicable"
                />
              </div>
            </div>
          </div>
          {/* Chapters Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
              <button
                type="button"
                onClick={addChapter}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Chapter
              </button>
            </div>
            <div className="space-y-6">
              {courseData.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        Chapter {chapterIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedChapters = courseData.chapters.filter((_, idx) => idx !== chapterIndex);
                          setCourseData({ ...courseData, chapters: updatedChapters });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove Chapter
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Chapter Title"
                      value={chapter.title}
                      onChange={(e) => {
                        const updatedChapters = [...courseData.chapters];
                        updatedChapters[chapterIndex].title = e.target.value;
                        setCourseData({ ...courseData, chapters: updatedChapters });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <textarea
                      placeholder="Chapter Description"
                      value={chapter.description}
                      onChange={(e) => {
                        const updatedChapters = [...courseData.chapters];
                        updatedChapters[chapterIndex].description = e.target.value;
                        setCourseData({ ...courseData, chapters: updatedChapters });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                    {/* Chapter Contents */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700">Content</h4>
                        <button
                          type="button"
                          onClick={() => addContent(chapterIndex)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Add Content
                        </button>
                      </div>
                      {chapter.contents.map((content, contentIndex) => (
                        <div key={contentIndex} className="flex gap-4 items-start p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              placeholder="Content Title"
                              value={content.title}
                              onChange={(e) => {
                                const updatedChapters = [...courseData.chapters];
                                updatedChapters[chapterIndex].contents[contentIndex].title = e.target.value;
                                setCourseData({ ...courseData, chapters: updatedChapters });
                              }}
                              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              required
                            />
                           <div className="flex gap-3">
  {/* content type selector stays the same */}
  <select
    value={content.type}
    onChange={(e) => {
      const updatedChapters = [...courseData.chapters];
      updatedChapters[chapterIndex].contents[contentIndex].type = e.target
        .value as 'Video' | 'Document' | 'Link';
      // clear out old URL when type changes:
      updatedChapters[chapterIndex].contents[contentIndex].url = '';
      setCourseData({ ...courseData, chapters: updatedChapters });
    }}
    className="w-40 px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
    <option value="Video">Video</option>
    <option value="Document">Document</option>
    <option value="Link">Link</option>
  </select>

  {content.type === 'Link' ? (
  <div className="flex-1">
    <div className="relative">
      <input
        type="text"
        placeholder="Enter resource URL"
        value={content.url}
        onChange={(e) => {
          const updatedChapters = [...courseData.chapters];
          updatedChapters[chapterIndex].contents[contentIndex].url = e.target.value;
          setCourseData({ ...courseData, chapters: updatedChapters });
        }}
        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        required
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </div>
  </div>
) : (
  <div className="flex-1 space-y-4">
    <div className="relative group">
      <input
        type="file"
        accept={content.type === 'Video' ? 'video/*' : 'application/pdf'}
        onChange={(e) => handleContentFileChange(e, chapterIndex, contentIndex)}
        className="hidden"
        id={`content-file-${chapterIndex}-${contentIndex}`}
      />
      <label
        htmlFor={`content-file-${chapterIndex}-${contentIndex}`}
        className="flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors group-hover:bg-gray-50"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {content.type === 'Video' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            )}
          </svg>
          <span className="text-sm font-medium text-gray-600">
            {content.url ? 'Change file' : `Upload ${content.type}`}
          </span>
        </div>
      </label>
    </div>

    {content.url && (
      <div className="bg-gray-50 rounded-lg p-4">
        {content.type === 'Video' ? (
          <div className="relative aspect-video">
            <video
              src={content.url}
              controls
              className="absolute inset-0 w-full h-full rounded-lg shadow-sm"
            />
          </div>
        ) : (
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            <span className="font-medium">View PDF</span>
          </a>
        )}
      </div>
    )}
  </div>
)}
</div>

                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedChapters = [...courseData.chapters];
                              updatedChapters[chapterIndex].contents = updatedChapters[chapterIndex].contents.filter(
                                (_, idx) => idx !== contentIndex
                              );
                              setCourseData({ ...courseData, chapters: updatedChapters });
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Chapter Quiz Section */}
                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium text-gray-900">Chapter Quiz</h4>
                        <button
                          type="button"
                          onClick={() => handleGenerateChapterQuiz(chapterIndex)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          disabled={quizLoading && activeChapterForQuiz === chapterIndex}
                        >
                          {quizLoading && activeChapterForQuiz === chapterIndex ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            "Generate Quiz for Chapter"
                          )}
                        </button>
                      </div>
                      {chapter.quiz && (
                        <div className="mt-2">
                          <h5 className="text-md font-semibold">{chapter.quiz.Title}</h5>
                          {chapter.quiz.Questions.map((question, qIndex) => (
                            <div key={qIndex} className="mt-2">
                              <p className="text-sm">
                                {qIndex + 1}. {question.Text}
                              </p>
                              <div className="space-y-2">
                                {question.Options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`flex items-center p-2 rounded-md border ${
                                      optIndex === question.CorrectOptionIndex
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-white border-gray-200'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      checked={optIndex === question.CorrectOptionIndex}
                                      readOnly
                                      className="h-4 w-4 text-purple-600"
                                    />
                                    <span className="ml-2 text-gray-900">{option}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Global Course Quiz Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Course Quiz</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Generate a quiz automatically based on your overall course content.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateQuiz}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  quizLoading && activeChapterForQuiz === null
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
                disabled={loading || quizLoading}
              >
                {quizLoading && activeChapterForQuiz === null ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Quiz with AI
                  </>
                )}
              </button>
            </div>
            {quizError && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600">{quizError}</p>
              </div>
            )}
            {courseData.quiz?.Questions?.length > 0 && (
              <div className="space-y-6">
                <h5 className="text-md font-semibold mb-4">{courseData.quiz.Title}</h5>
                {courseData.quiz.Questions.map((question, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-lg font-medium text-gray-900 mb-4">
                      {index + 1}. {question.Text}
                    </p>
                    <div className="space-y-3">
                      {question.Options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`flex items-center p-3 rounded-lg border ${
                            optionIndex === question.CorrectOptionIndex
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={optionIndex === question.CorrectOptionIndex}
                            readOnly
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                          <span className="ml-3 text-gray-900">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Course...
                </>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
