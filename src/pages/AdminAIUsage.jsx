import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  getAIUsage,
  getAIUsageActivity,
} from "../services/admin";

const TOOL_OPTIONS = [
  {
    value: "ai_career_coach",
    label: "AI Career Coach",
  },
  {
    value: "career_roadmap",
    label: "Career Roadmap",
  },
  {
    value: "cover_letter",
    label: "Cover Letter",
  },
  {
    value: "job_matcher",
    label: "Job Matcher",
  },
  {
    value: "resume_analysis",
    label: "Resume Analysis",
  },
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

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
}

function getToolLabel(tool) {
  const found = TOOL_OPTIONS.find(
    (item) => item.value === tool
  );

  return found?.label || tool || "Unknown";
}

export default function AdminAIUsage() {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Summary
  |--------------------------------------------------------------------------
  */

  const [summary, setSummary] = useState({
    total_requests: 0,
    successful_requests: 0,
    failed_requests: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  });

  /*
  |--------------------------------------------------------------------------
  | Analytics
  |--------------------------------------------------------------------------
  */

  const [toolUsage, setToolUsage] = useState([]);
  const [statusUsage, setStatusUsage] = useState([]);
  const [dailyUsage, setDailyUsage] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | Activities
  |--------------------------------------------------------------------------
  */

  const [activities, setActivities] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState("");
  const [tool, setTool] = useState("");
  const [status, setStatus] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] =
    useState(false);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch AI Usage
  |--------------------------------------------------------------------------
  */

  const fetchAIUsage = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const response = await getAIUsage({
          page,
          search,
          tool,
          status,
        });

        setSummary({
          total_requests:
            Number(
              response?.summary?.total_requests
            ) || 0,

          successful_requests:
            Number(
              response?.summary
                ?.successful_requests
            ) || 0,

          failed_requests:
            Number(
              response?.summary
                ?.failed_requests
            ) || 0,

          prompt_tokens:
            Number(
              response?.summary?.prompt_tokens
            ) || 0,

          completion_tokens:
            Number(
              response?.summary
                ?.completion_tokens
            ) || 0,

          total_tokens:
            Number(
              response?.summary?.total_tokens
            ) || 0,
        });

        setToolUsage(
          Array.isArray(response?.tool_usage)
            ? response.tool_usage
            : []
        );

        setStatusUsage(
          Array.isArray(response?.status_usage)
            ? response.status_usage
            : []
        );

        setDailyUsage(
          Array.isArray(response?.daily_usage)
            ? response.daily_usage
            : []
        );

        const activityData =
          response?.activities || {};

        setActivities(
          Array.isArray(activityData.data)
            ? activityData.data
            : []
        );

        setPagination({
          currentPage:
            Number(
              activityData.current_page
            ) || 1,

          lastPage:
            Number(activityData.last_page) || 1,

          total:
            Number(activityData.total) || 0,
        });
      } catch (error) {
        console.error(
          "AI usage page error:",
          error
        );

        if (
          error?.response?.status === 401
        ) {
          toast.error(
            "Please login again."
          );

          navigate("/login");
          return;
        }

        if (
          error?.response?.status === 403
        ) {
          toast.error(
            "Admin access required."
          );

          navigate("/dashboard");
          return;
        }

        toast.error(
          error.message ||
            "Failed to load AI usage analytics."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      search,
      tool,
      status,
      navigate,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | Search / Filter Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAIUsage(1);
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchAIUsage]);

  /*
  |--------------------------------------------------------------------------
  | View Activity
  |--------------------------------------------------------------------------
  */

  const handleViewActivity = async (
    activity
  ) => {
    try {
      setActivityLoading(true);

      const response =
        await getAIUsageActivity(
          activity.id
        );

      setSelectedActivity(
        response?.activity || activity
      );
    } catch (error) {
      console.error(
        "AI usage details error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to load activity details."
      );
    } finally {
      setActivityLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reset Filters
  |--------------------------------------------------------------------------
  */

  const resetFilters = () => {
    setSearch("");
    setTool("");
    setStatus("");
  };

  /*
  |--------------------------------------------------------------------------
  | Daily Chart Maximum
  |--------------------------------------------------------------------------
  */

  const maxDailyRequests = useMemo(() => {
    return Math.max(
      ...dailyUsage.map(
        (item) =>
          Number(item.requests) || 0
      ),
      1
    );
  }, [dailyUsage]);

  /*
  |--------------------------------------------------------------------------
  | Tool Usage Maximum
  |--------------------------------------------------------------------------
  */

  const maxToolRequests = useMemo(() => {
    return Math.max(
      ...toolUsage.map(
        (item) =>
          Number(item.requests) || 0
      ),
      1
    );
  }, [toolUsage]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading && pagination.total === 0) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <Topbar />

          <div className="dashboard-content text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            />

            <p className="text-muted mt-3">
              Loading AI usage analytics...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">

          {/* HEADER */}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h2 className="fw-bold mb-1">
                🤖 AI Usage Analytics
              </h2>

              <p className="text-muted mb-0">
                Monitor AI tools, requests and
                token usage across StudentAI.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
            >
              ← Admin Dashboard
            </button>
          </div>

          {/* SUMMARY CARDS */}

          <div className="row g-4">

            <div className="col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm p-4 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-2">
                      Total Requests
                    </p>

                    <h2 className="fw-bold mb-0">
                      {formatNumber(
                        summary.total_requests
                      )}
                    </h2>
                  </div>

                  <span
                    style={{
                      fontSize: "38px",
                    }}
                  >
                    🤖
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm p-4 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-2">
                      Successful
                    </p>

                    <h2 className="fw-bold text-success mb-0">
                      {formatNumber(
                        summary.successful_requests
                      )}
                    </h2>
                  </div>

                  <span
                    style={{
                      fontSize: "38px",
                    }}
                  >
                    ✅
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm p-4 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-2">
                      Failed
                    </p>

                    <h2 className="fw-bold text-danger mb-0">
                      {formatNumber(
                        summary.failed_requests
                      )}
                    </h2>
                  </div>

                  <span
                    style={{
                      fontSize: "38px",
                    }}
                  >
                    ❌
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm p-4 h-100">
                <p className="text-muted mb-2">
                  Prompt Tokens
                </p>

                <h2 className="fw-bold mb-0">
                  {formatNumber(
                    summary.prompt_tokens
                  )}
                </h2>
              </div>
            </div>

            <div className="col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm p-4 h-100">
                <p className="text-muted mb-2">
                  Completion Tokens
                </p>

                <h2 className="fw-bold mb-0">
                  {formatNumber(
                    summary.completion_tokens
                  )}
                </h2>
              </div>
            </div>

            <div className="col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm p-4 h-100">
                <p className="text-muted mb-2">
                  Total Tokens
                </p>

                <h2 className="fw-bold text-primary mb-0">
                  {formatNumber(
                    summary.total_tokens
                  )}
                </h2>
              </div>
            </div>
          </div>

          {/* TOOL USAGE */}

          <div className="card border-0 shadow-sm p-4 mt-4">
            <div className="mb-4">
              <h4 className="fw-bold mb-1">
                🧰 Tool-wise Usage
              </h4>

              <p className="text-muted mb-0">
                AI requests and token consumption
                by tool.
              </p>
            </div>

            {toolUsage.length === 0 ? (
              <p className="text-muted mb-0">
                No tool usage data available.
              </p>
            ) : (
              <div className="row g-4">
                {toolUsage.map((item) => {
                  const requests =
                    Number(item.requests) || 0;

                  const percentage =
                    Math.max(
                      (requests /
                        maxToolRequests) *
                        100,
                      4
                    );

                  return (
                    <div
                      className="col-md-6"
                      key={item.tool}
                    >
                      <div className="border rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>
                            {getToolLabel(
                              item.tool
                            )}
                          </strong>

                          <span className="badge bg-primary">
                            {formatNumber(
                              requests
                            )}{" "}
                            requests
                          </span>
                        </div>

                        <div
                          className="progress"
                          style={{
                            height: "9px",
                          }}
                        >
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <div className="row mt-3">
                          <div className="col-4">
                            <small className="text-muted">
                              Prompt
                            </small>

                            <div className="fw-semibold">
                              {formatNumber(
                                item.prompt_tokens
                              )}
                            </div>
                          </div>

                          <div className="col-4">
                            <small className="text-muted">
                              Completion
                            </small>

                            <div className="fw-semibold">
                              {formatNumber(
                                item.completion_tokens
                              )}
                            </div>
                          </div>

                          <div className="col-4">
                            <small className="text-muted">
                              Total
                            </small>

                            <div className="fw-semibold">
                              {formatNumber(
                                item.total_tokens
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DAILY USAGE */}

          <div className="card border-0 shadow-sm p-4 mt-4">
            <div className="mb-4">
              <h4 className="fw-bold mb-1">
                📅 Daily AI Usage
              </h4>

              <p className="text-muted mb-0">
                AI requests during the last 7 days.
              </p>
            </div>

            {dailyUsage.length === 0 ? (
              <p className="text-muted mb-0">
                No daily usage data available.
              </p>
            ) : (
              <div
                className="d-flex align-items-end gap-3"
                style={{
                  minHeight: "240px",
                  overflowX: "auto",
                }}
              >
                {dailyUsage.map((item) => {
                  const requests =
                    Number(item.requests) || 0;

                  const height =
                    requests === 0
                      ? 8
                      : Math.max(
                          (requests /
                            maxDailyRequests) *
                            170,
                          20
                        );

                  return (
                    <div
                      key={item.date}
                      className="text-center flex-fill"
                      style={{
                        minWidth: "70px",
                      }}
                    >
                      <div className="fw-bold mb-2">
                        {formatNumber(
                          requests
                        )}
                      </div>

                      <div
                        className="bg-primary rounded-top mx-auto"
                        style={{
                          width: "42px",
                          height: `${height}px`,
                          transition:
                            "height .25s ease",
                        }}
                      />

                      <div className="mt-2">
                        <strong
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {item.date}
                        </strong>

                        <div
                          className="text-muted"
                          style={{
                            fontSize: "11px",
                          }}
                        >
                          {formatNumber(
                            item.total_tokens
                          )}{" "}
                          tokens
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STATUS */}

          <div className="card border-0 shadow-sm p-4 mt-4">
            <h4 className="fw-bold mb-4">
              📌 Request Status
            </h4>

            <div className="row g-3">
              {statusUsage.map((item) => (
                <div
                  className="col-md-6"
                  key={item.status}
                >
                  <div className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className={`badge ${
                          item.status ===
                          "success"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {item.status}
                      </span>

                      <strong>
                        {formatNumber(
                          item.requests
                        )}
                      </strong>
                    </div>

                    <div className="text-muted mt-2">
                      {formatNumber(
                        item.total_tokens
                      )}{" "}
                      total tokens
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FILTERS */}

          <div className="card border-0 shadow-sm p-4 mt-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h4 className="fw-bold mb-1">
                  📋 AI Usage Activities
                </h4>

                <p className="text-muted mb-0">
                  Detailed AI request history.
                </p>
              </div>

              <span className="badge bg-primary">
                {formatNumber(
                  pagination.total
                )}{" "}
                Records
              </span>
            </div>

            <div className="row g-3">
              <div className="col-lg-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search user name or email..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="col-lg-3">
                <select
                  className="form-select"
                  value={tool}
                  onChange={(event) =>
                    setTool(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All AI Tools
                  </option>

                  {TOOL_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="col-lg-2">
                <select
                  className="form-select"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Status
                  </option>

                  <option value="success">
                    Success
                  </option>

                  <option value="failed">
                    Failed
                  </option>
                </select>
              </div>

              <div className="col-lg-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={resetFilters}
                  disabled={
                    !search &&
                    !tool &&
                    !status
                  }
                >
                  Reset
                </button>
              </div>
            </div>

            {/* TABLE */}

            <div className="table-responsive mt-4">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Tool</th>
                    <th>Status</th>
                    <th>Prompt</th>
                    <th>Completion</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {activities.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-5 text-muted"
                      >
                        No AI usage activities found.
                      </td>
                    </tr>
                  ) : (
                    activities.map(
                      (activity, index) => (
                        <tr
                          key={activity.id}
                        >
                          <td>
                            {(
                              pagination.currentPage -
                              1
                            ) *
                              15 +
                              index +
                              1}
                          </td>

                          <td>
                            <div>
                              <strong>
                                {activity.user
                                  ?.name ||
                                  "Unknown User"}
                              </strong>

                              <div
                                className="text-muted"
                                style={{
                                  fontSize:
                                    "11px",
                                }}
                              >
                                {activity.user
                                  ?.email ||
                                  "N/A"}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="badge bg-light text-dark">
                              {getToolLabel(
                                activity.tool
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                activity.status ===
                                "success"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
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

                          <td className="fw-semibold">
                            {formatNumber(
                              activity.total_tokens
                            )}
                          </td>

                          <td>
                            {formatDate(
                              activity.created_at
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              disabled={
                                activityLoading
                              }
                              onClick={() =>
                                handleViewActivity(
                                  activity
                                )
                              }
                            >
                              👁 View
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            {activities.length > 0 && (
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3">
                <span className="text-muted">
                  Page{" "}
                  {pagination.currentPage}{" "}
                  of{" "}
                  {pagination.lastPage}
                </span>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={
                      pagination.currentPage <=
                      1
                    }
                    onClick={() =>
                      fetchAIUsage(
                        pagination.currentPage -
                          1
                      )
                    }
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={
                      pagination.currentPage >=
                      pagination.lastPage
                    }
                    onClick={() =>
                      fetchAIUsage(
                        pagination.currentPage +
                          1
                      )
                    }
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ACTIVITY MODAL */}

      {selectedActivity && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background:
              "rgba(15, 23, 42, 0.68)",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() =>
            setSelectedActivity(null)
          }
        >
          <div
            className="card border-0 shadow-lg p-4"
            style={{
              width: "min(600px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-1">
                  🤖 AI Usage Details
                </h4>

                <p className="text-muted mb-0">
                  Request #{selectedActivity.id}
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setSelectedActivity(null)
                }
              />
            </div>

            <hr />

            <div className="row g-3">
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <small className="text-muted">
                    User
                  </small>

                  <div className="fw-semibold">
                    {selectedActivity.user
                      ?.name ||
                      "Unknown User"}
                  </div>

                  <small className="text-muted">
                    {selectedActivity.user
                      ?.email || "N/A"}
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded p-3">
                  <small className="text-muted">
                    Tool
                  </small>

                  <div className="fw-semibold">
                    {getToolLabel(
                      selectedActivity.tool
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded p-3">
                  <small className="text-muted">
                    Status
                  </small>

                  <div className="mt-1">
                    <span
                      className={`badge ${
                        selectedActivity.status ===
                        "success"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {selectedActivity.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded p-3">
                  <small className="text-muted">
                    Date
                  </small>

                  <div className="fw-semibold">
                    {formatDate(
                      selectedActivity.created_at
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded p-3">
                  <small className="text-muted">
                    Prompt Tokens
                  </small>

                  <div className="fw-bold">
                    {formatNumber(
                      selectedActivity.prompt_tokens
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded p-3">
                  <small className="text-muted">
                    Completion Tokens
                  </small>

                  <div className="fw-bold">
                    {formatNumber(
                      selectedActivity.completion_tokens
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded p-3">
                  <small className="text-muted">
                    Total Tokens
                  </small>

                  <div className="fw-bold text-primary">
                    {formatNumber(
                      selectedActivity.total_tokens
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedActivity.error_message && (
              <div className="alert alert-danger mt-3 mb-0">
                <strong>
                  Error:
                </strong>{" "}
                {selectedActivity.error_message}
              </div>
            )}

            <div className="text-end mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setSelectedActivity(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}