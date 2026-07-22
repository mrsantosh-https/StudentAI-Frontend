import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBell, FaCheck, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { useUser } from "../context/UserContext";
import { API_URL } from "../services/api";
import "../styles/dashboardLayout.css";

export default function Topbar() {
  const location = useLocation();
  const notificationRef = useRef(null);

  const { user } = useUser();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

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
    "/mock-interview": "AI Mock Interview",
    "/mock-interview-history": "Mock Interview History",
    "/ai-career-coach": "AI Career Coach",
  };

  const currentTitle = pageTitles[location.pathname] || "StudentAI";

  const token = localStorage.getItem("token");

  const backendUrl = API_URL.replace(/\/api\/?$/, "");

  const profileImageUrl = user?.profile_photo
    ? `${backendUrl}/storage/${user.profile_photo.replace(
        /^storage\//,
        ""
      )}`
    : null;

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      setNotificationLoading(true);

      const response = await fetch(`${API_URL}/notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch notifications"
        );
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error("Notification fetch error:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const markAsRead = async (id) => {
    const selectedNotification = notifications.find(
      (item) => item.id === id
    );

    if (!selectedNotification || selectedNotification.is_read) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notifications/read/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark notification as read"
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((item) =>
          item.id === id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );

      setUnreadCount((previousCount) =>
        Math.max(previousCount - 1, 0)
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const response = await fetch(
        `${API_URL}/notifications/read-all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark all notifications as read"
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((item) => ({
          ...item,
          is_read: true,
        }))
      );

      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const deleteNotification = async (id) => {
    const deletedNotification = notifications.find(
      (item) => item.id === id
    );

    try {
      const response = await fetch(
        `${API_URL}/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete notification"
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.filter((item) => item.id !== id)
      );

      if (
        deletedNotification &&
        !deletedNotification.is_read
      ) {
        setUnreadCount((previousCount) =>
          Math.max(previousCount - 1, 0)
        );
      }

      toast.success("Notification deleted");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
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

  const formatNotificationTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="topbar">
      <div className="topbar-title">
        <h4>{currentTitle}</h4>

        <p>
          Welcome back,{" "}
          <strong>{user?.name || "User"}</strong> 👋
        </p>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className={`theme-toggle ${
            darkMode ? "active" : ""
          }`}
          onClick={() =>
            setDarkMode((previousMode) => !previousMode)
          }
          title={
            darkMode
              ? "Enable light mode"
              : "Enable dark mode"
          }
        >
          <span>{darkMode ? "🌙" : "☀️"}</span>
        </button>

        <div
          className="notification-wrapper"
          ref={notificationRef}
        >
          <button
            type="button"
            className="notification-btn"
            onClick={() =>
              setShowNotifications(
                (previousValue) => !previousValue
              )
            }
            title="Notifications"
          >
            <FaBell />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div>
                  <h5>Notifications</h5>
                  <small>{unreadCount} unread</small>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="mark-all-btn"
                    onClick={markAllAsRead}
                  >
                    <FaCheck />
                    <span>Mark all</span>
                  </button>
                )}
              </div>

             <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notification">
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      !notification.read_at ? "unread" : ""
                    }`}
                  >
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <small>{notification.created_at}</small>

                    <button className="notification-delete">
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
            </div>
          )}
        </div>

        <Link
          to="/profile"
          className="profile-circle profile-circle-link"
          title="View Profile"
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`${user?.name || "User"} profile`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          )}
        </Link>

        <button type="button" className="upgrade-btn">
          Upgrade Pro
        </button>

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