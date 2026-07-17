import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import "../styles/dashboardLayout.css";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { API_URL } from "../services/api";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Topbar() {
  const location = useLocation();

const pageTitles = {
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/settings": "Settings",
  "/resume-builder": "Resume Builder",
  "/my-resumes": "My Resumes",
  "/job-tracker": "Job Tracker",
  "/ai-tools": "AI Tools",                                                              
  "/career-roadmap": "Career Roadmap",                                                              
  "/interview-history": "Interview History",                                                              
  "/cover-letter": "Cover Letter",                                                              
  "/interview": "AI Interview",                                                              
  "/job-matcher": "Job Matcher",                                                              
};

const currentTitle = pageTitles[location.pathname] || "StudentAI";
  const { user } = useUser();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/notifications/read/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const deleteNotification = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    setNotifications((prev) => prev.filter((item) => item.id !== id));

    const deletedItem = notifications.find((item) => item.id === id);
    if (deletedItem && !deletedItem.is_read) {
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    }

    toast.success("Notification deleted");
  } catch (error) {
    toast.error("Failed to delete notification");
  }
};

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logout successful");

    setTimeout(() => {
      window.location.href = "/login";
    }, 800);
  };

  return (
    <div className="topbar">
      <div>
        <h4>{currentTitle}</h4>
        <p>
          Welcome back, <strong>{user?.name || "User"}</strong> 👋
        </p>
      </div>

      <div className="topbar-actions">
        <input
          type="text"
          className="form-control topbar-search"
          placeholder="Search..."
        />

        <button
          className={`theme-toggle ${darkMode ? "active" : ""}`}
          onClick={() => setDarkMode(!darkMode)}
        >
          <span>{darkMode ? "🌙" : "☀️"}</span>
        </button>

        <div className="notification-wrapper">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔

            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h6>Notifications</h6>
                <small>{unreadCount} unread</small>
              </div>

              {notifications.length === 0 ? (
                <p className="no-notification">No notifications</p>
              ) : (
                notifications.map((item) => (
                  <div
  key={item.id}
  className={`notification-item ${!item.is_read ? "unread" : ""}`}
>
  <div onClick={() => !item.is_read && markAsRead(item.id)}>
    <strong>{item.title}</strong>
    <p>{item.message}</p>
    <small>{item.type}</small>
  </div>

  <button
    className="notification-delete"
    onClick={() => deleteNotification(item.id)}
  >
    ✕
  </button>
</div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="profile-circle">
          {user?.profile_photo ? (
            <img
              src={`${API_URL.replace("/api", "")}/storage/${user.profile_photo}`}
              alt="Profile"
            />
          ) : (
            <span>{user?.name?.charAt(0).toUpperCase() || "U"}</span>
          )}
        </div>

        <button className="upgrade-btn">Upgrade Pro</button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}