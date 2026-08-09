import { useEffect, useState } from "react";
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

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [deletingAccount, setDeletingAccount] =
    useState(false);

  /* =========================================
     DARK MODE
  ========================================= */

  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );

    localStorage.setItem(
      "darkMode",
      String(darkMode)
    );
  }, [darkMode]);

  const handleToggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  /* =========================================
     PASSWORD INPUT
  ========================================= */

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     CHANGE PASSWORD
  ========================================= */

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/change-password",
        passwordData
      );

      toast.success(
        response.data?.message ||
          "Password changed successfully"
      );

      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });

      const closeButton =
        document.getElementById(
          "closePasswordModal"
        );

      if (closeButton) {
        closeButton.click();
      }
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      if (error.response?.status === 422) {
        const errors =
          error.response?.data?.errors || {};

        Object.values(errors).forEach(
          (messages) => {
            if (Array.isArray(messages)) {
              messages.forEach((message) =>
                toast.error(message)
              );
            }
          }
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Password change failed"
      );
    }
  };

  /* =========================================
     DELETE ACCOUNT
  ========================================= */

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Delete Account?",
      html: `
        <p style="margin-bottom:8px;">
          Your account will be permanently deleted.
        </p>

        <p style="
          color:#dc2626;
          font-weight:600;
          margin-bottom:0;
        ">
          This action cannot be undone.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText:
        "Yes, Delete Permanently",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingAccount(true);

      /*
       * api instance already token attach karta hai
       * agar interceptor configured hai.
       */

      const response = await api.delete(
        "/delete-account"
      );

      const data = response.data;

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Account deletion failed."
        );
      }

      /*
       * Backend se successful deletion ke baad
       * hi token/user remove karenge.
       */

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      localStorage.removeItem("token");
localStorage.removeItem("user");

await Swal.fire({
  icon: "success",
  title: "Account Deleted",
  text: "Your account has been permanently deleted.",
  timer: 1800,
  timerProgressBar: true,
  showConfirmButton: false,
  allowOutsideClick: false,
  allowEscapeKey: false,
});

Swal.close();

window.location.replace("/login");
    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Account delete nahi ho saka.";

      toast.error(message);
    } finally {
      setDeletingAccount(false);
    }
  };

  /* =========================================
     JSX
  ========================================= */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content settings-page">
          {/* =================================
              HEADER
          ================================= */}

          <div className="settings-header">
            <div>
              <h2 className="fw-bold mb-1">
                ⚙️ Settings
              </h2>

              <p className="text-muted mb-0">
                Manage your StudentAI account
                and preferences.
              </p>
            </div>
          </div>

          {/* =================================
              SETTINGS CARDS
          ================================= */}

          <div className="row mt-4 g-4">
            {/* ACCOUNT */}

            <div className="col-12 col-md-6">
              <div className="settings-card h-100">
                <div className="settings-icon">
                  👤
                </div>

                <h5>Account</h5>

                <p>
                  Update your profile information
                  and personal details.
                </p>

                <Link
                  to="/profile"
                  className="btn btn-primary settings-btn"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* SECURITY */}

            <div className="col-12 col-md-6">
              <div className="settings-card h-100">
                <div className="settings-icon">
                  🔒
                </div>

                <h5>Security</h5>

                <p>
                  Change your password and manage
                  account security.
                </p>

                <button
                  type="button"
                  className="btn btn-warning settings-btn"
                  data-bs-toggle="modal"
                  data-bs-target="#changePasswordModal"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* APPEARANCE */}

            <div className="col-12 col-md-6">
              <div className="settings-card h-100">
                <div className="settings-icon">
                  {darkMode ? "☀️" : "🌙"}
                </div>

                <h5>Appearance</h5>

                <p>
                  Switch between light and dark
                  mode.
                </p>

                <button
                  type="button"
                  className="btn btn-dark settings-btn"
                  onClick={handleToggleTheme}
                >
                  {darkMode
                    ? "Enable Light Mode"
                    : "Enable Dark Mode"}
                </button>
              </div>
            </div>

            {/* NOTIFICATIONS */}

            <div className="col-12 col-md-6">
              <div className="settings-card h-100">
                <div className="settings-icon">
                  🔔
                </div>

                <h5>Notifications</h5>

                <p>
                  Manage email and in-app
                  notification preferences.
                </p>

                <button
                  type="button"
                  className="btn btn-success settings-btn"
                  onClick={() =>
                    toast(
                      "Notification settings coming soon."
                    )
                  }
                >
                  Notification Settings
                </button>
              </div>
            </div>

            {/* DANGER ZONE */}

            <div className="col-12">
              <div className="danger-card">
                <div className="danger-card-content">
                  <div>
                    <h5>
                      🗑 Danger Zone
                    </h5>

                    <p>
                      Permanently delete your
                      StudentAI account and all
                      related data.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={
                      handleDeleteAccount
                    }
                    disabled={deletingAccount}
                  >
                    {deletingAccount
                      ? "Deleting..."
                      : "Delete Account"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================
          CHANGE PASSWORD MODAL
      ===================================== */}

      <div
        className="modal fade"
        id="changePasswordModal"
        tabIndex="-1"
        aria-labelledby="changePasswordModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5
                className="modal-title"
                id="changePasswordModalLabel"
              >
                🔒 Change Password
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closePasswordModal"
              />
            </div>

            <form
              onSubmit={
                handleChangePassword
              }
            >
              <div className="modal-body">
                <label
                  htmlFor="current_password"
                  className="form-label"
                >
                  Current Password
                </label>

                <input
                  id="current_password"
                  type="password"
                  name="current_password"
                  className="form-control mb-3"
                  placeholder="Current Password"
                  value={
                    passwordData.current_password
                  }
                  onChange={
                    handlePasswordChange
                  }
                  autoComplete="current-password"
                  required
                />

                <label
                  htmlFor="new_password"
                  className="form-label"
                >
                  New Password
                </label>

                <input
                  id="new_password"
                  type="password"
                  name="new_password"
                  className="form-control mb-3"
                  placeholder="New Password"
                  value={
                    passwordData.new_password
                  }
                  onChange={
                    handlePasswordChange
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <label
                  htmlFor="new_password_confirmation"
                  className="form-label"
                >
                  Confirm New Password
                </label>

                <input
                  id="new_password_confirmation"
                  type="password"
                  name="new_password_confirmation"
                  className="form-control"
                  placeholder="Confirm New Password"
                  value={
                    passwordData.new_password_confirmation
                  }
                  onChange={
                    handlePasswordChange
                  }
                  autoComplete="new-password"
                  minLength={8}
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

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}