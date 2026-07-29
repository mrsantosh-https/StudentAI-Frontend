import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaMicrophoneAlt } from "react-icons/fa";
import "../styles/dashboardLayout.css";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h3 className="sidebar-logo">
          Student<span>AI</span>
        </h3>

        {/* Mobile Menu Button */}
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        <nav className="sidebar-menu">
          <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
            🏠 Dashboard
          </NavLink>

          <NavLink to="/profile" onClick={() => setSidebarOpen(false)}>
            👤 Profile
          </NavLink>

          <NavLink
            to="/ai-career-coach"
            className="sidebar-link"
            onClick={() => setSidebarOpen(false)}
          >
            🤖 AI Career Coach
          </NavLink>

          <NavLink to="/resume-builder" onClick={() => setSidebarOpen(false)}>
            📄 Resume Builder
          </NavLink>

          <NavLink to="/my-resumes" onClick={() => setSidebarOpen(false)}>
            📋 My Resumes
          </NavLink>

          <NavLink to="/job-tracker" onClick={() => setSidebarOpen(false)}>
            💼 Job Tracker
          </NavLink>

          <NavLink to="/job-matcher" onClick={() => setSidebarOpen(false)}>
            🎯 Job Matcher
          </NavLink>

          <NavLink to="/cover-letter" onClick={() => setSidebarOpen(false)}>
            🤖 Cover Letter
          </NavLink>

          <NavLink to="/interview" onClick={() => setSidebarOpen(false)}>
            🎤 AI Interview Assistant
          </NavLink>

          <NavLink
            to="/interview-history"
            onClick={() => setSidebarOpen(false)}
          >
            📜 Interview History
          </NavLink>

          <NavLink
            to="/mock-interview"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <FaMicrophoneAlt className="me-2" />
            <span>AI Mock Interview</span>
          </NavLink>

          <NavLink
            to="/mock-interview-history"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <FaMicrophoneAlt className="me-2" />
            <span>AI Mock Interview History</span>
          </NavLink>

          <NavLink to="/career-roadmap" onClick={() => setSidebarOpen(false)}>
            🗺 Career Roadmap
          </NavLink>

          <NavLink to="/settings" onClick={() => setSidebarOpen(false)}>
            ⚙️ Settings
          </NavLink>
        </nav>
      </aside>
    </>
  );
}