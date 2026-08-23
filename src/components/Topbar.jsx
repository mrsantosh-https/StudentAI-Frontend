import { useEffect, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import { toast } from "react-hot-toast";

import { useUser } from "../context/UserContext";

import { API_URL } from "../services/api";

import Notification from "../components/Notification";

import "../styles/dashboardLayout.css";

export default function Topbar() {
  const location = useLocation();

  const navigate = useNavigate();

  const { user } = useUser();

  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem("darkMode") ===
        "true"
    );

  /*
  |--------------------------------------------------------------------------
  | Page Titles
  |--------------------------------------------------------------------------
  */

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/profile": "Profile",
    "/settings": "Settings",
    "/resume-builder": "Resume Builder",
    "/my-resumes": "My Resumes",
    "/job-tracker": "Job Tracker",
    "/ai-tools": "AI Tools",
    "/career-roadmap": "Career Roadmap",
    "/interview-history":
      "Interview History",
    "/cover-letter": "Cover Letter",
    "/interview": "AI Interview",
    "/job-matcher": "Job Matcher",
    "/mock-interview":
      "AI Mock Interview",
    "/mock-interview-history":
      "Mock Interview History",
    "/ai-career-coach":
      "AI Career Coach",
    "/my-subscription":
      "My Subscription",
    "/upgrade": "Upgrade",
    "/admin/dashboard":
      "Admin Dashboard",
    "/admin/user-analytics":
      "User Analytics",
    "/admin/ai-analytics":
      "AI Usage Analytics",
  };

  const currentTitle =
    pageTitles[location.pathname] ||
    "StudentAI";

  /*
  |--------------------------------------------------------------------------
  | Backend URL
  |--------------------------------------------------------------------------
  */

  const backendUrl =
    API_URL.replace(/\/api\/?$/, "");

  /*
  |--------------------------------------------------------------------------
  | Profile Image
  |--------------------------------------------------------------------------
  */

  const profileImageUrl =
    user?.profile_photo
      ? `${backendUrl}/storage/${user.profile_photo.replace(
          /^storage\//,
          ""
        )}`
      : null;

  /*
  |--------------------------------------------------------------------------
  | Dark Mode
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );

    localStorage.setItem(
      "darkMode",
      darkMode
    );
  }, [darkMode]);

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    const result =
      await Swal.fire({
        title: "Logout?",
        text:
          "Are you sure you want to logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText:
          "Yes, Logout",
        cancelButtonText:
          "Cancel",
        confirmButtonColor:
          "#2563eb",
        cancelButtonColor:
          "#6c757d",
      });

    if (!result.isConfirmed) {
      return;
    }

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    toast.success(
      "Logout successful"
    );

    setTimeout(() => {
      window.location.href =
        "/login";
    }, 800);
  };

  /*
  |--------------------------------------------------------------------------
  | JSX
  |--------------------------------------------------------------------------
  */

  return (
    <div className="topbar">

      {/* =====================================================
          TITLE
      ===================================================== */}

      <div className="topbar-title">

        <h4>
          {currentTitle}
        </h4>

        <p>
          Welcome back,{" "}
          <strong>
            {user?.name || "User"}
          </strong>{" "}
          👋
        </p>

      </div>

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="topbar-actions">

        {/* =================================================
            DARK MODE
        ================================================= */}

        <button
          type="button"
          className={`theme-toggle ${
            darkMode
              ? "active"
              : ""
          }`}
          onClick={() =>
            setDarkMode(
              (previousMode) =>
                !previousMode
            )
          }
          title={
            darkMode
              ? "Enable light mode"
              : "Enable dark mode"
          }
        >
          <span>
            {darkMode
              ? "🌙"
              : "☀️"}
          </span>
        </button>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Notification />

        {/* =================================================
            PROFILE
        ================================================= */}

        <Link
          to="/profile"
          className="profile-circle profile-circle-link"
          title="View Profile"
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`${
                user?.name ||
                "User"
              } profile`}
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <span>
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </span>
          )}
        </Link>

        {/* =================================================
            UPGRADE
        ================================================= */}

        <button
          type="button"
          className="upgrade-btn"
          onClick={() =>
            navigate("/upgrade")
          }
        >
          🚀 Upgrade Pro
        </button>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    </div>
  );
}