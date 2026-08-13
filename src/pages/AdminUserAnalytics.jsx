import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

export default function AdminUserAnalytics() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_users: 0,
    normal_users: 0,
    admin_users: 0,
    today_users: 0,
    week_users: 0,
    month_users: 0,
  });

  const [registrationChart, setRegistrationChart] =
    useState([]);

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const [actionUserId, setActionUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  /*
  |--------------------------------------------------------------------------
  | Fetch Analytics
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          "/admin/user-analytics"
        );

        if (!isMounted) return;

        const data = response.data || {};

        setStats({
          total_users:
            Number(data.stats?.total_users) || 0,

          normal_users:
            Number(data.stats?.normal_users) || 0,

          admin_users:
            Number(data.stats?.admin_users) || 0,

          today_users:
            Number(data.stats?.today_users) || 0,

          week_users:
            Number(data.stats?.week_users) || 0,

          month_users:
            Number(data.stats?.month_users) || 0,
        });

        setRegistrationChart(
          Array.isArray(data.registration_chart)
            ? data.registration_chart
            : []
        );
      } catch (error) {
        console.error(
          "Analytics error:",
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
            "Analytics load failed."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Users
  |--------------------------------------------------------------------------
  */

  const fetchUsers = async (page = 1) => {
    try {
      setUsersLoading(true);

      const params = {
        page,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await api.get(
        "/admin/users",
        {
          params,
        }
      );

      const usersData =
        response.data?.users || {};

      setUsers(
        Array.isArray(usersData.data)
          ? usersData.data
          : []
      );

      setPagination({
        currentPage:
          Number(usersData.current_page) || 1,

        lastPage:
          Number(usersData.last_page) || 1,

        total:
          Number(usersData.total) || 0,
      });
    } catch (error) {
      console.error(
        "Users fetch error:",
        error.response?.data || error
      );

      setUsers([]);

      toast.error(
        error.response?.data?.message ||
          "Users load nahi ho sake."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Search / Filters Auto Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [search, roleFilter, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | Refresh Current Page
  |--------------------------------------------------------------------------
  */

  const refreshUsers = async () => {
    await fetchUsers(
      pagination.currentPage
    );
  };

  /*
  |--------------------------------------------------------------------------
  | View User
  |--------------------------------------------------------------------------
  */

  const handleViewUser = async (userId) => {
    try {
      setActionUserId(userId);

      const response = await api.get(
        `/admin/users/${userId}`
      );

      const userData =
        response.data?.user ||
        response.data?.data ||
        null;

      if (!userData) {
        throw new Error(
          "User details not received."
        );
      }

      setSelectedUser(userData);
    } catch (error) {
      console.error(
        "View user error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "User details load nahi hui."
      );
    } finally {
      setActionUserId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Block / Unblock User
  |--------------------------------------------------------------------------
  */

  const handleBlockToggle = async (user) => {
    const isBlocked =
      Boolean(user?.is_blocked);

    const result = await Swal.fire({
      icon: isBlocked
        ? "question"
        : "warning",

      title: isBlocked
        ? "Unblock User?"
        : "Block User?",

      text: isBlocked
        ? `${user.name} ko account access wapas mil jayega.`
        : `${user.name} account access nahi kar payega.`,

      showCancelButton: true,

      confirmButtonText: isBlocked
        ? "Yes, Unblock"
        : "Yes, Block",

      cancelButtonText: "Cancel",

      confirmButtonColor: isBlocked
        ? "#16a34a"
        : "#f59e0b",

      cancelButtonColor: "#64748b",

      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionUserId(user.id);

      const endpoint = isBlocked
        ? `/admin/users/${user.id}/unblock`
        : `/admin/users/${user.id}/block`;

      const response =
        await api.patch(endpoint);

      toast.success(
        response.data?.message ||
          (isBlocked
            ? "User unblocked successfully."
            : "User blocked successfully.")
      );

      await refreshUsers();
    } catch (error) {
      console.error(
        "Block/unblock error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "User status update failed."
      );
    } finally {
      setActionUserId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Change Role
  |--------------------------------------------------------------------------
  */

  const handleRoleChange = async (
    user,
    nextRole
  ) => {
    if (
      !nextRole ||
      user.role === nextRole
    ) {
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Change Role?",
      text: `${user.name} ka role "${nextRole}" karna hai?`,
      showCancelButton: true,
      confirmButtonText: "Change Role",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionUserId(user.id);

      const response = await api.patch(
        `/admin/users/${user.id}/role`,
        {
          role: nextRole,
        }
      );

      toast.success(
        response.data?.message ||
          "User role updated successfully."
      );

      await refreshUsers();
    } catch (error) {
      console.error(
        "Role update error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Role update failed."
      );

      await refreshUsers();
    } finally {
      setActionUserId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete User
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete User?",
      html: `
        <div style="text-align:center">
          <p>
            <strong>${user.name}</strong>
            permanently delete ho jayega.
          </p>

          <p style="
            margin:0;
            color:#dc2626;
            font-weight:600;
          ">
            This action cannot be undone.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Delete User",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionUserId(user.id);

      const response = await api.delete(
        `/admin/users/${user.id}`
      );

      toast.success(
        response.data?.message ||
          "User deleted successfully."
      );

      /*
       * Agar current page ka last user delete ho gaya
       * to previous page par le jao.
       */
      if (
        users.length === 1 &&
        pagination.currentPage > 1
      ) {
        await fetchUsers(
          pagination.currentPage - 1
        );
      } else {
        await refreshUsers();
      }
    } catch (error) {
      console.error(
        "Delete user error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "User delete failed."
      );
    } finally {
      setActionUserId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reset Filters
  |--------------------------------------------------------------------------
  */

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  /*
  |--------------------------------------------------------------------------
  | Format Date
  |--------------------------------------------------------------------------
  */

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "N/A";
    }

    return date.toLocaleString(
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

  /*
  |--------------------------------------------------------------------------
  | Chart Maximum
  |--------------------------------------------------------------------------
  */

  const maxUsers = useMemo(
    () =>
      Math.max(
        ...registrationChart.map(
          (item) =>
            Number(item.users) || 0
        ),
        1
      ),
    [registrationChart]
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

        <div className="dashboard-content">
          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h2 className="fw-bold mb-1">
                👥 User Management
              </h2>

              <p className="text-muted mb-0">
                Manage users, roles, access and
                StudentAI registrations.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                navigate("/admin/dashboard")
              }
            >
              ← Admin Dashboard
            </button>
          </div>

          {/* =====================================================
              ANALYTICS LOADING
          ===================================================== */}

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
                aria-hidden="true"
              />

              <p className="text-muted mt-3">
                Loading analytics...
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  ANALYTICS CARDS
              ================================================= */}

              <div className="row g-4">
                {[
                  {
                    icon: "👥",
                    title: "Total Users",
                    value: stats.total_users,
                  },
                  {
                    icon: "👤",
                    title: "Normal Users",
                    value: stats.normal_users,
                  },
                  {
                    icon: "🛡️",
                    title: "Admins",
                    value: stats.admin_users,
                  },
                  {
                    icon: "🆕",
                    title: "Today",
                    value: stats.today_users,
                  },
                  {
                    icon: "📅",
                    title: "This Week",
                    value: stats.week_users,
                  },
                  {
                    icon: "📈",
                    title: "This Month",
                    value: stats.month_users,
                  },
                ].map((item) => (
                  <div
                    className="col-md-6 col-xl-4"
                    key={item.title}
                  >
                    <div className="card border-0 shadow-sm p-4 h-100">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p className="text-muted mb-2">
                            {item.title}
                          </p>

                          <h2 className="fw-bold mb-0">
                            {item.value}
                          </h2>
                        </div>

                        <div
                          style={{
                            fontSize: "36px",
                          }}
                        >
                          {item.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* =================================================
                  REGISTRATION CHART
              ================================================= */}

              <div className="card border-0 shadow-sm p-4 mt-4">
                <div className="mb-4">
                  <h4 className="fw-bold mb-1">
                    📊 User Registration Growth
                  </h4>

                  <p className="text-muted mb-0">
                    New registrations during the last
                    7 days.
                  </p>
                </div>

                {registrationChart.length === 0 ? (
                  <p className="text-muted mb-0">
                    No registration data available.
                  </p>
                ) : (
                  <div
                    className="d-flex align-items-end gap-3"
                    style={{
                      minHeight: "220px",
                      overflowX: "auto",
                    }}
                  >
                    {registrationChart.map(
                      (item) => {
                        const count =
                          Number(item.users) || 0;

                        const height =
                          count === 0
                            ? 8
                            : Math.max(
                                (count /
                                  maxUsers) *
                                  160,
                                20
                              );

                        return (
                          <div
                            key={item.date}
                            className="text-center flex-fill"
                            style={{
                              minWidth: "60px",
                            }}
                          >
                            <div className="fw-bold mb-2">
                              {count}
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
                                {item.day}
                              </strong>

                              <div
                                className="text-muted"
                                style={{
                                  fontSize: "10px",
                                }}
                              >
                                {item.date}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* =================================================
                  USER MANAGEMENT
              ================================================= */}

              <div className="card border-0 shadow-sm p-4 mt-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                  <div>
                    <h4 className="fw-bold mb-1">
                      👥 Manage Users
                    </h4>

                    <p className="text-muted mb-0">
                      Search, view, block, delete and
                      manage roles.
                    </p>
                  </div>

                  <span className="badge bg-primary">
                    {pagination.total} Users
                  </span>
                </div>

                {/* =============================================
                    SEARCH / FILTER
                ============================================= */}

                <div className="row g-3 mb-4">
                  <div className="col-lg-5">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or email..."
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="col-lg-2">
                    <select
                      className="form-select"
                      value={roleFilter}
                      onChange={(event) =>
                        setRoleFilter(
                          event.target.value
                        )
                      }
                    >
                      <option value="all">
                        All Roles
                      </option>

                      <option value="user">
                        User
                      </option>

                      <option value="admin">
                        Admin
                      </option>
                    </select>
                  </div>

                  <div className="col-lg-3">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(
                          event.target.value
                        )
                      }
                    >
                      <option value="all">
                        All Status
                      </option>

                      <option value="active">
                        Active
                      </option>

                      <option value="blocked">
                        Blocked
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
                        roleFilter === "all" &&
                        statusFilter === "all"
                      }
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* =============================================
                    USERS
                ============================================= */}

                {usersLoading ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    />

                    <p className="text-muted mt-3 mb-0">
                      Loading users...
                    </p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      style={{
                        fontSize: "42px",
                      }}
                    >
                      🔍
                    </div>

                    <h5 className="mt-2">
                      No Users Found
                    </h5>

                    <p className="text-muted">
                      Search ya filters change karo.
                    </p>

                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={resetFilters}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {users.map(
                          (user, index) => {
                            const busy =
                              actionUserId ===
                              user.id;

                            return (
                              <tr key={user.id}>
                                <td>
                                  {(pagination.currentPage -
                                    1) *
                                    10 +
                                    index +
                                    1}
                                </td>

                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div
                                      className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                                      style={{
                                        width: "38px",
                                        height: "38px",
                                        minWidth:
                                          "38px",
                                        fontWeight:
                                          "700",
                                      }}
                                    >
                                      {String(
                                        user.name ||
                                          "U"
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>

                                    <div>
                                      <strong>
                                        {user.name ||
                                          "N/A"}
                                      </strong>

                                      <div
                                        className="text-muted"
                                        style={{
                                          fontSize:
                                            "11px",
                                        }}
                                      >
                                        ID #{user.id}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td>
                                  {user.email ||
                                    "N/A"}
                                </td>

                                <td>
                                  <select
                                    className="form-select form-select-sm"
                                    style={{
                                      minWidth:
                                        "100px",
                                    }}
                                    value={
                                      user.role ||
                                      "user"
                                    }
                                    disabled={busy}
                                    onChange={(
                                      event
                                    ) =>
                                      handleRoleChange(
                                        user,
                                        event.target
                                          .value
                                      )
                                    }
                                  >
                                    <option value="user">
                                      User
                                    </option>

                                    <option value="admin">
                                      Admin
                                    </option>
                                  </select>
                                </td>

                                <td>
                                  <span
                                    className={`badge ${
                                      user.is_blocked
                                        ? "bg-danger"
                                        : "bg-success"
                                    }`}
                                  >
                                    {user.is_blocked
                                      ? "Blocked"
                                      : "Active"}
                                  </span>
                                </td>

                                <td>
                                  {formatDate(
                                    user.created_at
                                  )}
                                </td>

                                <td>
                                  <div className="d-flex gap-2 flex-wrap">
                                    {/* View */}

                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary"
                                      disabled={busy}
                                      onClick={() =>
                                        handleViewUser(
                                          user.id
                                        )
                                      }
                                    >
                                      {busy
                                        ? "..."
                                        : "👁 View"}
                                    </button>

                                    {/* Block / Unblock */}

                                    <button
                                      type="button"
                                      className={`btn btn-sm ${
                                        user.is_blocked
                                          ? "btn-success"
                                          : "btn-warning"
                                      }`}
                                      disabled={busy}
                                      onClick={() =>
                                        handleBlockToggle(
                                          user
                                        )
                                      }
                                    >
                                      {busy
                                        ? "Processing..."
                                        : user.is_blocked
                                        ? "🔓 Unblock"
                                        : "🚫 Block"}
                                    </button>

                                    {/* Delete */}

                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      disabled={busy}
                                      onClick={() =>
                                        handleDelete(
                                          user
                                        )
                                      }
                                    >
                                      {busy
                                        ? "..."
                                        : "🗑 Delete"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* =============================================
                    PAGINATION
                ============================================= */}

                {!usersLoading &&
                  users.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">
                      <span className="text-muted">
                        Page{" "}
                        {pagination.currentPage} of{" "}
                        {pagination.lastPage}
                      </span>

                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          disabled={
                            pagination.currentPage <=
                              1 ||
                            usersLoading
                          }
                          onClick={() =>
                            fetchUsers(
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
                              pagination.lastPage ||
                            usersLoading
                          }
                          onClick={() =>
                            fetchUsers(
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
            </>
          )}
        </div>
      </main>

      {/* =====================================================
          USER DETAILS MODAL
      ===================================================== */}

      {selectedUser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background:
              "rgba(15, 23, 42, 0.68)",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() =>
            setSelectedUser(null)
          }
        >
          <div
            className="card border-0 shadow-lg p-4"
            style={{
              width: "min(540px, 100%)",
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
                  👤 User Details
                </h4>

                <p className="text-muted mb-0">
                  Account information
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setSelectedUser(null)
                }
              />
            </div>

            <hr />

            <div className="mb-3">
              <strong>Name</strong>

              <p className="text-muted mb-0">
                {selectedUser.name ||
                  "N/A"}
              </p>
            </div>

            <div className="mb-3">
              <strong>Email</strong>

              <p className="text-muted mb-0">
                {selectedUser.email ||
                  "N/A"}
              </p>
            </div>

            <div className="mb-3">
              <strong>Phone</strong>

              <p className="text-muted mb-0">
                {selectedUser.phone ||
                  "N/A"}
              </p>
            </div>

            <div className="mb-3">
              <strong>Role</strong>

              <p className="mb-0">
                <span
                  className={`badge ${
                    selectedUser.role ===
                    "admin"
                      ? "bg-danger"
                      : "bg-primary"
                  }`}
                >
                  {selectedUser.role ||
                    "user"}
                </span>
              </p>
            </div>

            <div className="mb-3">
              <strong>Status</strong>

              <p className="mb-0">
                <span
                  className={`badge ${
                    selectedUser.is_blocked
                      ? "bg-danger"
                      : "bg-success"
                  }`}
                >
                  {selectedUser.is_blocked
                    ? "Blocked"
                    : "Active"}
                </span>
              </p>
            </div>

            {selectedUser.blocked_at && (
              <div className="mb-3">
                <strong>
                  Blocked At
                </strong>

                <p className="text-muted mb-0">
                  {formatDate(
                    selectedUser.blocked_at
                  )}
                </p>
              </div>
            )}

            <div className="mb-3">
              <strong>
                Joined
              </strong>

              <p className="text-muted mb-0">
                {formatDate(
                  selectedUser.created_at
                )}
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap mt-3">
              <button
                type="button"
                className={`btn ${
                  selectedUser.is_blocked
                    ? "btn-success"
                    : "btn-warning"
                }`}
                onClick={async () => {
                  await handleBlockToggle(
                    selectedUser
                  );

                  setSelectedUser(null);
                }}
              >
                {selectedUser.is_blocked
                  ? "🔓 Unblock User"
                  : "🚫 Block User"}
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  await handleDelete(
                    selectedUser
                  );

                  setSelectedUser(null);
                }}
              >
                🗑 Delete User
              </button>

              <button
                type="button"
                className="btn btn-secondary ms-auto"
                onClick={() =>
                  setSelectedUser(null)
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