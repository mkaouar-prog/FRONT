import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Home/Header";
import "./App.css";
import "./index.css";
import Home from "pages/Home/Home";
import RegisterPage from "pages/Register/Register";
import RegisterElevePage from "pages/Register/RegisterElevePage";
import RegisterEnseignantPage from "pages/Register/RegisterEnseignantPage";
import InstructorDashboard from "pages/InstructorDash/InstructorDashboard";
import Chatbot from "components/ChatBot/Chatbot";
import StudentDashboard from "pages/StudentDash/StudentDashboard";
import SubscriptionPage from "pages/Subscription/SubscriptionPage";
import LoadingPage from "./utils/LoadingPage";


import DashboardOverview from "pages/StudentDash/dash";
import CoursesPage from "pages/StudentDash/Coursepage";
import CourseDiscoveryPage from "pages/StudentDash/coursedisc";
import LoginPage from "pages/Register/LoginPage";
import DashboardContent from "components/InstructorDash/DashboardContent";
import AddCourse from "components/InstructorDash/AddCourse";
import CourseContentDashboard from "pages/StudentDash/CourseContentDashboard";
import CourseContentViewer from "pages/StudentDash/CourseContentViewer";
import CourseQuizInterface from "pages/StudentDash/CourseQuizInterface";
import PDFDocumentViewer from "pages/StudentDash/PDFDocumentViewer";
import WebContentViewer from "pages/StudentDash/WebContentViewer";
import CertificatesPage from "pages/StudentDash/CertificatesPage";
import AdminDashboard from "pages/AdminDash/AdminDashboard";
import AdminDash from "pages/AdminDash/Adash";
import UsersManagement from "pages/AdminDash/UsersManagement";
import CourseManagement from "pages/AdminDash/CourseManagement";
import AnalyticsDashboard from "pages/AdminDash/AnalyticsDashboard";
import LiveMeetingsCalendar from "components/InstructorDash/LiveMeetingsCalendar";
import StudentLiveCalendar from "pages/StudentDash/StudentLiveCalendar";
import CheckoutPage from "pages/Subscription/CheckoutPage";
import PurchaseHistoryPage from "pages/Subscription/PurchaseHistoryPage";
import StudentProfile from "pages/StudentDash/StudentProfile";
import SubscriptionApprovals from "pages/AdminDash/SubscriptionApprovals";
import RequireAuth from "hooks/RequireAuth";
import Unauthorized from "hooks/Unauthorized";
import NotificationsPage from "pages/StudentDash/NotificationsPage";



const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);
  
  return (
    <Router>
      <div className="App">
        {/* {loading && <LoadingPage />} */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="/register/student" element={<RegisterElevePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/teacher" element={<RegisterEnseignantPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route element={<RequireAuth allowedRoles={["Admin"]} />}>
          <Route path="admin/" element={<AdminDash />}>
          <Route index element={<AdminDashboard />} />
        
          <Route path="users" element={<UsersManagement />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="approvals" element={<SubscriptionApprovals />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          </Route>

        </Route>


      
        <Route element={<RequireAuth allowedRoles={["Eleve"]} />}>

          {/* ST DASH */}
          <Route path="/dashboard" element={<StudentDashboard />}>



            <Route index element={<DashboardOverview />} />
            <Route
  path="pdf/:pdfId"
  element={
    <PDFDocumentViewer
      type="document"
      content={{
        id: "8f1c79e1f0056709e4c9ed282e362530",
        title: "Example PDF Document",
        description: "This is a sample PDF document.",
        documentUrl: "https://res.cloudinary.com/dujxrr3zp/image/upload/v1744318970/rapport_2_xe2pgv.pdf",
        duration: "N/A",
        completionStatus: 0,
        courseId: "0",
        chapterId: "0",
        completed: false
      }}
    />
  }
/>






    
<Route path="notifications" element={<NotificationsPage />} />
            
            <Route path="x/:courseId" element={<CourseContentDashboard />} />

            <Route path="c" element={<CertificatesPage />} />



            <Route
              path="web/:webId"
              element={
                <WebContentViewer
                  type="webview"
                  content={{
                    id: "",
                    title: "",
                    description: "",
                    url: "",
                    duration: "N/A",
                    completionStatus: 0,
                    courseId: "0",
                    chapterId: "0",
                    completed: "false"
                  }}
                />
              }
            />

            <Route 
  path="video/:videoId" 
  element={
    <CourseContentViewer 
      type="Video"
      content={{
        id: "",
        title: "",
        description: "",
        url: "",
        duration: undefined,
        completionStatus: 0,
        courseId: "0",
        chapterId: "0",
        completed: "0"

      }} 
    />
  }
/>

           <Route
  path="quizz/:quizzId"
  element={
    <CourseQuizInterface

    />
  }
/>



          <Route path="schedule" element={<StudentLiveCalendar />} />
          <Route path="profile" element={<StudentProfile />} />


            <Route path="courses" element={<CoursesPage />} />
            <Route path="discover-courses" element={<CourseDiscoveryPage />} />
            <Route path="sub" element={<SubscriptionPage />} />
            <Route path="history" element={<PurchaseHistoryPage />} />

            <Route path="check" element={<CheckoutPage />} />
          <Route path="chatbot" element={<Chatbot />} />
          </Route>
          </Route>

          {/*  route ENSEIGNANT */}
          <Route element={<RequireAuth allowedRoles={["Enseignant"]} />}>
        <Route path="i/" element={<InstructorDashboard />}>
          <Route index element={<DashboardContent />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="live/:courseId" element={<LiveMeetingsCalendar />} />

          <Route path="chatbot" element={<Chatbot />} />
        </Route>
        </Route>
          
        </Routes>
      </div>
    </Router>
  );
};

export default App;
