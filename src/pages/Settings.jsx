import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "../styles/settings.css";

export default function Settings() {
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      await api.post("/change-password", passwordData);

      toast.success("Password changed successfully");

      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });

      const modal = document.getElementById("closePasswordModal");
      modal.click();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;

        Object.values(errors).forEach((msg) => {
          toast.error(msg[0]);
        });

        return;
      }

      toast.error("Password change failed");
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Delete Account?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    toast.error("Delete account API not added yet");
  };

  const deleteAccount = async () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete your account?"
  );

  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://127.0.0.1:8000/api/delete-account", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    toast.success(data.message);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  } catch (error) {
    toast.error(error);
  }
};

  return (
    <div className="dashboard-layout">
      <Sidebar />
    <div className="dashboard-main">
          <Topbar />
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

                <button
                  className="btn btn-warning settings-btn"
                  data-bs-toggle="modal"
                  data-bs-target="#changePasswordModal"
                >
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

                <button
                  className="btn btn-danger"
                  onClick={deleteAccount}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="modal fade" id="changePasswordModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title">🔒 Change Password</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                id="closePasswordModal"
              ></button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                <input
                  type="password"
                  name="current_password"
                  className="form-control mb-3"
                  placeholder="Current Password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                />

                <input
                  type="password"
                  name="new_password"
                  className="form-control mb-3"
                  placeholder="New Password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                />

                <input
                  type="password"
                  name="new_password_confirmation"
                  className="form-control"
                  placeholder="Confirm New Password"
                  value={passwordData.new_password_confirmation}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}