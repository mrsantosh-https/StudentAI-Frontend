import { useEffect, useState } from "react";
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
    per_page: 15,
  });

  /*
  |--------------------------------------------------------------------------
  | Load Login Activities
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

        console.log("LOGIN ACTIVITY API RESPONSE:", response);

        /*
        |--------------------------------------------------------------------------
        | Handle different Laravel response formats
        |--------------------------------------------------------------------------
        |
        | Possible:
        |
        | {
        |   activities: {
        |      data: [...]
        |   }
        | }
        |
        | OR
        |
        | {
        |   data: [...]
        | }
        |
        */

        const activityData = response?.activities ?? response?.data ?? response;

        /*
        |--------------------------------------------------------------------------
        | Activities
        |--------------------------------------------------------------------------
        */

        let activityList = [];

        if (Array.isArray(activityData)) {
          activityList = activityData;
        } else if (Array.isArray(activityData?.data)) {
          activityList = activityData.data;
        }

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        const currentPage = Number(activityData?.current_page) || page || 1;

        const lastPage = Number(activityData?.last_page) || 1;

        const total = Number(activityData?.total) || activityList.length || 0;

        const perPage = Number(activityData?.per_page) || 15;

        /*
        |--------------------------------------------------------------------------
        | Set State
        |--------------------------------------------------------------------------
        */

        setActivities(activityList);

        setPagination({
          current_page: currentPage,
          last_page: lastPage,
          total,
          per_page: perPage,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Fetch login activities failed:", error);

        console.error(
          "Backend response:",
          error?.cause?.response?.data || error?.response?.data,
        );

        setActivities([]);

        setPagination({
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 15,
        });

        toast.error(error?.message || "Failed to load login activities.");
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

      const response = await getLoginActivities({
        page,
        search,
        status,
        date,
      });

      console.log("REFRESH LOGIN ACTIVITY RESPONSE:", response);

      const activityData = response?.activities ?? response?.data ?? response;

      let activityList = [];

      if (Array.isArray(activityData)) {
        activityList = activityData;
      } else if (Array.isArray(activityData?.data)) {
        activityList = activityData.data;
      }

      setActivities(activityList);

      setPagination({
        current_page: Number(activityData?.current_page) || page || 1,

        last_page: Number(activityData?.last_page) || 1,

        total: Number(activityData?.total) || activityList.length || 0,

        per_page: Number(activityData?.per_page) || 15,
      });

      toast.success("Login activities refreshed.");
    } catch (error) {
      console.error("Refresh login activities failed:", error);

      toast.error(error?.message || "Failed to refresh activities.");
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
        return <span className="badge bg-success">Success</span>;

      case "failed":
        return <span className="badge bg-danger">Failed</span>;

      case "blocked":
        return <span className="badge bg-warning text-dark">Blocked</span>;

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

    return dateObject.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const handlePrevious = () => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  };

  const handleNext = () => {
    setPage((currentPage) => Math.min(pagination.last_page, currentPage + 1));
  };

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

        <div className="dashboard-content">
          {/* Header */}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1">🔐 Login Activities</h2>

              <p className="text-muted mb-0">
                Monitor user login attempts and authentication activities.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {/* Filters */}

          <div className="card border-0 shadow p-4 mt-4">
            <div className="row g-3">
              {/* Search */}

              <div className="col-md-5">
                <label className="form-label fw-semibold">Search User</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={handleSearch}
                />
              </div>

              {/* Status */}

              <div className="col-md-3">
                <label className="form-label fw-semibold">Status</label>

                <select
                  className="form-select"
                  value={status}
                  onChange={handleStatusChange}
                >
                  <option value="">All Status</option>

                  <option value="success">Success</option>

                  <option value="failed">Failed</option>

                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Date */}

              <div className="col-md-2">
                <label className="form-label fw-semibold">Date</label>

                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={handleDateChange}
                />
              </div>

              {/* Clear */}

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
              Total Activities: <strong>{pagination.total}</strong>
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
                  {/* Loading */}

                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
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
                    /* Empty */

                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No login activities found.
                      </td>
                    </tr>
                  ) : (
                    /* Data */

                    activities.map((activity, index) => (
                      <tr key={activity.id ?? `${activity.login_at}-${index}`}>
                        {/* Number */}

                        <td>
                          {(pagination.current_page - 1) * pagination.per_page +
                            index +
                            1}
                        </td>

                        {/* User */}

                        <td>
                          <div className="fw-semibold">
                            {activity.user?.name ||
                              activity.user_name ||
                              activity.name ||
                              "Unknown User"}
                          </div>

                          <small className="text-muted">
                            {activity.user?.email ||
                              activity.user_email ||
                              activity.email ||
                              "-"}
                          </small>
                        </td>

                        {/* Status */}

                        <td>{getStatusBadge(activity.status)}</td>

                        {/* IP */}

                        <td>
                          <code>
                            {activity.ip_address || activity.ip || "-"}
                          </code>
                        </td>

                        {/* User Agent */}

                        <td
                          style={{
                            maxWidth: "280px",
                          }}
                        >
                          <small
                            className="text-muted"
                            title={activity.user_agent || ""}
                          >
                            {activity.user_agent
                              ? activity.user_agent.length > 55
                                ? `${activity.user_agent.slice(0, 55)}...`
                                : activity.user_agent
                              : "-"}
                          </small>
                        </td>

                        {/* Login Time */}

                        <td>
                          <small>
                            {formatDate(
                              activity.login_at || activity.created_at,
                            )}
                          </small>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}

          {!loading && pagination.last_page > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button
                type="button"
                className="btn btn-outline-primary"
                disabled={page <= 1}
                onClick={handlePrevious}
              >
                ← Previous
              </button>

              <span className="fw-semibold">
                Page {pagination.current_page} of {pagination.last_page}
              </span>

              <button
                type="button"
                className="btn btn-outline-primary"
                disabled={page >= pagination.last_page}
                onClick={handleNext}
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
