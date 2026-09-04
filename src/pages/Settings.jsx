import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "../styles/settings.css";

const DEFAULT_NOTIFICATION_PREFERENCES = {
  in_app_notifications: true,
  email_notifications: true,
  support_notifications: true,
  ai_notifications: true,
  job_notifications: true,
  marketing_notifications: false,
};

export default function Settings() {
  /* =========================================
     PASSWORD
  ========================================= */

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  /* =========================================
     DARK MODE
  ========================================= */

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  /* =========================================
     DELETE ACCOUNT
  ========================================= */

  const [deletingAccount, setDeletingAccount] = useState(false);

  /* =========================================
     NOTIFICATION SETTINGS
  ========================================= */

  const [notificationPreferences, setNotificationPreferences] =
    useState(DEFAULT_NOTIFICATION_PREFERENCES);

  const [loadingNotificationSettings, setLoadingNotificationSettings] =
    useState(false);

  const [savingNotificationSettings, setSavingNotificationSettings] =
    useState(false);

  const [resettingNotificationSettings, setResettingNotificationSettings] =
    useState(false);

  /* =========================================
     DARK MODE EFFECT
  ========================================= */

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);

    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const handleToggleTheme = () => {
    setDarkMode((previousMode) => !previousMode);
  };

  /* =========================================
     PASSWORD INPUT
  ========================================= */

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  /* =========================================
     FETCH NOTIFICATION SETTINGS
  ========================================= */

  const fetchNotificationPreferences = useCallback(async () => {
    try {
      setLoadingNotificationSettings(true);

      const response = await api.get("/notification-preferences");

      if (response.data?.success && response.data?.preferences) {
        setNotificationPreferences({
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...response.data.preferences,
        });
      }
    } catch (error) {
      console.error(
        "Notification preferences error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Notification settings load nahi ho saki."
      );
    } finally {
      setLoadingNotificationSettings(false);
    }
  }, []);

  /* =========================================
     NOTIFICATION CHANGE
  ========================================= */

  const handleNotificationChange = (name) => {
    setNotificationPreferences((previousPreferences) => ({
      ...previousPreferences,
      [name]: !previousPreferences[name],
    }));
  };

  /* =========================================
     SAVE NOTIFICATION SETTINGS
  ========================================= */

  const handleSaveNotificationSettings = async () => {
    try {
      setSavingNotificationSettings(true);

      const response = await api.put(
        "/notification-preferences",
        notificationPreferences
      );

      if (response.data?.success) {
        setNotificationPreferences({
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...(response.data.preferences ||
            notificationPreferences),
        });

        toast.success(
          "Notification settings saved successfully."
        );

        const modalElement = document.getElementById(
          "notificationSettingsModal"
        );

        if (modalElement && window.bootstrap) {
          const modal =
            window.bootstrap.Modal.getInstance(
              modalElement
            );

          if (modal) {
            modal.hide();
          }
        }
      } else {
        toast.error(
          response.data?.message ||
            "Notification settings save nahi ho saki."
        );
      }
    } catch (error) {
      console.error(
        "Save notification settings error:",
        error
      );

      if (error.response?.status === 422) {
        const errors =
          error.response?.data?.errors || {};

        Object.values(errors).forEach((messages) => {
          if (Array.isArray(messages)) {
            messages.forEach((message) => {
              toast.error(message);
            });
          }
        });

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Notification settings save nahi ho saki."
      );
    } finally {
      setSavingNotificationSettings(false);
    }
  };

  /* =========================================
     RESET NOTIFICATION SETTINGS
  ========================================= */

  const handleResetNotificationSettings = async () => {
    const result = await Swal.fire({
      title: "Reset Notifications?",
      text: "All notification settings will be restored to default.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Reset",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setResettingNotificationSettings(true);

      const response = await api.post(
        "/notification-preferences/reset"
      );

      if (response.data?.success) {
        setNotificationPreferences({
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...(response.data.preferences ||
            DEFAULT_NOTIFICATION_PREFERENCES),
        });

        toast.success(
          "Notification settings reset successfully."
        );
      } else {
        toast.error(
          response.data?.message ||
            "Notification settings reset nahi ho saki."
        );
      }
    } catch (error) {
      console.error(
        "Reset notification settings error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Notification settings reset nahi ho saki."
      );
    } finally {
      setResettingNotificationSettings(false);
    }
  };

  /* =========================================
     CHANGE PASSWORD
  ========================================= */

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.new_password_confirmation
    ) {
      toast.error("Sabhi password fields fill karein.");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error(
        "New password minimum 8 characters ka hona chahiye."
      );
      return;
    }

    if (
      passwordData.new_password !==
      passwordData.new_password_confirmation
    ) {
      toast.error(
        "New password aur confirm password same hone chahiye."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.post(
        "/change-password",
        passwordData
      );

      toast.success(
        response.data?.message ||
          "Password changed successfully."
      );

      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });

      const modalElement = document.getElementById(
        "changePasswordModal"
      );

      if (modalElement && window.bootstrap) {
        const modal =
          window.bootstrap.Modal.getInstance(
            modalElement
          );

        if (modal) {
          modal.hide();
        }
      }
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      if (error.response?.status === 422) {
        const errors =
          error.response?.data?.errors || {};

        Object.values(errors).forEach((messages) => {
          if (Array.isArray(messages)) {
            messages.forEach((message) => {
              toast.error(message);
            });
          }
        });

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Password change failed."
      );
    } finally {
      setChangingPassword(false);
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
      confirmButtonText: "Yes, Delete Permanently",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingAccount(true);

      const response = await api.delete(
        "/delete-account"
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Account deletion failed."
        );
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("darkMode");

      document.body.classList.remove("dark-mode");

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
          {/* HEADER */}

          <div className="settings-header">
            <div>
              <h2 className="fw-bold mb-1">
                Settings
              </h2>

              <p className="text-muted mb-0">
                Manage your StudentAI account and
                preferences.
              </p>
            </div>
          </div>

          {/* SETTINGS CARDS */}

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
                  data-bs-toggle="modal"
                  data-bs-target="#notificationSettingsModal"
                  onClick={
                    fetchNotificationPreferences
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
              ></button>
            </div>

            <form onSubmit={handleChangePassword}>
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
                  disabled={changingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* =====================================
          NOTIFICATION SETTINGS MODAL
      ===================================== */}

      <div
        className="modal fade"
        id="notificationSettingsModal"
        tabIndex="-1"
        aria-labelledby="notificationSettingsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <div>
                <h5
                  className="modal-title"
                  id="notificationSettingsModalLabel"
                >
                  🔔 Notification Settings
                </h5>

                <small className="text-muted">
                  Control which notifications you
                  want to receive.
                </small>
              </div>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {loadingNotificationSettings ? (
                <div className="text-center py-4">
                  <div
                    className="spinner-border"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Loading...
                    </span>
                  </div>

                  <p className="text-muted mt-2 mb-0">
                    Loading notification
                    settings...
                  </p>
                </div>
              ) : (
                <div className="notification-settings-section">
                  {/* GENERAL */}

                  <h6 className="notification-section-title">
                    General
                  </h6>

                  {/* IN APP */}

                  <div className="notification-setting-row">
                    <div className="notification-setting-info">
                      <div className="notification-setting-icon">
                        🔔
                      </div>

                      <div>
                        <strong>
                          In-App Notifications
                        </strong>

                        <p>
                          Receive notifications
                          inside StudentAI.
                        </p>
                      </div>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="in_app_notifications"
                        checked={
                          notificationPreferences.in_app_notifications
                        }
                        onChange={() =>
                          handleNotificationChange(
                            "in_app_notifications"
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div className="notification-setting-row">
                    <div className="notification-setting-info">
                      <div className="notification-setting-icon">
                        📧
                      </div>

                      <div>
                        <strong>
                          Email Notifications
                        </strong>

                        <p>
                          Receive important updates
                          through email.
                        </p>
                      </div>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="email_notifications"
                        checked={
                          notificationPreferences.email_notifications
                        }
                        onChange={() =>
                          handleNotificationChange(
                            "email_notifications"
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* CATEGORIES */}

                  <h6 className="notification-section-title mt-4">
                    Notification Categories
                  </h6>

                  {/* SUPPORT */}

                  <div className="notification-setting-row">
                    <div className="notification-setting-info">
                      <div className="notification-setting-icon">
                        🎧
                      </div>

                      <div>
                        <strong>
                          Support Notifications
                        </strong>

                        <p>
                          Updates about support
                          requests and resolutions.
                        </p>
                      </div>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="support_notifications"
                        checked={
                          notificationPreferences.support_notifications
                        }
                        disabled={
                          !notificationPreferences.in_app_notifications
                        }
                        onChange={() =>
                          handleNotificationChange(
                            "support_notifications"
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* AI */}

                  <div className="notification-setting-row">
                    <div className="notification-setting-info">
                      <div className="notification-setting-icon">
                        🤖
                      </div>

                      <div>
                        <strong>
                          AI Notifications
                        </strong>

                        <p>
                          Updates from AI-powered
                          StudentAI features.
                        </p>
                      </div>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="ai_notifications"
                        checked={
                          notificationPreferences.ai_notifications
                        }
                        disabled={
                          !notificationPreferences.in_app_notifications
                        }
                        onChange={() =>
                          handleNotificationChange(
                            "ai_notifications"
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* JOB */}

                  <div className="notification-setting-row">
                    <div className="notification-setting-info">
                      <div className="notification-setting-icon">
                        💼
                      </div>

                      <div>
                        <strong>
                          Job Notifications
                        </strong>

                        <p>
                          Receive job and
                          career-related
                          notifications.
                        </p>
                      </div>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="job_notifications"
                        checked={
                          notificationPreferences.job_notifications
                        }
                        disabled={
                          !notificationPreferences.in_app_notifications
                        }
                        onChange={() =>
                          handleNotificationChange(
                            "job_notifications"
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* MARKETING */}

                  <div className="notification-setting-row">
                    <div className="notification-setting-info">
                      <div className="notification-setting-icon">
                        📢
                      </div>

                      <div>
                        <strong>
                          Marketing Notifications
                        </strong>

                        <p>
                          Receive promotional and
                          product updates.
                        </p>
                      </div>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="marketing_notifications"
                        checked={
                          notificationPreferences.marketing_notifications
                        }
                        disabled={
                          !notificationPreferences.in_app_notifications
                        }
                        onChange={() =>
                          handleNotificationChange(
                            "marketing_notifications"
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* WARNING */}

                  {!notificationPreferences.in_app_notifications && (
                    <div className="alert alert-warning mt-3 mb-0">
                      In-App Notifications disabled
                      hain, isliye category
                      notifications temporarily
                      disabled hain.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={
                  handleResetNotificationSettings
                }
                disabled={
                  loadingNotificationSettings ||
                  savingNotificationSettings ||
                  resettingNotificationSettings
                }
              >
                {resettingNotificationSettings
                  ? "Resetting..."
                  : "Reset Defaults"}
              </button>

              <button
                type="button"
                className="btn btn-success"
                onClick={
                  handleSaveNotificationSettings
                }
                disabled={
                  loadingNotificationSettings ||
                  savingNotificationSettings ||
                  resettingNotificationSettings
                }
              >
                {savingNotificationSettings
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}