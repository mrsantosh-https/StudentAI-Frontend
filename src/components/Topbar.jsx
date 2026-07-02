import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import "../styles/dashboardLayout.css";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

export default function Topbar() {
  const { user } = useUser();
  const [darkMode, setDarkMode] = useState(
      localStorage.getItem("darkMode") === "true"
    );

    useEffect(() => {
      document.body.classList.toggle("dark-mode", darkMode);
      localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

  return (
    <div className="topbar">
      <div>
        <h4>Dashboard</h4>
        <p>
          Welcome back,  <strong>{user?.name || "User"}</strong> 👋
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

  <button className="notification-btn">
    🔔
    <span className="notification-badge">3</span>
  </button>

  <div className="profile-circle">
    {user?.profile_photo ? (
      <img
        src={`http://127.0.0.1:8000/storage/${user.profile_photo}`}
        alt="Profile"
      />
    ) : (
      <span>{user?.name?.charAt(0).toUpperCase() || "U"}</span>
    )}
  </div>

  <button className="upgrade-btn">Upgrade Pro</button>

  <button
  className="logout-btn"
  onClick={async () => {
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
  }}
>
  Logout
</button>
</div>
    </div>
  );
}