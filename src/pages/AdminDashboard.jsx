import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_users: 0,
    total_resumes: 0,
    admin_users: 0,
    normal_users: 0,
  });

  const [contactMessages, setContactMessages] = useState([]);
  const [contactStats, setContactStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    resolved: 0,
  });

  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAdminDashboard = async () => {
      try {
        setLoading(true);

        const response = await api.get("/admin/dashboard");
        const adminStats = response.data?.stats || {};

        if (!isMounted) {
          return;
        }

        setStats({
          total_users: Number(adminStats.total_users) || 0,
          total_resumes: Number(adminStats.total_resumes) || 0,
          admin_users: Number(adminStats.admin_users) || 0,
          normal_users: Number(adminStats.normal_users) || 0,
        });
      } catch (error) {
        console.error(
          "Admin dashboard error:",
          error.response?.data || error
        );

        if (!isMounted) {
          return;
        }

        if (error.response?.status === 403) {
          toast.error("Admin access required.");
          navigate("/dashboard");
          return;
        }

        if (error.response?.status === 401) {
          toast.error("Please login again.");
          navigate("/login");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Admin dashboard load nahi ho saka."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchContactMessages = async () => {
      try {
        setContactLoading(true);

        const response = await api.get(
          "/admin/contact-messages?per_page=5"
        );

        if (!isMounted) {
          return;
        }

        /*
         * Laravel pagination response:
         *
         * response.data.data.data
         * response.data.data.total
         *
         */

        const pagination = response.data?.data || {};
        const messages = Array.isArray(pagination.data)
          ? pagination.data
          : [];

        setContactMessages(messages);

        const total = Number(pagination.total) || 0;

        const newCount = messages.filter(
          (item) => item.status === "new"
        ).length;

        const readCount = messages.filter(
          (item) => item.status === "read"
        ).length;

        const resolvedCount = messages.filter(
          (item) => item.status === "resolved"
        ).length;

        /*
         * Backend pagination me current page ke records hi milte hain.
         * Isliye exact status totals ke liye all messages fetch karne
         * ke bajay dashboard par available data ka safe count use kar rahe hain.
         *
         * Agar backend future me status counts bhejta hai,
         * wo automatically use kiye ja sakte hain.
         */

        setContactStats({
          total,
          new: newCount,
          read: readCount,
          resolved: resolvedCount,
        });
      } catch (error) {
        console.error(
          "Contact messages error:",
          error.response?.data || error
        );

        if (!isMounted) {
          return;
        }

        if (error.response?.status === 403) {
          toast.error("Admin access required.");
          navigate("/dashboard");
          return;
        }

        if (error.response?.status === 401) {
          toast.error("Please login again.");
          navigate("/login");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Contact messages load nahi ho sake."
        );
      } finally {
        if (isMounted) {
          setContactLoading(false);
        }
      }
    };

    fetchAdminDashboard();
    fetchContactMessages();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "new":
        return "admin-contact-status admin-contact-status-new";

      case "read":
        return "admin-contact-status admin-contact-status-read";

      case "resolved":
        return "admin-contact-status admin-contact-status-resolved";

      default:
        return "admin-contact-status";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "new":
        return "New";

      case "read":
        return "Read";

      case "resolved":
        return "Resolved";

      default:
        return status || "Unknown";
    }
  };

  return (
    <div className="dashboard-layout admin-dashboard">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="admin-dashboard-content">
          {/* HEADER */}

          <div className="admin-header">
            <div className="admin-header-content">
              <h1>🛡️ Admin Dashboard</h1>

              <p>
                Manage users and monitor StudentAI activity.
              </p>
            </div>

            <div className="admin-badge">
              🛡️ Administrator
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner" />

              <p className="text-muted mb-0">
                Loading admin dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* STAT CARDS */}

              <div className="admin-stats-grid">
                {/* Total Users */}

                <div className="admin-stat-card">
                  <div className="admin-stat-info">
                    <p className="admin-stat-label">
                      Total Users
                    </p>

                    <h2 className="admin-stat-number">
                      {stats.total_users}
                    </h2>

                    <span className="admin-stat-subtitle">
                      Registered accounts
                    </span>
                  </div>

                  <div className="admin-stat-icon admin-icon-blue">
                    👥
                  </div>
                </div>

                {/* Normal Users */}

                <div className="admin-stat-card">
                  <div className="admin-stat-info">
                    <p className="admin-stat-label">
                      Normal Users
                    </p>

                    <h2 className="admin-stat-number">
                      {stats.normal_users}
                    </h2>

                    <span className="admin-stat-subtitle">
                      Standard users
                    </span>
                  </div>

                  <div className="admin-stat-icon admin-icon-green">
                    👤
                  </div>
                </div>

                {/* Admin Users */}

                <div className="admin-stat-card">
                  <div className="admin-stat-info">
                    <p className="admin-stat-label">
                      Admin Users
                    </p>

                    <h2 className="admin-stat-number">
                      {stats.admin_users}
                    </h2>

                    <span className="admin-stat-subtitle">
                      Administrator accounts
                    </span>
                  </div>

                  <div className="admin-stat-icon admin-icon-purple">
                    🛡️
                  </div>
                </div>

                {/* Total Resumes */}

                <div className="admin-stat-card">
                  <div className="admin-stat-info">
                    <p className="admin-stat-label">
                      Total Resumes
                    </p>

                    <h2 className="admin-stat-number">
                      {stats.total_resumes}
                    </h2>

                    <span className="admin-stat-subtitle">
                      Created resumes
                    </span>
                  </div>

                  <div className="admin-stat-icon admin-icon-orange">
                    📄
                  </div>
                </div>

                {/* Total Contact Messages */}

                <div className="admin-stat-card admin-contact-stat-card">
                  <div className="admin-stat-info">
                    <p className="admin-stat-label">
                      Contact Messages
                    </p>

                    <h2 className="admin-stat-number">
                      {contactStats.total}
                    </h2>

                    <span className="admin-stat-subtitle">
                      User support messages
                    </span>
                  </div>

                  <div className="admin-stat-icon admin-icon-cyan">
                    📩
                  </div>
                </div>

                {/* New Contact Messages */}

                <div className="admin-stat-card admin-contact-stat-card">
                  <div className="admin-stat-info">
                    <p className="admin-stat-label">
                      New Messages
                    </p>

                    <h2 className="admin-stat-number">
                      {contactStats.new}
                    </h2>

                    <span className="admin-stat-subtitle">
                      Awaiting response
                    </span>
                  </div>

                  <div className="admin-stat-icon admin-icon-red">
                    🆕
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT */}

              <div className="admin-content-grid">
                {/* QUICK ACTIONS */}

                <section className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3 className="admin-card-title">
                        Quick Actions
                      </h3>

                      <p className="admin-card-description">
                        Manage important StudentAI admin features.
                      </p>
                    </div>
                  </div>

                  <div className="admin-quick-actions">
                    {/* User Analytics */}

                    <button
                      type="button"
                      className="admin-action-card"
                      onClick={() =>
                        navigate("/admin/user-analytics")
                      }
                    >
                      <div className="admin-action-icon">
                        👥
                      </div>

                      <div className="admin-action-content">
                        <h4>User Analytics</h4>

                        <p>
                          View, block, delete and manage users.
                        </p>
                      </div>
                    </button>

                    {/* AI Analytics */}

                    <button
                      type="button"
                      className="admin-action-card"
                      onClick={() =>
                        navigate("/admin/ai-analytics")
                      }
                    >
                      <div className="admin-action-icon">
                        🤖
                      </div>

                      <div className="admin-action-content">
                        <h4>AI Usage Analytics</h4>

                        <p>
                          Monitor AI tools usage and requests.
                        </p>
                      </div>
                    </button>

                    {/* Notifications */}

                    <button
                      type="button"
                      className="admin-action-card"
                      onClick={() =>
                        navigate("/admin/notifications")
                      }
                    >
                      <div className="admin-action-icon">
                        🔔
                      </div>

                      <div className="admin-action-content">
                        <h4>Admin Notifications</h4>

                        <p>
                          Send and manage notifications for users.
                        </p>
                      </div>
                    </button>

                    {/* Subscription Plans */}

                    <button
                      type="button"
                      className="admin-action-card"
                      onClick={() =>
                        navigate("/admin/subscriptions")
                      }
                    >
                      <div className="admin-action-icon">
                        💳
                      </div>

                      <div className="admin-action-content">
                        <h4>Subscription Plans</h4>

                        <p>
                          Create and manage free and premium plans.
                        </p>
                      </div>
                    </button>

                    {/* User Subscriptions */}

                    <button
                      type="button"
                      className="admin-action-card"
                      onClick={() =>
                        navigate("/admin/user-subscriptions")
                      }
                    >
                      <div className="admin-action-icon">
                        👤💳
                      </div>

                      <div className="admin-action-content">
                        <h4>User Subscriptions</h4>

                        <p>
                          View and manage subscriptions assigned
                          to users.
                        </p>
                      </div>
                    </button>

                    {/* Login Activities */}

                    <button
                      type="button"
                      className="admin-action-card"
                      onClick={() =>
                        navigate("/admin/login-activities")
                      }
                    >
                      <div className="admin-action-icon">
                        👤🔐
                      </div>

                      <div className="admin-action-content">
                        <h4>User Login Activities</h4>

                        <p>
                          View login device and time.
                        </p>
                      </div>
                    </button>

                    {/* Feedback */}

                    <button
                      type="button"
                      className="admin-action-card"
                      onClick={() =>
                        navigate("/admin/feedback")
                      }
                    >
                      <div className="admin-action-icon">
                        💬
                      </div>

                      <div className="admin-action-content">
                        <h4>Feedback</h4>

                        <p>
                          Review feedback and user suggestions.
                        </p>
                      </div>
                    </button>

                    {/* Contact Messages */}

                    <button
                      type="button"
                      className="admin-action-card admin-action-contact"
                      onClick={() =>
                        navigate("/admin/contact-messages")
                      }
                    >
                      <div className="admin-action-icon">
                        📩
                      </div>

                      <div className="admin-action-content">
                        <h4>Contact Messages</h4>

                        <p>
                          View and manage user support messages.
                        </p>
                      </div>

                      {contactStats.new > 0 && (
                        <span className="admin-action-badge">
                          {contactStats.new} New
                        </span>
                      )}
                    </button>
                  </div>
                </section>

                {/* SYSTEM OVERVIEW */}

                <section className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3 className="admin-card-title">
                        System Overview
                      </h3>

                      <p className="admin-card-description">
                        Current StudentAI account distribution.
                      </p>
                    </div>
                  </div>

                  <div className="admin-activity-list">
                    <div className="admin-activity-item">
                      <div className="admin-activity-icon">
                        👥
                      </div>

                      <div className="admin-activity-content">
                        <h5>Registered Users</h5>

                        <p>
                          {stats.total_users} total accounts are
                          registered.
                        </p>
                      </div>
                    </div>

                    <div className="admin-activity-item">
                      <div className="admin-activity-icon">
                        👤
                      </div>

                      <div className="admin-activity-content">
                        <h5>Standard Accounts</h5>

                        <p>
                          {stats.normal_users} normal users
                          currently exist.
                        </p>
                      </div>
                    </div>

                    <div className="admin-activity-item">
                      <div className="admin-activity-icon">
                        🛡️
                      </div>

                      <div className="admin-activity-content">
                        <h5>Administrator Accounts</h5>

                        <p>
                          {stats.admin_users} admin account(s)
                          available.
                        </p>
                      </div>
                    </div>

                    <div className="admin-activity-item">
                      <div className="admin-activity-icon">
                        📄
                      </div>

                      <div className="admin-activity-content">
                        <h5>Resume Activity</h5>

                        <p>
                          {stats.total_resumes} resumes have been
                          created.
                        </p>
                      </div>
                    </div>

                    <div className="admin-activity-item">
                      <div className="admin-activity-icon">
                        🔔
                      </div>

                      <div className="admin-activity-content">
                        <h5>Notification Management</h5>

                        <p>
                          Create and manage platform notifications
                          for users.
                        </p>
                      </div>
                    </div>

                    <div className="admin-activity-item">
                      <div className="admin-activity-icon">
                        👤💳
                      </div>

                      <div className="admin-activity-content">
                        <h5>User Subscriptions</h5>

                        <p>
                          View and manage subscription plans
                          assigned to users.
                        </p>
                      </div>
                    </div>

                    <div className="admin-activity-item">
                      <div className="admin-activity-icon">
                        📩
                      </div>

                      <div className="admin-activity-content">
                        <h5>Contact Support</h5>

                        <p>
                          {contactStats.total} contact message(s)
                          received from users.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* RECENT CONTACT MESSAGES */}

              <section className="admin-card admin-contact-card">
                <div className="admin-card-header admin-contact-header">
                  <div>
                    <h3 className="admin-card-title">
                      📩 Recent Contact Messages
                    </h3>

                    <p className="admin-card-description">
                      Latest messages received from StudentAI users.
                    </p>
                  </div>

                  <div className="admin-contact-header-actions">
                    <div className="admin-contact-mini-stats">
                      <span className="admin-mini-stat">
                        <strong>{contactStats.total}</strong>
                        Total
                      </span>

                      <span className="admin-mini-stat admin-mini-new">
                        <strong>{contactStats.new}</strong>
                        New
                      </span>

                      <span className="admin-mini-stat admin-mini-resolved">
                        <strong>{contactStats.resolved}</strong>
                        Resolved
                      </span>
                    </div>

                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      onClick={() =>
                        navigate("/admin/contact-messages")
                      }
                    >
                      View All Messages →
                    </button>
                  </div>
                </div>

                {contactLoading ? (
                  <div className="admin-contact-loading">
                    <div className="admin-spinner" />

                    <p>
                      Loading contact messages...
                    </p>
                  </div>
                ) : contactMessages.length === 0 ? (
                  <div className="admin-contact-empty">
                    <div className="admin-contact-empty-icon">
                      📭
                    </div>

                    <h4>No Contact Messages</h4>

                    <p>
                      There are no contact messages available right now.
                    </p>
                  </div>
                ) : (
                  <div className="admin-contact-table-wrapper">
                    <table className="admin-table admin-contact-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {contactMessages.map((message) => (
                          <tr key={message.id}>
                            <td>
                              <div className="admin-contact-user">
                                <div className="admin-contact-avatar">
                                  {(message.user?.name ||
                                    message.name ||
                                    "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {message.user?.name ||
                                      message.name ||
                                      "Unknown User"}
                                  </strong>

                                  {message.user_id && (
                                    <small>
                                      ID: {message.user_id}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="admin-contact-email">
                                {message.user?.email ||
                                  message.email ||
                                  "—"}
                              </span>
                            </td>

                            <td>
                              <div className="admin-contact-subject">
                                {message.subject || "No subject"}
                              </div>
                            </td>

                            <td>
                              <span
                                className={getStatusClass(
                                  message.status
                                )}
                              >
                                {getStatusLabel(message.status)}
                              </span>
                            </td>

                            <td>
                              <span className="admin-contact-date">
                                {formatDate(
                                  message.created_at
                                )}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="admin-btn admin-btn-outline admin-contact-view-btn"
                                onClick={() =>
                                  navigate(
                                    "/admin/contact-messages",
                                    {
                                      state: {
                                        openMessageId:
                                          message.id,
                                      },
                                    }
                                  )
                                }
                              >
                                👁️ View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* ADMIN MANAGEMENT */}

              <section className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">
                      Admin Management
                    </h3>

                    <p className="admin-card-description">
                      Open administrative tools and monitor
                      platform activity.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() =>
                      navigate("/admin/user-analytics")
                    }
                  >
                    👥 Manage Users
                  </button>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Module</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* User Management */}

                      <tr>
                        <td>User Management</td>

                        <td>
                          <span className="admin-status admin-status-active">
                            Active
                          </span>
                        </td>

                        <td>
                          Manage users, roles, blocking and
                          deletion.
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() =>
                              navigate(
                                "/admin/user-analytics"
                              )
                            }
                          >
                            Open
                          </button>
                        </td>
                      </tr>

                      {/* AI Usage */}

                      <tr>
                        <td>AI Usage Analytics</td>

                        <td>
                          <span className="admin-status admin-status-user">
                            Next
                          </span>
                        </td>

                        <td>
                          Track AI requests and usage.
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() =>
                              navigate(
                                "/admin/ai-analytics"
                              )
                            }
                          >
                            Open
                          </button>
                        </td>
                      </tr>

                      {/* Notifications */}

                      <tr>
                        <td>🔔 Notifications</td>

                        <td>
                          <span className="admin-status admin-status-active">
                            Active
                          </span>
                        </td>

                        <td>
                          Create, broadcast and manage user
                          notifications.
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() =>
                              navigate(
                                "/admin/notifications"
                              )
                            }
                          >
                            Open
                          </button>
                        </td>
                      </tr>

                      {/* Subscription Plans */}

                      <tr>
                        <td>💳 Subscription Plans</td>

                        <td>
                          <span className="admin-status admin-status-active">
                            Active
                          </span>
                        </td>

                        <td>
                          Manage platform subscription tiers,
                          pricing and limits.
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() =>
                              navigate(
                                "/admin/subscriptions"
                              )
                            }
                          >
                            Open
                          </button>
                        </td>
                      </tr>

                      {/* User Subscriptions */}

                      <tr>
                        <td>💳 User Subscriptions</td>

                        <td>
                          <span className="admin-status admin-status-active">
                            Active
                          </span>
                        </td>

                        <td>
                          View and manage subscriptions assigned
                          to individual users.
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() =>
                              navigate(
                                "/admin/user-subscriptions"
                              )
                            }
                          >
                            Open
                          </button>
                        </td>
                      </tr>

                      {/* Feedback */}

                      <tr>
                        <td>💬 Feedback System</td>

                        <td>
                          <span className="admin-status admin-status-user">
                            Active
                          </span>
                        </td>

                        <td>
                          Monitor user feedback and suggestions.
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() =>
                              navigate(
                                "/admin/feedback"
                              )
                            }
                          >
                            Open
                          </button>
                        </td>
                      </tr>

                      {/* Contact Messages */}

                      <tr>
                        <td>📩 Contact Messages</td>

                        <td>
                          <span className="admin-status admin-status-active">
                            Active
                          </span>
                        </td>

                        <td>
                          Review and resolve messages submitted
                          by users.
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() =>
                              navigate(
                                "/admin/contact-messages"
                              )
                            }
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}