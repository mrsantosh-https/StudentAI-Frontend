import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/settings.css";

export default function Settings() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="settings-header">
            <h2>⚙️ Settings</h2>
            <p>Manage your StudentAI account and preferences.</p>
          </div>

          <div className="row mt-4">
            <div className="col-lg-6 mb-4">
              <div className="settings-card">
                <div className="settings-icon">👤</div>
                <h5>Account</h5>
                <p>Update your profile information and personal details.</p>

                <Link to="/profile" className="btn btn-primary settings-btn">
                  Edit Profile
                </Link>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="settings-card">
                <div className="settings-icon">🔒</div>
                <h5>Security</h5>
                <p>Change your password and manage account security.</p>

                <button className="btn btn-warning settings-btn">
                  Change Password
                </button>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="settings-card">
                <div className="settings-icon">🌙</div>
                <h5>Appearance</h5>
                <p>Switch between light and dark mode.</p>

                <button
                  className="btn btn-dark settings-btn"
                  onClick={() => {
                    const isDark = document.body.classList.toggle("dark-mode");
                    localStorage.setItem("darkMode", isDark);
                  }}
                >
                  Toggle Theme
                </button>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="settings-card">
                <div className="settings-icon">🔔</div>
                <h5>Notifications</h5>
                <p>Manage email and in-app notification preferences.</p>

                <button className="btn btn-success settings-btn">
                  Notification Settings
                </button>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="danger-card">
                <h5>🗑 Danger Zone</h5>
                <p>
                  Permanently delete your StudentAI account and all related data.
                </p>

                <button className="btn btn-danger settings-btn">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}