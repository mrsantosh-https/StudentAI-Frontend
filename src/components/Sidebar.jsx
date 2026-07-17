import { NavLink } from "react-router-dom";
import "../styles/dashboardLayout.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h3 className="sidebar-logo">
        Student<span>AI</span>
      </h3>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard">🏠 Dashboard</NavLink>
        <NavLink to="/profile">👤 Profile</NavLink>
        <NavLink to="/ai-career-coach" className="sidebar-link">
          🤖 AI Career Coach
        </NavLink>
        <NavLink to="/resume-builder">📄 Resume Builder</NavLink>
        <NavLink to="/my-resumes">📋 My Resumes</NavLink>
        <NavLink to="/job-tracker">💼 Job Tracker</NavLink>
        <NavLink to="/job-matcher">🎯 Job Matcher</NavLink>
        <NavLink to="/cover-letter">🤖 Cover Letter</NavLink>
        <NavLink to="/interview">🎤 AI Interview</NavLink>
        <NavLink to="/interview-history">📜 Interview History</NavLink>
        <NavLink to="/career-roadmap">🗺 Career Roadmap</NavLink>
        <NavLink to="/settings">⚙️ Settings</NavLink>
      </nav>
    </aside>
  );
}