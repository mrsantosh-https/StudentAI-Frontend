import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { useCallback, useEffect, useState } from "react";

import {
  FaBell,
  FaCheck,
  FaTrash,
  FaPaperPlane,
  FaSyncAlt,
  FaUsers,
  FaEnvelope,
  FaEnvelopeOpen,
} from "react-icons/fa";

import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

import {
  getAdminNotifications,
  broadcastAdminNotification,
  markAdminNotificationAsRead,
  deleteAdminNotification,
} from "../services/admin";

import "../styles/adminDashboard.css";

const DEFAULT_STATS = {
  total: 0,
  read: 0,
  unread: 0,
  users_with_notifications: 0,
};

const PER_PAGE = 15;

export default function AdminNotifications() {
  // =========================================================
  // State
  // =========================================================

  const [notifications, setNotifications] = useState([]);

  const [stats, setStats] = useState(DEFAULT_STATS);

  const [loading, setLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState("");

  const [type, setType] = useState("");

  const [readStatus, setReadStatus] = useState("");

  const [showBroadcastForm, setShowBroadcastForm] =
    useState(false);

  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "info",
  });

  // =========================================================
  // Fetch Notifications
  // =========================================================

  const fetchNotifications = useCallback(
    async (requestedPage = 1) => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminNotifications({
          page: requestedPage,
          search: search.trim(),
          type,
          is_read: readStatus,
        });

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to fetch notifications."
          );
        }

        const pagination = response?.notifications;

        setNotifications(pagination?.data || []);

        setStats({
          ...DEFAULT_STATS,
          ...(response?.stats || {}),
        });

        setPage(
          Number(pagination?.current_page) ||
            requestedPage
        );

        setLastPage(
          Number(pagination?.last_page) || 1
        );
      } catch (err) {
        console.error(
          "Admin notifications error:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch notifications.";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [search, type, readStatus]
  );

  // =========================================================
  // Load Notifications
  //
  // Important:
  // We do not call fetchNotifications() directly inside
  // the effect.
  //
  // The async request is started inside the effect and the
  // state updates happen after the external API response.
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminNotifications({
          page: 1,
          search: search.trim(),
          type,
          is_read: readStatus,
        });

        if (cancelled) {
          return;
        }

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to fetch notifications."
          );
        }

        const pagination = response?.notifications;

        setNotifications(pagination?.data || []);

        setStats({
          ...DEFAULT_STATS,
          ...(response?.stats || {}),
        });

        setPage(
          Number(pagination?.current_page) || 1
        );

        setLastPage(
          Number(pagination?.last_page) || 1
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Admin notifications error:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch notifications.";

        setError(message);

        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [search, type, readStatus]);

  // =========================================================
  // Refresh
  // =========================================================

  const handleRefresh = () => {
    if (loading || actionLoading) {
      return;
    }

    fetchNotifications(page);
  };

  // =========================================================
  // Reset Filters
  // =========================================================

  const handleResetFilters = () => {
    setSearch("");
    setType("");
    setReadStatus("");
    setPage(1);
  };

  // =========================================================
  // Broadcast Form Change
  // =========================================================

  const handleBroadcastChange = (event) => {
    const { name, value } = event.target;

    setBroadcastForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // Broadcast Notification
  // =========================================================

  const handleBroadcast = async (event) => {
    event.preventDefault();

    const title = broadcastForm.title.trim();

    const message = broadcastForm.message.trim();

    if (!title) {
      toast.error(
        "Please enter notification title."
      );
      return;
    }

    if (!message) {
      toast.error(
        "Please enter notification message."
      );
      return;
    }

    const result = await Swal.fire({
      title: "Send notification to all users?",
      text:
        "This notification will be sent to all users.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, send",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await broadcastAdminNotification({
          title,
          message,
          type: broadcastForm.type,
        });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to send broadcast notification."
        );
      }

      toast.success(
        response?.message ||
          "Notification sent successfully."
      );

      setBroadcastForm({
        title: "",
        message: "",
        type: "info",
      });

      setShowBroadcastForm(false);

      await fetchNotifications(1);
    } catch (err) {
      console.error(
        "Broadcast notification error:",
        err
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // Mark Notification As Read
  // =========================================================

  const markAsRead = async (notificationId) => {
    if (actionLoading) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await markAdminNotificationAsRead(
          notificationId
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );

      setStats((previous) => ({
        ...previous,
        read: previous.read + 1,
        unread: Math.max(
          previous.unread - 1,
          0
        ),
      }));

      toast.success(
        response?.message ||
          "Notification marked as read."
      );
    } catch (err) {
      console.error(
        "Mark notification read error:",
        err
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to mark notification as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // Delete Notification
  // =========================================================

  const deleteNotification = async (
    notification
  ) => {
    if (actionLoading) {
      return;
    }

    const result = await Swal.fire({
      title: "Delete notification?",
      text: `Delete "${notification.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await deleteAdminNotification(
          notification.id
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to delete notification."
        );
      }

      setNotifications((previous) =>
        previous.filter(
          (item) =>
            item.id !== notification.id
        )
      );

      setStats((previous) => ({
        ...previous,

        total: Math.max(
          previous.total - 1,
          0
        ),

        read: notification.is_read
          ? Math.max(
              previous.read - 1,
              0
            )
          : previous.read,

        unread: !notification.is_read
          ? Math.max(
              previous.unread - 1,
              0
            )
          : previous.unread,
      }));

      toast.success(
        response?.message ||
          "Notification deleted."
      );
    } catch (err) {
      console.error(
        "Delete notification error:",
        err
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // Pagination
  // =========================================================

  const handlePreviousPage = () => {
    if (
      page <= 1 ||
      loading ||
      actionLoading
    ) {
      return;
    }

    fetchNotifications(page - 1);
  };

  const handleNextPage = () => {
    if (
      page >= lastPage ||
      loading ||
      actionLoading
    ) {
      return;
    }

    fetchNotifications(page + 1);
  };

  // =========================================================
  // Format Date
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // Notification Type Class
  // =========================================================

  const getTypeClass = (
    notificationType
  ) => {
    switch (notificationType) {
      case "success":
        return "success";

      case "warning":
        return "warning";

      case "error":
        return "danger";

      case "info":
      default:
        return "primary";
    }
  };

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="dashboard-layout admin-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main">

        {/* ===================================================
            TOPBAR
        =================================================== */}

        <Topbar />

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <div className="admin-dashboard-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="admin-header">

            <div className="admin-header-content">

              <h1>
                <FaBell className="me-2" />
                Notifications
              </h1>

              <p>
                Manage and send notifications to
                StudentAI users.
              </p>

            </div>

            <div className="admin-badge">
              🔔 Notifications
            </div>

          </div>

          {/* =================================================
              HEADER ACTIONS
          ================================================= */}

          <div className="d-flex justify-content-end gap-2 mb-4">

            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={handleRefresh}
              disabled={
                loading ||
                actionLoading
              }
            >
              <FaSyncAlt
                className={
                  loading
                    ? "fa-spin me-2"
                    : "me-2"
                }
              />

              Refresh
            </button>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() =>
                setShowBroadcastForm(
                  (previous) =>
                    !previous
                )
              }
              disabled={actionLoading}
            >
              <FaPaperPlane className="me-2" />

              Send Notification
            </button>

          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="admin-stats-grid">

            {/* Total */}

            <div className="admin-stat-card">

              <div className="admin-stat-info">

                <p className="admin-stat-label">
                  Total
                </p>

                <h2 className="admin-stat-number">
                  {stats.total}
                </h2>

                <span className="admin-stat-subtitle">
                  Notifications
                </span>

              </div>

              <div className="admin-stat-icon admin-icon-blue">
                <FaBell />
              </div>

            </div>

            {/* Unread */}

            <div className="admin-stat-card">

              <div className="admin-stat-info">

                <p className="admin-stat-label">
                  Unread
                </p>

                <h2 className="admin-stat-number">
                  {stats.unread}
                </h2>

                <span className="admin-stat-subtitle">
                  Unread notifications
                </span>

              </div>

              <div className="admin-stat-icon admin-icon-orange">
                <FaEnvelope />
              </div>

            </div>

            {/* Read */}

            <div className="admin-stat-card">

              <div className="admin-stat-info">

                <p className="admin-stat-label">
                  Read
                </p>

                <h2 className="admin-stat-number">
                  {stats.read}
                </h2>

                <span className="admin-stat-subtitle">
                  Read notifications
                </span>

              </div>

              <div className="admin-stat-icon admin-icon-green">
                <FaEnvelopeOpen />
              </div>

            </div>

            {/* Users */}

            <div className="admin-stat-card">

              <div className="admin-stat-info">

                <p className="admin-stat-label">
                  Users
                </p>

                <h2 className="admin-stat-number">
                  {
                    stats.users_with_notifications
                  }
                </h2>

                <span className="admin-stat-subtitle">
                  Users with notifications
                </span>

              </div>

              <div className="admin-stat-icon admin-icon-purple">
                <FaUsers />
              </div>

            </div>

          </div>

          {/* =================================================
              BROADCAST FORM
          ================================================= */}

          {showBroadcastForm && (
            <section className="admin-card mt-4">

              <div className="admin-card-header">

                <div>

                  <h3 className="admin-card-title">
                    <FaPaperPlane className="me-2" />
                    Send Notification to All Users
                  </h3>

                  <p className="admin-card-description">
                    Send a notification to every
                    StudentAI user.
                  </p>

                </div>

              </div>

              <form onSubmit={handleBroadcast}>

                <div className="row g-3">

                  {/* Title */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      placeholder="Notification title"
                      value={
                        broadcastForm.title
                      }
                      onChange={
                        handleBroadcastChange
                      }
                      maxLength={255}
                      disabled={actionLoading}
                    />

                  </div>

                  {/* Type */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      Type
                    </label>

                    <select
                      name="type"
                      className="form-select"
                      value={
                        broadcastForm.type
                      }
                      onChange={
                        handleBroadcastChange
                      }
                      disabled={actionLoading}
                    >

                      <option value="info">
                        Info
                      </option>

                      <option value="success">
                        Success
                      </option>

                      <option value="warning">
                        Warning
                      </option>

                      <option value="error">
                        Error
                      </option>

                    </select>

                  </div>

                  {/* Message */}

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      Message
                    </label>

                    <textarea
                      name="message"
                      className="form-control"
                      rows="4"
                      placeholder="Write notification message..."
                      value={
                        broadcastForm.message
                      }
                      onChange={
                        handleBroadcastChange
                      }
                      disabled={actionLoading}
                    />

                  </div>

                  {/* Buttons */}

                  <div className="col-12 d-flex gap-2">

                    <button
                      type="submit"
                      className="admin-btn admin-btn-primary"
                      disabled={actionLoading}
                    >

                      <FaPaperPlane className="me-2" />

                      {actionLoading
                        ? "Sending..."
                        : "Send to All Users"}

                    </button>

                    <button
                      type="button"
                      className="admin-btn admin-btn-outline"
                      onClick={() =>
                        setShowBroadcastForm(
                          false
                        )
                      }
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              </form>

            </section>
          )}

          {/* =================================================
              FILTERS
          ================================================= */}

          <section className="admin-card mt-4">

            <div className="admin-card-header">

              <div>

                <h3 className="admin-card-title">
                  Notification Filters
                </h3>

                <p className="admin-card-description">
                  Search and filter notifications.
                </p>

              </div>

            </div>

            <div className="row g-3">

              {/* Search */}

              <div className="col-md-5">

                <label className="form-label fw-semibold">
                  Search
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search title, message, user..."
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value
                    );
                    setPage(1);
                  }}
                />

              </div>

              {/* Type */}

              <div className="col-md-3">

                <label className="form-label fw-semibold">
                  Type
                </label>

                <select
                  className="form-select"
                  value={type}
                  onChange={(event) => {
                    setType(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >

                  <option value="">
                    All Types
                  </option>

                  <option value="info">
                    Info
                  </option>

                  <option value="success">
                    Success
                  </option>

                  <option value="warning">
                    Warning
                  </option>

                  <option value="error">
                    Error
                  </option>

                </select>

              </div>

              {/* Status */}

              <div className="col-md-3">

                <label className="form-label fw-semibold">
                  Status
                </label>

                <select
                  className="form-select"
                  value={readStatus}
                  onChange={(event) => {
                    setReadStatus(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >

                  <option value="">
                    All
                  </option>

                  <option value="0">
                    Unread
                  </option>

                  <option value="1">
                    Read
                  </option>

                </select>

              </div>

              {/* Reset */}

              <div className="col-md-1 d-flex align-items-end">

                <button
                  type="button"
                  className="btn btn-outline-danger w-100"
                  onClick={
                    handleResetFilters
                  }
                  title="Reset filters"
                >
                  ×
                </button>

              </div>

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center mt-4">

              <span>
                {error}
              </span>

              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleRefresh}
                disabled={loading}
              >
                Retry
              </button>

            </div>
          )}

          {/* =================================================
              NOTIFICATIONS TABLE
          ================================================= */}

          <section className="admin-card mt-4">

            <div className="admin-card-header">

              <div>

                <h3 className="admin-card-title">
                  All Notifications
                </h3>

                <p className="admin-card-description">
                  Manage notifications sent to
                  StudentAI users.
                </p>

              </div>

            </div>

            {loading ? (

              <div className="admin-loading">

                <div className="admin-spinner" />

                <p className="text-muted mb-0">
                  Loading notifications...
                </p>

              </div>

            ) : notifications.length === 0 ? (

              <div className="text-center py-5">

                <FaBell className="text-muted fs-1 mb-3" />

                <h5>
                  No notifications found
                </h5>

                <p className="text-muted mb-0">
                  There are no notifications
                  matching your filters.
                </p>

              </div>

            ) : (

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>#</th>

                      <th>User</th>

                      <th>Notification</th>

                      <th>Type</th>

                      <th>Status</th>

                      <th>Date</th>

                      <th className="text-end">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {notifications.map(
                      (
                        notification,
                        index
                      ) => (

                        <tr
                          key={
                            notification.id
                          }
                        >

                          {/* Number */}

                          <td>
                            {(page - 1) *
                              PER_PAGE +
                              index +
                              1}
                          </td>

                          {/* User */}

                          <td>

                            <div>

                              <strong>
                                {
                                  notification
                                    .user
                                    ?.name ||
                                  "Unknown User"
                                }
                              </strong>

                              <small className="d-block text-muted">
                                {
                                  notification
                                    .user
                                    ?.email ||
                                  "—"
                                }
                              </small>

                            </div>

                          </td>

                          {/* Notification */}

                          <td>

                            <strong>
                              {
                                notification.title ||
                                "Untitled"
                              }
                            </strong>

                            <p
                              className="text-muted mb-0"
                              style={{
                                maxWidth:
                                  "320px",
                              }}
                            >
                              {
                                notification.message ||
                                "—"
                              }
                            </p>

                          </td>

                          {/* Type */}

                          <td>

                            <span
                              className={`badge text-bg-${getTypeClass(
                                notification.type
                              )}`}
                            >
                              {
                                notification.type ||
                                "info"
                              }
                            </span>

                          </td>

                          {/* Status */}

                          <td>

                            {notification.is_read ? (

                              <span className="badge text-bg-success">

                                <FaCheck className="me-1" />

                                Read

                              </span>

                            ) : (

                              <span className="badge text-bg-warning">
                                Unread
                              </span>

                            )}

                          </td>

                          {/* Date */}

                          <td>

                            <small>
                              {formatDate(
                                notification.created_at
                              )}
                            </small>

                          </td>

                          {/* Actions */}

                          <td>

                            <div className="d-flex justify-content-end gap-2">

                              {!notification.is_read && (

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success"
                                  title="Mark as read"
                                  disabled={
                                    actionLoading
                                  }
                                  onClick={() =>
                                    markAsRead(
                                      notification.id
                                    )
                                  }
                                >
                                  <FaCheck />
                                </button>

                              )}

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  deleteNotification(
                                    notification
                                  )
                                }
                              >
                                <FaTrash />
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loading &&
              lastPage > 1 && (

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">

                  <small className="text-muted">
                    Page {page} of{" "}
                    {lastPage}
                  </small>

                  <div className="d-flex gap-2">

                    <button
                      type="button"
                      className="admin-btn admin-btn-outline"
                      disabled={
                        page <= 1 ||
                        loading ||
                        actionLoading
                      }
                      onClick={
                        handlePreviousPage
                      }
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      className="admin-btn admin-btn-outline"
                      disabled={
                        page >= lastPage ||
                        loading ||
                        actionLoading
                      }
                      onClick={
                        handleNextPage
                      }
                    >
                      Next
                    </button>

                  </div>

                </div>

              )}

          </section>

        </div>
      </main>
    </div>
  );
}