import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AICareerCoach from "./pages/AICareerCoach";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import MyResumes from "./pages/MyResumes";
import JobMatcher from "./pages/JobMatcher";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import JobTracker from "./pages/JobTracker";
import ViewResume from "./pages/ViewResume";
import CoverLetter from "./pages/CoverLetter";
import CareerRoadmap from "./pages/CareerRoadmap";
import ResumeBuilder from "./pages/ResumeBuilder";
import { UserProvider } from "./context/UserContext";
import InterviewHistory from "./pages/InterviewHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import MockInterview from "./pages/MockInterview";
import MockInterviewHistory from "./pages/MockInterviewHistory";
import MockInterviewResult from "./pages/MockInterviewResult";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
 const hideNavbar =
  location.pathname.startsWith("/dashboard") ||
  location.pathname.startsWith("/settings ") ||
  location.pathname.startsWith("/profile") ||
  location.pathname.startsWith("/resume-builder") ||
  location.pathname.startsWith("/my-resumes") ||
  location.pathname.startsWith("/view-resume") ||
  location.pathname.startsWith("/edit-resume") ||
  location.pathname.startsWith("/cover-letter") ||
  location.pathname.startsWith("/interview") ||
  location.pathname.startsWith("/career-roadmap") ||
  location.pathname.startsWith("/job-tracker") ||
  location.pathname.startsWith("/job-matcher") ||
  location.pathname.startsWith("/dashboard") ||
  location.pathname.startsWith("/profile") ||
  location.pathname.startsWith("/settings") ||
  location.pathname.startsWith("/ai-career-coach")||
  location.pathname.startsWith("/interview-history")||
  location.pathname.startsWith("/mock-interview");
  return (
    <BrowserRouter>
      <UserProvider>
       <div className="app">
        {!hideNavbar && <Navbar />}
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route
              path="/mock-interview"
              element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-interview-history"
            element={
              <ProtectedRoute>
                <MockInterviewHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-interview-result/:id"
            element={
              <ProtectedRoute>
                  <MockInterviewResult />
              </ProtectedRoute>
            }
          />
          
          <Route
          path="/ai-career-coach"
          element={
            <ProtectedRoute>
              <AICareerCoach />
            </ProtectedRoute>
          }
        />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-builder"
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-resumes"
            element={
              <ProtectedRoute>
                <MyResumes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cover-letter"
            element={
              <ProtectedRoute>
                <CoverLetter />
              </ProtectedRoute>
            }
          />
       
           <Route
            path="/interview/"
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/career-roadmap/"
            element={
              <ProtectedRoute>
                <CareerRoadmap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job-tracker/"
            element={
              <ProtectedRoute>
                <JobTracker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job-matcher/"
            element={
              <ProtectedRoute>
                <JobMatcher />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview-history/"
            element={
              <ProtectedRoute>
                <InterviewHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-resume/:id"
            element={
              <ProtectedRoute>
                <InterviewHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-resume/:id"
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/verify-otp"
            element={<VerifyOtp />}
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />
          
        </Routes>
      </div>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
