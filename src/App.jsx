import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import MyResumes from "./pages/MyResumes";
import JobMatcher from "./pages/JobMatcher";
import VerifyOtp from "./pages/VerifyOtp";
import JobTracker from "./pages/JobTracker";
import ResumeView from "./pages/ResumeView";
import CoverLetter from "./pages/CoverLetter";
import AdminAIUsage from "./pages/AdminAIUsage";
import CareerRoadmap from "./pages/CareerRoadmap";
import ResumeBuilder from "./pages/ResumeBuilder";
import AICareerCoach from "./pages/AICareerCoach";
import ResetPassword from "./pages/ResetPassword";
import ResumeVersions from "./pages/ResumeVersions";
import AdminAIAnalytics from "./pages/AdminAIAnalytics";
import InterviewHistory from "./pages/InterviewHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import MockInterview from "./pages/MockInterview";
import ResumeReview from "./pages/ResumeReview";
import AdminDashboard from "./pages/AdminDashboard";
import ResumeTemplates from "./pages/ResumeTemplates";
import AdminUserAnalytics from "./pages/AdminUserAnalytics";
import AdminNotifications from "./pages/AdminNotifications";
import MockInterviewHistory from "./pages/MockInterviewHistory";
import MockInterviewResult from "./pages/MockInterviewResult";
import AdminUserSubscriptions from "./pages/AdminUserSubscriptions";
import AdminSubscriptionPlans from "./pages/AdminSubscriptionPlans";

import { Toaster } from "react-hot-toast";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { UserProvider } from "./context/UserContext";

/*
|--------------------------------------------------------------------------
| App Routes Content
|--------------------------------------------------------------------------
*/

function AppContent() {
  const location = useLocation();

  /*
  |--------------------------------------------------------------------------
  | Navbar
  |--------------------------------------------------------------------------
  |
  | Navbar ONLY Login and Signup pages par show hoga.
  | Baaki sab pages par hide rahega.
  |
  */

  const showNavbar =
    location.pathname === "/login" ||
    location.pathname === "/" ||
    location.pathname === "/signup";

  return (
    <div className="app">
      {showNavbar && <Navbar />}

      <Toaster position="top-right" />

      <Routes>
        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOtp />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* =====================================================
            RESUME REVIEW
        ===================================================== */}

        <Route
          path="/resumes/:id/review"
          element={
            <ProtectedRoute>
              <ResumeReview />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RESUME TEMPLATES
        ===================================================== */}

        <Route
          path="/resume-templates/:id"
          element={
            <ProtectedRoute>
              <ResumeTemplates />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            ADMIN
        ===================================================== */}
        <Route
          path="/admin/ai-usage"
          element={<AdminAIUsage />}
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/user-analytics"
          element={
            <ProtectedRoute>
              <AdminUserAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={<AdminNotifications />}
        />
        <Route
          path="/admin/ai-analytics"
          element={
            <ProtectedRoute>
              <AdminAIAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={<AdminSubscriptionPlans />}
        />

        <Route
          path="/admin/user-subscriptions"
          element={<AdminUserSubscriptions />}
        />

        {/* =====================================================
            DASHBOARD
        ===================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            PROFILE
        ===================================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            AI CAREER COACH
        ===================================================== */}

        <Route
          path="/ai-career-coach"
          element={
            <ProtectedRoute>
              <AICareerCoach />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RESUME BUILDER
        ===================================================== */}

        <Route
          path="/resume-builder"
          element={
            <ProtectedRoute>
              <ResumeBuilder />
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

        {/* =====================================================
            MY RESUMES
        ===================================================== */}

        <Route
          path="/my-resumes"
          element={
            <ProtectedRoute>
              <MyResumes />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            VIEW RESUME
        ===================================================== */}

        <Route
          path="/view-resume/:id"
          element={
            <ProtectedRoute>
              <ResumeView />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            RESUME VERSION HISTORY
        ===================================================== */}

        <Route
          path="/resumes/:id/versions"
          element={
            <ProtectedRoute>
              <ResumeVersions />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            COVER LETTER
        ===================================================== */}

        <Route
          path="/cover-letter"
          element={
            <ProtectedRoute>
              <CoverLetter />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            INTERVIEW
        ===================================================== */}

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-history"
          element={
            <ProtectedRoute>
              <InterviewHistory />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            MOCK INTERVIEW
        ===================================================== */}

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

        {/* =====================================================
            CAREER ROADMAP
        ===================================================== */}

        <Route
          path="/career-roadmap"
          element={
            <ProtectedRoute>
              <CareerRoadmap />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            JOB TRACKER
        ===================================================== */}

        <Route
          path="/job-tracker"
          element={
            <ProtectedRoute>
              <JobTracker />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            JOB MATCHER
        ===================================================== */}

        <Route
          path="/job-matcher"
          element={
            <ProtectedRoute>
              <JobMatcher />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            SETTINGS
        ===================================================== */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Main App
|--------------------------------------------------------------------------
*/

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;