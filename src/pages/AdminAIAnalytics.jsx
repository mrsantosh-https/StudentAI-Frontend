import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

import "../styles/adminAIAnalytics.css";

export default function AdminAIAnalytics() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_requests: 0,
    successful_requests: 0,
    failed_requests: 0,
    total_tokens: 0,
    active_users: 0,
    success_rate: 0,
    today_requests: 0,
    today_tokens: 0,
    week_requests: 0,
    week_tokens: 0,
  });

  const [toolUsage, setToolUsage] = useState([]);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [recentActivity, setRecentActivity] =
    useState([]);

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Fetch Analytics
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const fetchAIAnalytics = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          "/admin/ai-usage"
        );

        if (!isMounted) return;

        const data = response.data || {};
        const apiStats = data.stats || {};

        setStats({
          total_requests:
            Number(apiStats.total_requests) || 0,

          successful_requests:
            Number(apiStats.successful_requests) || 0,

          failed_requests:
            Number(apiStats.failed_requests) || 0,

          total_tokens:
            Number(apiStats.total_tokens) || 0,

          active_users:
            Number(apiStats.active_users) || 0,

          success_rate:
            Number(apiStats.success_rate) || 0,

          today_requests:
            Number(apiStats.today_requests) || 0,

          today_tokens:
            Number(apiStats.today_tokens) || 0,

          week_requests:
            Number(apiStats.week_requests) || 0,

          week_tokens:
            Number(apiStats.week_tokens) || 0,
        });

        setToolUsage(
          Array.isArray(data.tool_usage)
            ? data.tool_usage
            : []
        );

        setDailyUsage(
          Array.isArray(data.daily_usage)
            ? data.daily_usage
            : []
        );

        setTopUsers(
          Array.isArray(data.top_users)
            ? data.top_users
            : []
        );

        setRecentActivity(
          Array.isArray(data.recent_activity)
            ? data.recent_activity
            : []
        );
      } catch (error) {
        console.error(
          "AI analytics error:",
          error.response?.data || error
        );

        if (!isMounted) return;

        if (error.response?.status === 401) {
          toast.error("Please login again.");
          navigate("/login");
          return;
        }

        if (error.response?.status === 403) {
          toast.error("Admin access required.");
          navigate("/dashboard");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "AI analytics load nahi ho saka."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAIAnalytics();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatToolName = (tool) => {
    if (!tool) return "Unknown Tool";

    return String(tool)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  /*
  |--------------------------------------------------------------------------
  | Chart Maximum
  |--------------------------------------------------------------------------
  */

  const maxDailyRequests = useMemo(
    () =>
      Math.max(
        ...dailyUsage.map(
          (item) =>
            Number(item.total_requests) || 0
        ),
        1
      ),
    [dailyUsage]
  );

  /*
  |--------------------------------------------------------------------------
  | JSX
  |--------------------------------------------------------------------------
  */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="ai-admin-content">
          {/* Header */}

          <div className="ai-admin-header">
            <div>
              <h2>🤖 AI Usage Analytics</h2>

              <p>
                Monitor StudentAI AI requests,
                token usage and user activity.
              </p>
            </div>

            <button
              type="button"
              className="ai-back-btn"
              onClick={() =>
                navigate("/admin/dashboard")
              }
            >
              ← Admin Dashboard
            </button>
          </div>

          {loading ? (
            <div className="ai-admin-loading">
              <div className="ai-admin-spinner" />

              <p>
                Loading AI analytics...
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}

              <div className="ai-stats-grid">
                <div className="ai-stat-card">
                  <span className="ai-stat-icon">
                    🤖
                  </span>

                  <div>
                    <p>Total Requests</p>

                    <h3>
                      {formatNumber(
                        stats.total_requests
                      )}
                    </h3>
                  </div>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-icon">
                    ✅
                  </span>

                  <div>
                    <p>Successful</p>

                    <h3>
                      {formatNumber(
                        stats.successful_requests
                      )}
                    </h3>
                  </div>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-icon">
                    ❌
                  </span>

                  <div>
                    <p>Failed</p>

                    <h3>
                      {formatNumber(
                        stats.failed_requests
                      )}
                    </h3>
                  </div>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-icon">
                    🧮
                  </span>

                  <div>
                    <p>Total Tokens</p>

                    <h3>
                      {formatNumber(
                        stats.total_tokens
                      )}
                    </h3>
                  </div>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-icon">
                    👥
                  </span>

                  <div>
                    <p>Active AI Users</p>

                    <h3>
                      {formatNumber(
                        stats.active_users
                      )}
                    </h3>
                  </div>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-icon">
                    📊
                  </span>

                  <div>
                    <p>Success Rate</p>

                    <h3>
                      {stats.success_rate}%
                    </h3>
                  </div>
                </div>
              </div>

              {/* Today / Week */}

              <div className="ai-overview-grid">
                <div className="ai-panel">
                  <h4>📅 Today</h4>

                  <div className="ai-overview-row">
                    <span>Requests</span>

                    <strong>
                      {formatNumber(
                        stats.today_requests
                      )}
                    </strong>
                  </div>

                  <div className="ai-overview-row">
                    <span>Tokens</span>

                    <strong>
                      {formatNumber(
                        stats.today_tokens
                      )}
                    </strong>
                  </div>
                </div>

                <div className="ai-panel">
                  <h4>📈 This Week</h4>

                  <div className="ai-overview-row">
                    <span>Requests</span>

                    <strong>
                      {formatNumber(
                        stats.week_requests
                      )}
                    </strong>
                  </div>

                  <div className="ai-overview-row">
                    <span>Tokens</span>

                    <strong>
                      {formatNumber(
                        stats.week_tokens
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Daily Chart */}

              <div className="ai-panel">
                <div className="ai-panel-header">
                  <div>
                    <h4>
                      📊 Daily AI Usage
                    </h4>

                    <p>
                      Last 7 days request activity.
                    </p>
                  </div>
                </div>

                {dailyUsage.length === 0 ? (
                  <div className="ai-empty">
                    No daily usage data available.
                  </div>
                ) : (
                  <div className="ai-chart">
                    {dailyUsage.map((item) => {
                      const count =
                        Number(
                          item.total_requests
                        ) || 0;

                      const height =
                        count === 0
                          ? 8
                          : Math.max(
                              (count /
                                maxDailyRequests) *
                                180,
                              25
                            );

                      return (
                        <div
                          className="ai-chart-item"
                          key={item.date}
                        >
                          <strong>
                            {count}
                          </strong>

                          <div
                            className="ai-chart-bar"
                            style={{
                              height: `${height}px`,
                            }}
                          />

                          <span>
                            {item.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tool Usage */}

              <div className="ai-panel">
                <div className="ai-panel-header">
                  <div>
                    <h4>
                      🧰 Tool-wise Usage
                    </h4>

                    <p>
                      Usage breakdown by AI feature.
                    </p>
                  </div>
                </div>

                {toolUsage.length === 0 ? (
                  <div className="ai-empty">
                    No AI tool usage available.
                  </div>
                ) : (
                  <div className="ai-table-wrap">
                    <table className="ai-table">
                      <thead>
                        <tr>
                          <th>Tool</th>
                          <th>Requests</th>
                          <th>Success</th>
                          <th>Failed</th>
                          <th>Tokens</th>
                        </tr>
                      </thead>

                      <tbody>
                        {toolUsage.map(
                          (tool) => (
                            <tr key={tool.tool}>
                              <td>
                                <strong>
                                  {formatToolName(
                                    tool.tool
                                  )}
                                </strong>
                              </td>

                              <td>
                                {formatNumber(
                                  tool.total_requests
                                )}
                              </td>

                              <td>
                                <span className="ai-success-badge">
                                  {formatNumber(
                                    tool.successful_requests
                                  )}
                                </span>
                              </td>

                              <td>
                                <span className="ai-failed-badge">
                                  {formatNumber(
                                    tool.failed_requests
                                  )}
                                </span>
                              </td>

                              <td>
                                {formatNumber(
                                  tool.total_tokens
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Top Users */}

              <div className="ai-panel">
                <div className="ai-panel-header">
                  <div>
                    <h4>
                      🏆 Top AI Users
                    </h4>

                    <p>
                      Users with highest AI usage.
                    </p>
                  </div>
                </div>

                {topUsers.length === 0 ? (
                  <div className="ai-empty">
                    No active AI users yet.
                  </div>
                ) : (
                  <div className="ai-table-wrap">
                    <table className="ai-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>User</th>
                          <th>Email</th>
                          <th>Requests</th>
                          <th>Tokens</th>
                        </tr>
                      </thead>

                      <tbody>
                        {topUsers.map(
                          (user, index) => (
                            <tr key={user.id}>
                              <td>
                                {index + 1}
                              </td>

                              <td>
                                <strong>
                                  {user.name ||
                                    "N/A"}
                                </strong>
                              </td>

                              <td>
                                {user.email ||
                                  "N/A"}
                              </td>

                              <td>
                                {formatNumber(
                                  user.total_requests
                                )}
                              </td>

                              <td>
                                {formatNumber(
                                  user.total_tokens
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Activity */}

              <div className="ai-panel">
                <div className="ai-panel-header">
                  <div>
                    <h4>
                      🕒 Recent AI Activity
                    </h4>

                    <p>
                      Latest AI requests across
                      StudentAI.
                    </p>
                  </div>
                </div>

                {recentActivity.length === 0 ? (
                  <div className="ai-empty">
                    No recent AI activity.
                  </div>
                ) : (
                  <div className="ai-table-wrap">
                    <table className="ai-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Tool</th>
                          <th>Status</th>
                          <th>Prompt</th>
                          <th>Completion</th>
                          <th>Total Tokens</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentActivity.map(
                          (activity) => (
                            <tr key={activity.id}>
                              <td>
                                {activity.user
                                  ?.name ||
                                  "Unknown"}
                              </td>

                              <td>
                                {formatToolName(
                                  activity.tool
                                )}
                              </td>

                              <td>
                                <span
                                  className={
                                    activity.status ===
                                    "success"
                                      ? "ai-success-badge"
                                      : "ai-failed-badge"
                                  }
                                >
                                  {activity.status}
                                </span>
                              </td>

                              <td>
                                {formatNumber(
                                  activity.prompt_tokens
                                )}
                              </td>

                              <td>
                                {formatNumber(
                                  activity.completion_tokens
                                )}
                              </td>

                              <td>
                                <strong>
                                  {formatNumber(
                                    activity.total_tokens
                                  )}
                                </strong>
                              </td>

                              <td>
                                {formatDate(
                                  activity.created_at
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}