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

const [loading, setLoading] = useState(true);

useEffect(() => {
let isMounted = true;

const fetchAdminStats = async () => {
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

fetchAdminStats();

return () => {
  isMounted = false;
};

}, [navigate]);

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
                      View and manage subscriptions assigned to users.
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
              </div>
            </section>
          </div>

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
                        Planned
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