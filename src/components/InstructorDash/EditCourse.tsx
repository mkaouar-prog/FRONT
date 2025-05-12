import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useQuizGenerator } from '../../hooks/useQuizGenerator';

interface Quiz {
    title: string;
    questions: {
      text: string;
      options: string[];
      correctOptionIndex: number;
    }[];
  }
  

interface ChapterContent {
  title: string;
  type: 'Video' | 'Document' | 'Link';
  url: string;
  order: number;
}

interface Chapter {
  id?: number;
  title: string;
  description: string;
  order: number;
  contents: ChapterContent[];
  quiz?: Quiz;
}

interface CourseData {
  id?: number;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  isPremium: boolean;
  categorie: string;
  niveau: string;
  sousCategorie?: string;
  instructorId:string;
  chapters: Chapter[];
  quiz: Quiz;
}

const enumMap: { [key: string]: number } = {
  Video: 0,
  Document: 1,
  Link: 2,
};

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    instructorId:'',
    chapters: [],
    quiz: { title: '', questions: [] }
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    quiz: generatedQuiz,
    loading: quizLoading,
    error: quizError,
    generateQuiz: generateQuizAI,
  } = useQuizGenerator();
  const [activeChapterForQuiz, setActiveChapterForQuiz] = useState<number | null>(null);
  const [lastProcessedQuiz, setLastProcessedQuiz] = useState<string | null>(null);

  // Upload utility
  const uploadToCloudinary = async (
    file: File,
    resourceType: 'image' | 'video' | 'raw'
  ): Promise<string> => {
    const url = `https://api.cloudinary.com/v1_1/esps/${resourceType}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'nmx3ilvz');
    formData.append('api_key', '231595731546417');
    formData.append('resource_type', resourceType);
    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Upload failed');
    return data.secure_url;
  };



  const removeChapter = (chapterIdx: number) => {
    setCourseData(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== chapterIdx)
    }));
  };

  const removeContent = (chapterIdx: number, contentIdx: number) => {
    const chapters = [...courseData.chapters];
    chapters[chapterIdx].contents.splice(contentIdx, 1);
    setCourseData(prev => ({ ...prev, chapters }));
  };

  const removeChapterQuiz = (chapterIdx: number) => {
    const chapters = [...courseData.chapters];
    delete chapters[chapterIdx].quiz;
    setCourseData(prev => ({ ...prev, chapters }));
  };

  const removeCourseQuiz = () => {
    setCourseData(prev => ({ ...prev, quiz: { title: '', questions: [] } }));
  };
  const removeQuestion = (ci: number|null, qi: number) => {
    if(ci===null){ // course quiz
      const qq = [...courseData.quiz.questions]; qq.splice(qi,1);
      setCourseData(cd=>({ ...cd, quiz:{...cd.quiz,questions:qq}}));
    } else {
      const chapters = [...courseData.chapters];
      if(chapters[ci].quiz){ const qq=[...chapters[ci].quiz!.questions]; qq.splice(qi,1);
        chapters[ci].quiz!.questions=qq; setCourseData(cd=>({ ...cd, chapters })); }
    }
  };



  // File change for chapter content
  const handleContentFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    chapterIdx: number,
    contentIdx: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = courseData.chapters[chapterIdx].contents[contentIdx];
    const resourceType = content.type === 'Video' ? 'video' : content.type === 'Document' ? 'raw' : 'image';
    try {
      const uploadedUrl = await uploadToCloudinary(file, resourceType);
      const updated = [...courseData.chapters];
      updated[chapterIdx].contents[contentIdx].url = uploadedUrl;
      setCourseData(prev => ({ ...prev, chapters: updated }));
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  // Fetch course for editing
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<CourseData>(
          `http://localhost:5135/api/Courses/${id}/edit`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const dto = response.data as any;
        const dtoChapters = Array.isArray(dto.chapters) ? dto.chapters : [];
        const chapters: Chapter[] = dtoChapters.map((ch: any) => ({
          id: ch.id,
          title: ch.title,
          description: ch.description,
          order: ch.order,
          contents: Array.isArray(ch.contents)
            ? ch.contents.map((ct: any) => ({
                title: ct.title,
                type: ct.type,
                url: ct.url,
                order: ct.order
              }))
            : [],
            quiz: ch.quiz
            ? {
                title: ch.quiz.title,
                questions: Array.isArray(ch.quiz.questions)
                  ? ch.quiz.questions.map((q: any) => ({
                      text: q.text,
                      options: q.options,
                      correctOptionIndex: q.correctOptionIndex,
                    }))
                  : []
              }
            : undefined
          
          
        }));
        setCourseData({
          id: dto.id,
          title: dto.title,
          description: dto.description,
          imageUrl: dto.imageUrl,
          duration: dto.duration,
          isPremium: dto.isPremium,
          categorie: dto.categorie,
          niveau: dto.niveau,
          sousCategorie: dto.sousCategorie,
          instructorId: dto.instructorId,
          chapters,
          quiz: dto.quiz
  ? {
      title: dto.quiz.title,
      questions: Array.isArray(dto.quiz.questions)
        ? dto.quiz.questions.map((q: any) => ({
            text: q.text,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
          }))
        : []
    }
  : { title: '', questions: [] }

        });
        setImagePreview(dto.imageUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Handlers
  const handleCourseImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCourseImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadCourseImage = async () => {
    if (!courseImageFile) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', courseImageFile);
      formData.append('upload_preset', 'nmx3ilvz');
      formData.append('api_key', '231595731546417');
      const res = await fetch('https://api.cloudinary.com/v1_1/esps/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setCourseData(prev => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const addChapter = () => {
    setCourseData(prev => ({
      ...prev,
      chapters: [...prev.chapters, { title: '', description: '', order: prev.chapters.length, contents: [] }]
    }));
  };

  const addContent = (chapterIdx: number) => {
    const chapters = [...courseData.chapters];
    chapters[chapterIdx].contents.push({ title: '', type: 'Video', url: '', order: chapters[chapterIdx].contents.length });
    setCourseData({ ...courseData, chapters });
  };

  const handleGenerateChapterQuiz = async (chapterIdx: number) => {
    setActiveChapterForQuiz(chapterIdx);
    await generateQuizAI(
      courseData.chapters[chapterIdx].title,
      courseData.chapters[chapterIdx].description,
      []
    );
  };
  
  // (And similarly for the course-level quiz:)
  const handleGenerateQuiz = async () => {
    setActiveChapterForQuiz(null);
    await generateQuizAI(
      courseData.title,
      courseData.description,
      courseData.chapters.map(c => c.description)
    );
  };
  
  // Process AI-generated quiz
  useEffect(() => {
    if (!generatedQuiz) return;
  
    // 1) grab the raw title and questions, whether uppercase or lowercase
    const rawTitle =
      (generatedQuiz as any).title ??
      (generatedQuiz as any).Title ??
      '';
    const rawQuestions: any[] =
      Array.isArray((generatedQuiz as any).questions)
        ? (generatedQuiz as any).questions
        : Array.isArray((generatedQuiz as any).Questions)
        ? (generatedQuiz as any).Questions
        : [];
  
    // 2) map each raw question into your Quiz.Question shape
    const mappedQuestions = rawQuestions.map(q => ({
      text: q.text ?? q.Text,
      options: q.options ?? q.Options,
      correctOptionIndex:
        q.correctOptionIndex ?? q.CorrectOptionIndex ?? 0
    }));
  
    // 3) build your Quiz object
    const quizObj: Quiz = {
      title:
        rawTitle ||
        (activeChapterForQuiz !== null
          ? 'Chapter Quiz'
          : 'Course Quiz'),
      questions: mappedQuestions
    };
  
    // 4) immutably replace or insert that quiz into your state
    setCourseData(prev => {
      if (activeChapterForQuiz !== null) {
        return {
          ...prev,
          chapters: prev.chapters.map((ch, idx) =>
            idx === activeChapterForQuiz ? { ...ch, quiz: quizObj } : ch
          )
        };
      } else {
        return {
          ...prev,
          quiz: quizObj
        };
      }
    });
  
    // 5) clear the “loading” flag so your button resets
    setActiveChapterForQuiz(null);
  }, [generatedQuiz]);
  
  

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !courseData.id) return;
    setLoading(true);
    try {
      const payload = {
        Id: courseData.id,
        Title: courseData.title,
        Description: courseData.description,
        ImageUrl: courseData.imageUrl,
        Duration: courseData.duration,
        IsPremium: courseData.isPremium,
        Categorie: courseData.categorie,
        Niveau: courseData.niveau,
        SousCategorie: courseData.sousCategorie,
        InstructorId : courseData.instructorId,
        
        Chapters: courseData.chapters.map(ch => ({
          Id: ch.id,
          Title: ch.title,
          Description: ch.description,
          Order: ch.order,
          Contents: ch.contents.map(ct => ({ Title: ct.title, Type: enumMap[ct.type], Url: ct.url, Order: ct.order })),
          Quiz: ch.quiz ? { Title: ch.quiz.title, Questions: ch.quiz.questions } : undefined
        })),
        Quizzes: [{ Title: courseData.quiz.title, Questions: courseData.quiz.questions }]
      };
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5135/api/Courses/${courseData.id}`, payload, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }});
      navigate('/i');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Edit Course
            </h1>
            <p className="mt-2 text-gray-600">Update your course content and materials</p>
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save Changes</span>
          </button>
        </div>
  
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Course Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    placeholder="Enter course title"
                    value={courseData.title}
                    onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 2 hours"
                    value={courseData.duration}
                    onChange={e => setCourseData({ ...courseData, duration: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter course description"
                  value={courseData.description}
                  onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  rows={4}
                  required
                />
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Enter category"
                    value={courseData.categorie}
                    onChange={e => setCourseData({ ...courseData, categorie: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                  <input
                    type="text"
                    placeholder="Enter sub-category"
                    value={courseData.sousCategorie}
                    onChange={e => setCourseData({ ...courseData, sousCategorie: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <input
                    type="text"
                    placeholder="Enter level"
                    value={courseData.niveau}
                    onChange={e => setCourseData({ ...courseData, niveau: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
              </div>
  
              <div className="flex items-center space-x-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.isPremium}
                    onChange={e => setCourseData({ ...courseData, isPremium: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Premium Course</span>
                </label>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Image</label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCourseImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={uploadCourseImage}
                    disabled={uploadingImage}
                    className={`px-4 py-2 rounded-lg text-white ${
                      uploadingImage ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                    } transition duration-200 flex items-center space-x-2`}
                  >
                    {uploadingImage ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Upload Image</span>
                      </>
                    )}
                  </button>
                  {imagePreview && (
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden shadow-sm">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
  
          {/* Chapters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
              <button
                type="button"
                onClick={addChapter}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Chapter</span>
              </button>
            </div>
  
            <div className="p-6 space-y-6">
              {(courseData.chapters || []).map((chapter, cIdx) => (
                <div key={cIdx} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Chapter {cIdx + 1}</h3>
                    <button onClick={() => removeChapter(cIdx)} className="text-red-500">Remove Chapter</button>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Chapter Title"
                      value={chapter.title}
                      onChange={e => {
                        const chs = [...courseData.chapters];
                        chs[cIdx].title = e.target.value;
                        setCourseData({ ...courseData, chapters: chs });
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
  
                    <textarea
                      placeholder="Chapter Description"
                      value={chapter.description}
                      onChange={e => {
                        const chs = [...courseData.chapters];
                        chs[cIdx].description = e.target.value;
                        setCourseData({ ...courseData, chapters: chs });
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      required
                    />
  
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => addContent(cIdx)}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-sm hover:shadow-md transition duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Content</span>
                      </button>
  
                      <button
                        type="button"
                        onClick={() => handleGenerateChapterQuiz(cIdx)}
                        disabled={quizLoading && activeChapterForQuiz === cIdx}
                        className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-sm hover:shadow-md transition duration-200 flex items-center space-x-2 ${
                          quizLoading && activeChapterForQuiz === cIdx ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {quizLoading && activeChapterForQuiz === cIdx ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Generating Quiz...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span>Generate Quiz</span>
                          </>
                        )}
                      </button>
                    </div>
  
                    {/* Chapter Contents */}
                    <div className="space-y-4 mt-4">
                      {(chapter.contents || []).map((content, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <input
                            type="text"
                            placeholder="Content Title"
                            value={content.title}
                            onChange={e => {
                              const chs = [...courseData.chapters];
                              chs[cIdx].contents[idx].title = e.target.value;
                              setCourseData({ ...courseData, chapters: chs });
                            }}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
  
                          <select
                            value={content.type}
                            onChange={e => {
                              const chs = [...courseData.chapters];
                              chs[cIdx].contents[idx].type = e.target.value as any;
                              chs[cIdx].contents[idx].url = '';
                              setCourseData({ ...courseData, chapters: chs });
                            }}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          >
                            <option value="Video">Video</option>
                            <option value="Document">Document</option>
                            <option value="Link">Link</option>
                          </select>
  
                          {content.type === 'Link' ? (
                            <input
                              type="text"
                              placeholder="Resource URL"
                              value={content.url}
                              onChange={e => {
                                const chs = [...courseData.chapters];
                                chs[cIdx].contents[idx].url = e.target.value;
                                setCourseData({ ...courseData, chapters: chs });
                              }}
                              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              required
                            />
                          ) : (
                            <input
                              type="file"
                              accept={content.type === 'Video' ? 'video/*' : 'application/pdf'}
                              onChange={e => handleContentFileChange(e, cIdx, idx)}
                              className="flex-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                          )}
                          {content.url && content.type === 'Video' && (
                          <video controls width={120} src={content.url} className="rounded" />
                        )}
                        {content.url && content.type === 'Document' && (
                          <a href={content.url} target="_blank" rel="noreferrer" className="underline text-blue-600">
                            View Document
                          </a>
                        )}
                        <button onClick={() => removeContent(cIdx, idx)} className="text-red-500">
                          Remove Content
                        </button>
                        </div>
                      ))}
                    </div>
  



                    {(chapter.quiz?.questions?.length ?? 0) > 0 && (
  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-semibold">Chapter Quiz</h4>
      <button onClick={() => removeChapterQuiz(cIdx)} className="text-red-500">
        Remove Quiz
      </button>
    </div>
    {chapter.quiz!.questions.map((q, qi) => (
      <div key={qi} className="mt-2">
        <p className="font-semibold">{qi + 1}. {q.text}</p>
        <div className="mt-2 space-y-2">
          {q.options.map((opt, oi) => (
            <label
              key={oi}
              className={`block p-3 rounded-lg border ${
                oi === q.correctOptionIndex
                  ? 'bg-green-50 border-green-500'
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-colors duration-200`}
            >
              <input
                type="radio"
                checked={oi === q.correctOptionIndex}
                readOnly
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    ))}
  </div>
)}












                  
                  </div>
                </div>
              ))}
            </div>
          </div>
           
        </form>
      </div>
    </div>
  );
};

export default EditCourse;