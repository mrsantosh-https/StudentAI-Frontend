import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaMicrophoneAlt,
  FaShieldAlt,
  FaEnvelope,
} from "react-icons/fa";

import "../styles/dashboardLayout.css";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Logged In User
  |--------------------------------------------------------------------------
  */

  const getLoggedInUser = () => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Sidebar user parse error:", error);
      return null;
    }
  };

  const user = getLoggedInUser();

  const isAdmin = user?.role === "admin";

  /*
  |--------------------------------------------------------------------------
  | Close Sidebar
  |--------------------------------------------------------------------------
  */

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Overlay */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        {/* Logo */}

        <h3 className="sidebar-logo">
          <b>
            Student<span>AI</span>
          </b>

          <img
            src="/Logo.png"
            alt="StudentAI Logo"
            className="sidebar-logo-img"
          />
        </h3>

        {/* Mobile Menu Button */}

        <button
          type="button"
          className="menu-btn"
          onClick={() =>
            setSidebarOpen(
              (previousState) => !previousState
            )
          }
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <nav className="sidebar-menu">

          {/* Dashboard */}

          <NavLink
            to="/dashboard"
            onClick={closeSidebar}
          >
            🏠 Dashboard
          </NavLink>


          {/* Admin Dashboard */}

          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              onClick={closeSidebar}
            >
              <FaShieldAlt className="me-2" />
              Admin Dashboard
            </NavLink>
          )}


          {/* Profile */}

          <NavLink
            to="/profile"
            onClick={closeSidebar}
          >
            👤 Profile
          </NavLink>


          {/* AI Career Coach */}

          <NavLink
            to="/ai-career-coach"
            className="sidebar-link"
            onClick={closeSidebar}
          >
            🤖 AI Career Coach
          </NavLink>


          {/* Resume Builder */}

          <NavLink
            to="/resume-builder"
            onClick={closeSidebar}
          >
            📄 Resume Builder
          </NavLink>


          {/* My Resumes */}

          <NavLink
            to="/my-resumes"
            onClick={closeSidebar}
          >
            📋 My Resumes
          </NavLink>


          {/* Job Tracker */}

          <NavLink
            to="/job-tracker"
            onClick={closeSidebar}
          >
            💼 Job Tracker
          </NavLink>


          {/* Job Matcher */}

          <NavLink
            to="/job-matcher"
            onClick={closeSidebar}
          >
            🎯 Job Matcher
          </NavLink>


          {/* Cover Letter */}

          <NavLink
            to="/cover-letter"
            onClick={closeSidebar}
          >
            🤖 Cover Letter
          </NavLink>


          {/* AI Interview Assistant */}

          <NavLink
            to="/interview"
            onClick={closeSidebar}
          >
            🎤 AI Interview Assistant
          </NavLink>


          {/* Interview History */}

          <NavLink
            to="/interview-history"
            onClick={closeSidebar}
          >
            📜 Interview History
          </NavLink>


          {/* AI Mock Interview */}

          <NavLink
            to="/mock-interview"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaMicrophoneAlt className="me-2" />

            <span>
              AI Mock Interview
            </span>
          </NavLink>


          {/* Mock Interview History */}

          <NavLink
            to="/mock-interview-history"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaMicrophoneAlt className="me-2" />

            <span>
              AI Mock Interview History
            </span>
          </NavLink>


          {/* Career Roadmap */}

          <NavLink
            to="/career-roadmap"
            onClick={closeSidebar}
          >
            🗺 Career Roadmap
          </NavLink>


          {/* My Subscription */}

          {/* <NavLink
            to="/my-subscription"
            className="sidebar-nav-item"
            onClick={closeSidebar}
          >
            <span className="sidebar-nav-icon">
              💳
            </span>

            <span>
              My Subscription
            </span>
          </NavLink> */}


          {/* Contact Us */}

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FaEnvelope className="me-2" />

            <span>
              Contact Us
            </span>
          </NavLink>


          {/* Settings */}

          <NavLink
            to="/settings"
            onClick={closeSidebar}
          >
            ⚙️ Settings
          </NavLink>

        </nav>
      </aside>
    </>
  );
}