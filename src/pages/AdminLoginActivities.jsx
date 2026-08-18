import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getLoginActivities } from "../services/admin";
import toast from "react-hot-toast";

export default function AdminLoginActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  /*
  |--------------------------------------------------------------------------
  | Fetch Login Activities
  |--------------------------------------------------------------------------
  */

  const fetchActivities = useCallback(async () => {
    const response = await getLoginActivities({
      page,
      search,
      status,
      date,
    });

    const activityData = response?.activities;

    setActivities(
      Array.isArray(activityData?.data)
        ? activityData.data
        : []
    );

    setPagination({
      current_page: activityData?.current_page || 1,
      last_page: activityData?.last_page || 1,
      total: activityData?.total || 0,
    });
  }, [page, search, status, date]);

  /*
  |--------------------------------------------------------------------------
  | Load Activities
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadActivities = async () => {
      try {
        setLoading(true);

        const response = await getLoginActivities({
          page,
          search,
          status,
          date,
        });

        if (cancelled) {
          return;
        }

        const activityData = response?.activities;

        setActivities(
          Array.isArray(activityData?.data)
            ? activityData.data
            : []
        );

        setPagination({
          current_page:
            activityData?.current_page || 1,
          last_page:
            activityData?.last_page || 1,
          total:
            activityData?.total || 0,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Fetch login activities failed:",
          error
        );

        setActivities([]);

        toast.error(
          error.message ||
            "Failed to load login activities."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadActivities();

    return () => {
      cancelled = true;
    };
  }, [page, search, status, date]);

  /*
  |--------------------------------------------------------------------------
  | Manual Refresh
  |--------------------------------------------------------------------------
  */

  const handleRefresh = async () => {
    try {
      setLoading(true);

      await fetchActivities();

      toast.success(
        "Login activities refreshed."
      );
    } catch (error) {
      console.error(
        "Refresh login activities failed:",
        error
      );

      toast.error(
        error.message ||
          "Failed to refresh activities."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Date
  |--------------------------------------------------------------------------
  */

  const handleDateChange = (event) => {
    setDate(event.target.value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Clear Filters
  |--------------------------------------------------------------------------
  */

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setDate("");
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Status Badge
  |--------------------------------------------------------------------------
  */

  const getStatusBadge = (activityStatus) => {
    switch (activityStatus) {
      case "success":
        return (
          <span className="badge bg-success">
            Success
          </span>
        );

      case "failed":
        return (
          <span className="badge bg-danger">
            Failed
          </span>
        );

      case "blocked":
        return (
          <span className="badge bg-warning text-dark">
            Blocked
          </span>
        );

      default:
        return (
          <span className="badge bg-secondary">
            {activityStatus || "Unknown"}
          </span>
        );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Format Date
  |--------------------------------------------------------------------------
  */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const dateObject = new Date(dateValue);

    if (Number.isNaN(dateObject.getTime())) {
      return dateValue;
    }

    return dateObject.toLocaleString();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">

          {/* Header */}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1">
                🔐 Login Activities
              </h2>

              <p className="text-muted mb-0">
                Monitor user login attempts and
                authentication activities.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "🔄 Refresh"}
            </button>
          </div>

          {/* Filters */}

          <div className="card border-0 shadow p-4 mt-4">
            <div className="row g-3">

              <div className="col-md-5">
                <label className="form-label fw-semibold">
                  Search User
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={handleSearch}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Status
                </label>

                <select
                  className="form-select"
                  value={status}
                  onChange={handleStatusChange}
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

                  <option value="blocked">
                    Blocked
                  </option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label fw-semibold">
                  Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={handleDateChange}
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              </div>

            </div>
          </div>

          {/* Total */}

          <div className="mt-4">
            <span className="text-muted">
              Total Activities:{" "}
              <strong>
                {pagination.total}
              </strong>
            </span>
          </div>

          {/* Table */}

          <div className="card border-0 shadow mt-3">
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>User Agent</th>
                    <th>Login Time</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5"
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        />

                        <div className="mt-2 text-muted">
                          Loading login activities...
                        </div>
                      </td>
                    </tr>
                  ) : activities.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5 text-muted"
                      >
                        No login activities found.
                      </td>
                    </tr>
                  ) : (
                    activities.map(
                      (activity, index) => (
                        <tr key={activity.id}>

                          <td>
                            {(pagination.current_page -
                              1) *
                              15 +
                              index +
                              1}
                          </td>

                          <td>
                            <div className="fw-semibold">
                              {activity.user?.name ||
                                "Unknown User"}
                            </div>

                            <small className="text-muted">
                              {activity.user?.email ||
                                "-"}
                            </small>
                          </td>

                          <td>
                            {getStatusBadge(
                              activity.status
                            )}
                          </td>

                          <td>
                            <code>
                              {activity.ip_address ||
                                "-"}
                            </code>
                          </td>

                          <td
                            style={{
                              maxWidth: "280px",
                            }}
                          >
                            <small
                              className="text-muted"
                              title={
                                activity.user_agent ||
                                ""
                              }
                            >
                              {activity.user_agent
                                ? activity.user_agent
                                    .length > 55
                                  ? `${activity.user_agent.slice(
                                      0,
                                      55
                                    )}...`
                                  : activity.user_agent
                                : "-"}
                            </small>
                          </td>

                          <td>
                            <small>
                              {formatDate(
                                activity.login_at
                              )}
                            </small>
                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>
          </div>

          {/* Pagination */}

          {!loading &&
            pagination.last_page > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-4">

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                >
                  ← Previous
                </button>

                <span className="fw-semibold">
                  Page {pagination.current_page}{" "}
                  of {pagination.last_page}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={
                    page >= pagination.last_page
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        pagination.last_page,
                        current + 1
                      )
                    )
                  }
                >
                  Next →
                </button>

              </div>
            )}

        </div>
      </main>
    </div>
  );
}