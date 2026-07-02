import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useUser } from "../context/UserContext";
import DashboardCard from "../components/DashboardCard";
import api from "../services/api";
const user = JSON.parse(localStorage.getItem("user"));
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "../styles/dashboardLayout.css";
import "../styles/dashboard.css";
import "../styles/dashboardCard.css";

const tools = [
  {
    icon: "📄",
    title: "Resume Builder",
    description: "Build ATS-friendly resumes with AI.",
    link: "/resume-builder",
    color: "#2563eb",
  },
  {
    icon: "✉️",
    title: "Cover Letter",
    description: "Generate professional cover letters.",
    link: "/cover-letter",
    color: "#16a34a",
  },
  {
    icon: "🎤",
    title: "Interview AI",
    description: "Practice interviews with AI feedback.",
    link: "/interview",
    color: "#9333ea",
  },
  {
    icon: "🗺️",
    title: "Career Roadmap",
    description: "Get a personalized roadmap.",
    link: "/career-roadmap",
    color: "#f97316",
  },
  {
    icon: "💼",
    title: "Job Tracker",
    description: "Track applications, interviews and offers.",
    link: "/job-tracker",
    color: "#0f172a",
  },
];

const usageData = [
  { day: "Mon", ai: 4 },
  { day: "Tue", ai: 7 },
  { day: "Wed", ai: 5 },
  { day: "Thu", ai: 10 },
  { day: "Fri", ai: 8 },
  { day: "Sat", ai: 12 },
  { day: "Sun", ai: 9 },
];

export default function Dashboard() {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState({
    total_resumes: 0,
    profile_completion: 0,
    latest_resume: null,
    total_jobs: 0,
    interview_jobs: 0,
    offer_jobs: 0,
    average_ats_score: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/dashboard/analytics");
        setAnalytics(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <h2 className="fw-bold">Welcome, {user?.name || "User"} 👋</h2>
          <p className="text-muted">
            Build resumes, prepare interviews, and grow your career with AI.
          </p>

          <div className="card border-0 shadow-sm p-4 my-4 dashboard-hero">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h3 className="fw-bold">Your AI Career Growth Hub 🚀</h3>
                <p className="mb-0">
                  Generate resumes, cover letters, interview feedback, and
                  career roadmaps using AI.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <a href="/resume-builder" className="btn btn-light">
                  Build Resume →
                </a>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm p-4 mb-4">
            <h4 className="fw-bold mb-4">🚀 Quick Actions</h4>

            <div className="row g-3">
              <div className="col-md-3">
                <a href="/resume-builder" className="btn btn-primary w-100 py-3">
                  📄 Resume Builder
                </a>
              </div>

              <div className="col-md-3">
                <a href="/cover-letter" className="btn btn-success w-100 py-3">
                  ✉️ Cover Letter
                </a>
              </div>

              <div className="col-md-3">
                <a href="/interview" className="btn btn-warning w-100 py-3">
                  🎤 AI Interview
                </a>
              </div>

              <div className="col-md-3">
                <a href="/job-tracker" className="btn btn-dark w-100 py-3">
                  💼 Job Tracker
                </a>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-4 col-md-6">
              <div className="stats-card">
                <div className="stats-icon" style={{ background: "#dbeafe" }}>
                  📄
                </div>
                <p className="text-muted mb-1">Total Resumes</p>
                <h2>{analytics.total_resumes}</h2>
                <span className="stats-trend">Saved in database</span>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="stats-card">
                <div className="stats-icon" style={{ background: "#dcfce7" }}>
                  👤
                </div>
                <p className="text-muted mb-1">Profile Completion</p>
                <h2>{analytics.profile_completion}%</h2>

                <div className="progress mt-3">
                  <div
                    className="progress-bar"
                    style={{ width: `${analytics.profile_completion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="stats-card">
                <div className="stats-icon" style={{ background: "#f3e8ff" }}>
                  📝
                </div>
                <p className="text-muted mb-1">Latest Resume</p>
                <h5 className="fw-bold">
                  {analytics.latest_resume
                    ? analytics.latest_resume.title
                    : "No Resume"}
                </h5>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="stats-card">
                <div className="stats-icon" style={{ background: "#e0f2fe" }}>
                  💼
                </div>
                <p className="text-muted mb-1">Total Jobs</p>
                <h2>{analytics.total_jobs}</h2>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stats-card">
                <div className="stats-icon" style={{ background: "#fef3c7" }}>
                  🎤
                </div>
                <p className="text-muted mb-1">Interviews</p>
                <h2>{analytics.interview_jobs}</h2>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stats-card">
                <div className="stats-icon" style={{ background: "#fee2e2" }}>
                  📊
                </div>
                <p className="text-muted mb-1">Average ATS Score</p>
                <h2>{analytics.average_ats_score}%</h2>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stats-card">
                <div className="stats-icon" style={{ background: "#dcfce7" }}>
                  🏆
                </div>
                <p className="text-muted mb-1">Offers</p>
                <h2>{analytics.offer_jobs}</h2>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-lg-8 mb-4">
              <div className="card border-0 shadow-sm p-4 analytics-card">
                <h4 className="fw-bold mb-3">📈 AI Usage Analytics</h4>

                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <LineChart data={usageData}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="ai"
                        stroke="#2563eb"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-lg-4 mb-4">
              <div className="card border-0 shadow-sm p-4 analytics-card">
                <h4 className="fw-bold mb-3">🔥 Daily Goal</h4>
                <h2>70%</h2>

                <div className="progress mt-3">
                  <div className="progress-bar" style={{ width: "70%" }}></div>
                </div>

                <p className="mt-3 text-muted">Complete one interview today.</p>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            {tools.map((tool, index) => (
              <DashboardCard key={index} {...tool} />
            ))}
          </div>

          <div className="card border-0 shadow-sm p-4 mt-4 activity-card">
            <h4 className="fw-bold mb-4">Recent Activity</h4>

            <div className="activity-item">
              <span>📄</span>
              <div>
                <h6>Resume Saved</h6>
                <p>Your latest resume is connected with backend.</p>
              </div>
            </div>

            <div className="activity-item">
              <span>💼</span>
              <div>
                <h6>Job Tracker Updated</h6>
                <p>You have {analytics.total_jobs} job applications.</p>
              </div>
            </div>

            <div className="activity-item">
              <span>📊</span>
              <div>
                <h6>ATS Score Updated</h6>
                <p>Average ATS score is {analytics.average_ats_score}%.</p>
              </div>
            </div>

            <div className="activity-item">
              <span>👤</span>
              <div>
                <h6>Profile Updated</h6>
                <p>Profile completion is {analytics.profile_completion}%.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}