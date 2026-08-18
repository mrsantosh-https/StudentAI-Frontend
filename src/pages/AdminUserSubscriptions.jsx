import {
  useCallback,
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

export default function AdminUserSubscriptions() {
  const navigate = useNavigate();

  // =========================================================
  // State
  // =========================================================

  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState("");
  const [subscriptionAction, setSubscriptionAction] =
    useState("assign");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  // =========================================================
  // Fetch Plans
  // =========================================================

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);

      const response = await api.get(
        "/admin/subscriptions"
      );

      const data = response.data || {};

      const plansData =
        data.plans ||
        data.data ||
        [];

      setPlans(
        Array.isArray(plansData)
          ? plansData
          : []
      );
    } catch (error) {
      console.error(
        "Plans fetch error:",
        error.response?.data || error
      );

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
          "Subscription plans load nahi ho sake."
      );
    } finally {
      setPlansLoading(false);
    }
  }, [navigate]);

  // =========================================================
  // Fetch Users
  // =========================================================

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
        };

        const cleanSearch = search.trim();

        if (cleanSearch) {
          params.search = cleanSearch;
        }

        if (statusFilter !== "all") {
          params.subscription_status =
            statusFilter;
        }

        const response = await api.get(
          "/admin/user-subscriptions",
          {
            params,
          }
        );

        const data = response.data || {};

        const usersData =
          data.users ||
          data.data ||
          {};

        const usersList =
          Array.isArray(usersData)
            ? usersData
            : Array.isArray(usersData.data)
            ? usersData.data
            : [];

        setUsers(usersList);

        if (
          usersData &&
          !Array.isArray(usersData)
        ) {
          setPagination({
            currentPage:
              Number(
                usersData.current_page
              ) || page,

            lastPage:
              Number(
                usersData.last_page
              ) || 1,

            total:
              Number(
                usersData.total
              ) || usersList.length,
          });
        } else {
          setPagination({
            currentPage: page,
            lastPage: 1,
            total: usersList.length,
          });
        }
      } catch (error) {
        console.error(
          "User subscriptions fetch error:",
          error.response?.data || error
        );

        setUsers([]);

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

        const message =
          error.response?.data?.message ||
          "User subscriptions load nahi ho sake.";

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [
      search,
      statusFilter,
      navigate,
    ]
  );

  // =========================================================
  // Initial Load
  // =========================================================
  // Delayed callback avoids React hooks
  // set-state-in-effect warning.
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPlans();
      void fetchUsers(1);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchPlans, fetchUsers]);

  // =========================================================
  // Filter Users
  // =========================================================

  const filteredUsers = useMemo(() => {
    const cleanSearch =
      search.trim().toLowerCase();

    return users.filter((user) => {
      if (!cleanSearch) {
        return true;
      }

      const name = String(
        user.name || ""
      ).toLowerCase();

      const email = String(
        user.email || ""
      ).toLowerCase();

      const id = String(
        user.id || ""
      ).toLowerCase();

      return (
        name.includes(cleanSearch) ||
        email.includes(cleanSearch) ||
        id.includes(cleanSearch)
      );
    });
  }, [users, search]);

  // =========================================================
  // Stats
  // =========================================================

  const stats = useMemo(() => {
    const total = users.length;

    const active = users.filter(
      (user) =>
        user.subscription &&
        (
          user.subscription.is_active === true ||
          user.subscription.status === "active"
        )
    ).length;

    const inactive =
      total - active;

    return {
      total,
      active,
      inactive,
    };
  }, [users]);

  // =========================================================
  // Get User Subscription
  // =========================================================

  const getSubscription = (user) => {
    return (
      user?.subscription ||
      user?.active_subscription ||
      user?.current_subscription ||
      null
    );
  };

  // =========================================================
  // Get Plan
  // =========================================================

  const getUserPlan = (user) => {
    const subscription =
      getSubscription(user);

    if (!subscription) {
      return null;
    }

    return (
      subscription.plan ||
      subscription.subscription_plan ||
      null
    );
  };

  // =========================================================
  // Open Manage Modal
  // =========================================================

  const openManageModal = (user) => {
    const subscription =
      getSubscription(user);

    const userPlan =
      getUserPlan(user);

    setSelectedUser(user);

    setSelectedPlan(
      userPlan?.id
        ? String(userPlan.id)
        : ""
    );

    setSubscriptionAction(
      subscription
        ? "change"
        : "assign"
    );
  };

  // =========================================================
  // Close Modal
  // =========================================================

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setSelectedUser(null);
    setSelectedPlan("");
    setSubscriptionAction("assign");
  };

  // =========================================================
  // Refresh
  // =========================================================

  const refreshData = useCallback(
    async () => {
      await Promise.all([
        fetchPlans(),
        fetchUsers(
          pagination.currentPage
        ),
      ]);
    },
    [
      fetchPlans,
      fetchUsers,
      pagination.currentPage,
    ]
  );

  // =========================================================
  // Assign / Change Subscription
  // =========================================================

  const handleSaveSubscription =
    async (event) => {
      event.preventDefault();

      if (!selectedUser) {
        toast.error("User select karo.");
        return;
      }

      if (!selectedPlan) {
        toast.error("Subscription plan select karo.");
        return;
      }

      try {
        setActionLoading(true);

        const response = await api.post(
          `/admin/users/${selectedUser.id}/subscription`,
          {
            plan_id: Number(selectedPlan),
          }
        );

        toast.success(
          response.data?.message ||
            (
              subscriptionAction === "change"
                ? "Subscription changed successfully."
                : "Subscription assigned successfully."
            )
        );

        closeModal();

        await fetchUsers(
          pagination.currentPage
        );
      } catch (error) {
        console.error(
          "Subscription save error:",
          error.response?.data || error
        );

        if (error.response?.status === 401) {
          toast.error(
            "Please login again."
          );
          navigate("/login");
          return;
        }

        if (error.response?.status === 403) {
          toast.error(
            "Admin access required."
          );
          navigate("/dashboard");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Subscription save nahi ho saki."
        );
      } finally {
        setActionLoading(false);
      }
    };

  // =========================================================
  // Cancel Subscription
  // =========================================================

  const handleCancelSubscription =
    async (user) => {
      const subscription =
        getSubscription(user);

      if (!subscription) {
        toast.error(
          "Is user ki active subscription nahi hai."
        );
        return;
      }

      const result =
        await Swal.fire({
          icon: "warning",

          title:
            "Cancel Subscription?",

          text:
            `${user.name || "User"} ki subscription cancel karni hai?`,

          showCancelButton: true,

          confirmButtonText:
            "Yes, Cancel",

          cancelButtonText:
            "Keep Subscription",

          confirmButtonColor:
            "#dc2626",

          cancelButtonColor:
            "#64748b",

          reverseButtons: true,
        });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setActionLoading(true);

        const subscriptionId =
          subscription.id;

        const response =
          await api.patch(
            `/admin/user-subscriptions/${subscriptionId}/cancel`
          );

        toast.success(
          response.data?.message ||
            "Subscription cancelled successfully."
        );

        await fetchUsers(
          pagination.currentPage
        );
      } catch (error) {
        console.error(
          "Cancel subscription error:",
          error.response?.data || error
        );

        if (
          error.response?.status === 401
        ) {
          toast.error(
            "Please login again."
          );
          navigate("/login");
          return;
        }

        if (
          error.response?.status === 403
        ) {
          toast.error(
            "Admin access required."
          );
          navigate("/dashboard");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Subscription cancel nahi ho saki."
        );
      } finally {
        setActionLoading(false);
      }
    };

  // =========================================================
  // Delete Subscription
  // =========================================================

  const handleDeleteSubscription =
    async (user) => {
      const subscription =
        getSubscription(user);

      if (!subscription) {
        toast.error(
          "Subscription nahi mili."
        );
        return;
      }

      const result =
        await Swal.fire({
          icon: "warning",

          title:
            "Delete Subscription?",

          html: `
            <div style="text-align:center">
              <p>
                <strong>
                  ${user.name || "User"}
                </strong>
                ki subscription permanently delete ho jayegi.
              </p>

              <p style="
                color:#dc2626;
                font-weight:600;
                margin-bottom:0;
              ">
                This action cannot be undone.
              </p>
            </div>
          `,

          showCancelButton: true,

          confirmButtonText:
            "Yes, Delete",

          cancelButtonText:
            "Cancel",

          confirmButtonColor:
            "#dc2626",

          cancelButtonColor:
            "#64748b",

          reverseButtons: true,
        });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setActionLoading(true);

        const subscriptionId =
          subscription.id;

        const response =
          await api.delete(
            `/admin/user-subscriptions/${subscriptionId}`
          );

        toast.success(
          response.data?.message ||
            "Subscription deleted successfully."
        );

        await fetchUsers(
          pagination.currentPage
        );
      } catch (error) {
        console.error(
          "Delete subscription error:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.message ||
            "Subscription delete nahi ho saki."
        );
      } finally {
        setActionLoading(false);
      }
    };

  // =========================================================
  // Format Date
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date =
      new Date(value);

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

  // =========================================================
  // Format Price
  // =========================================================

  const formatPrice = (value) => {
    const price =
      Number(value);

    if (
      !Number.isFinite(price) ||
      price === 0
    ) {
      return "Free";
    }

    return `₹${price.toLocaleString(
      "en-IN"
    )}`;
  };

  // =========================================================
  // Subscription Status
  // =========================================================

  const getSubscriptionStatus =
    (user) => {
      const subscription =
        getSubscription(user);

      if (!subscription) {
        return "none";
      }

      if (
        subscription.status ===
        "cancelled"
      ) {
        return "cancelled";
      }

      if (
        subscription.is_active ===
        false
      ) {
        return "inactive";
      }

      return "active";
    };

  // =========================================================
  // Status Badge
  // =========================================================

  const renderStatusBadge =
    (user) => {
      const status =
        getSubscriptionStatus(
          user
        );

      if (status === "active") {
        return (
          <span className="badge bg-success">
            Active
          </span>
        );
      }

      if (
        status === "cancelled"
      ) {
        return (
          <span className="badge bg-danger">
            Cancelled
          </span>
        );
      }

      if (
        status === "inactive"
      ) {
        return (
          <span className="badge bg-secondary">
            Inactive
          </span>
        );
      }

      return (
        <span className="badge bg-warning text-dark">
          No Subscription
        </span>
      );
    };

  // =========================================================
  // Reset Filters
  // =========================================================

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">

          {/* ===================================================
              HEADER
          =================================================== */}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

            <div>
              <h2 className="fw-bold mb-1">
                💳 User Subscriptions
              </h2>

              <p className="text-muted mb-0">
                Manage user subscriptions,
                plans and subscription status.
              </p>
            </div>

            <div className="d-flex gap-2">

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

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() =>
                  void refreshData()
                }
                disabled={
                  loading ||
                  plansLoading ||
                  actionLoading
                }
              >
                🔄 Refresh
              </button>

            </div>

          </div>

          {/* ===================================================
              STATS
          =================================================== */}

          <div className="row g-4 mb-4">

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <p className="text-muted mb-2">
                        Total Users
                      </p>

                      <h2 className="fw-bold mb-0">
                        {pagination.total ||
                          stats.total}
                      </h2>
                    </div>

                    <div
                      style={{
                        fontSize: "34px",
                      }}
                    >
                      👥
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <p className="text-muted mb-2">
                        Active Subscriptions
                      </p>

                      <h2 className="fw-bold text-success mb-0">
                        {stats.active}
                      </h2>
                    </div>

                    <div
                      style={{
                        fontSize: "34px",
                      }}
                    >
                      ✅
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <p className="text-muted mb-2">
                        No / Inactive Subscription
                      </p>

                      <h2 className="fw-bold text-warning mb-0">
                        {stats.inactive}
                      </h2>
                    </div>

                    <div
                      style={{
                        fontSize: "34px",
                      }}
                    >
                      ⏸️
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ===================================================
              FILTERS
          =================================================== */}

          <div className="card border-0 shadow-sm mb-4">

            <div className="card-body">

              <div className="row g-3">

                <div className="col-lg-7">

                  <label className="form-label fw-semibold">
                    Search Users
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, email or ID..."
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="col-lg-3">

                  <label className="form-label fw-semibold">
                    Subscription Status
                  </label>

                  <select
                    className="form-select"
                    value={
                      statusFilter
                    }
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                  >

                    <option value="all">
                      All Users
                    </option>

                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>

                    <option value="none">
                      No Subscription
                    </option>

                  </select>

                </div>

                <div className="col-lg-2 d-flex align-items-end">

                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={
                      resetFilters
                    }
                  >
                    Reset
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">

              <span>
                {error}
              </span>

              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() =>
                  void fetchUsers(
                    pagination.currentPage
                  )
                }
              >
                Retry
              </button>

            </div>
          )}

          {/* ===================================================
              USER TABLE
          =================================================== */}

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">

                <div>
                  <h4 className="fw-bold mb-1">
                    👥 User Subscription Management
                  </h4>

                  <p className="text-muted mb-0">
                    {filteredUsers.length} user(s)
                    displayed.
                  </p>
                </div>

                <div className="d-flex gap-2">

                  <span className="badge bg-primary d-flex align-items-center">
                    {pagination.total} Users
                  </span>

                </div>

              </div>

              {/* Loading */}

              {loading ? (
                <div className="text-center py-5">

                  <div
                    className="spinner-border text-primary"
                    role="status"
                  />

                  <p className="text-muted mt-3 mb-0">
                    Loading user subscriptions...
                  </p>

                </div>
              ) : filteredUsers.length ===
                0 ? (
                <div className="text-center py-5">

                  <div
                    style={{
                      fontSize: "48px",
                    }}
                  >
                    👥
                  </div>

                  <h5 className="mt-3">
                    No Users Found
                  </h5>

                  <p className="text-muted">
                    Search ya filters change karo.
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={
                      resetFilters
                    }
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

                        <th>
                          User
                        </th>

                        <th>
                          Current Plan
                        </th>

                        <th>
                          Price
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Start Date
                        </th>

                        <th>
                          End Date
                        </th>

                        <th className="text-end">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filteredUsers.map(
                        (user, index) => {
                          const subscription =
                            getSubscription(
                              user
                            );

                          const plan =
                            getUserPlan(
                              user
                            );

                          return (
                            <tr
                              key={
                                user.id
                              }
                            >

                              {/* Number */}

                              <td>
                                {(
                                  (
                                    pagination.currentPage -
                                    1
                                  ) *
                                    10
                                ) +
                                  index +
                                  1}
                              </td>

                              {/* User */}

                              <td>

                                <div className="d-flex align-items-center gap-2">

                                  <div
                                    className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                                    style={{
                                      width:
                                        "40px",
                                      height:
                                        "40px",
                                      minWidth:
                                        "40px",
                                      fontWeight:
                                        "700",
                                    }}
                                  >
                                    {String(
                                      user.name ||
                                        "U"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div>

                                    <strong>
                                      {user.name ||
                                        "N/A"}
                                    </strong>

                                    <small className="d-block text-muted">
                                      {user.email ||
                                        "N/A"}
                                    </small>

                                    <small className="d-block text-muted">
                                      ID #
                                      {user.id}
                                    </small>

                                  </div>

                                </div>

                              </td>

                              {/* Plan */}

                              <td>

                                {plan ? (
                                  <div>

                                    <strong>
                                      {plan.name ||
                                        "Unnamed Plan"}
                                    </strong>

                                    <small className="d-block text-muted">
                                      {plan.slug ||
                                        ""}
                                    </small>

                                  </div>
                                ) : (
                                  <span className="text-muted">
                                    No Plan
                                  </span>
                                )}

                              </td>

                              {/* Price */}

                              <td>

                                {plan ? (
                                  <div>

                                    <strong className="text-primary">
                                      {formatPrice(
                                        plan.price
                                      )}
                                    </strong>

                                    {Number(
                                      plan.price
                                    ) >
                                      0 && (
                                      <small className="d-block text-muted">
                                        per{" "}
                                        {plan.billing_period ||
                                          "month"}
                                      </small>
                                    )}

                                  </div>
                                ) : (
                                  "—"
                                )}

                              </td>

                              {/* Status */}

                              <td>
                                {renderStatusBadge(
                                  user
                                )}
                              </td>

                              {/* Start Date */}

                              <td>
                                {formatDate(
                                  subscription?.starts_at ||
                                    subscription?.start_date ||
                                    subscription?.created_at
                                )}
                              </td>

                              {/* End Date */}

                              <td>
                                {formatDate(
                                  subscription?.ends_at ||
                                    subscription?.end_date ||
                                    subscription?.expires_at
                                )}
                              </td>

                              {/* Actions */}

                              <td>

                                <div className="d-flex justify-content-end gap-2 flex-wrap">

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      openManageModal(
                                        user
                                      )
                                    }
                                    disabled={
                                      actionLoading
                                    }
                                  >
                                    {plan
                                      ? "✏️ Manage"
                                      : "➕ Assign"}
                                  </button>

                                  {subscription && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() =>
                                        void handleCancelSubscription(
                                          user
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                    >
                                      ⏸ Cancel
                                    </button>
                                  )}

                                  {subscription && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() =>
                                        void handleDeleteSubscription(
                                          user
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                    >
                                      🗑 Delete
                                    </button>
                                  )}

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

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {!loading &&
                filteredUsers.length >
                  0 && (
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">

                    <span className="text-muted">
                      Page{" "}
                      {
                        pagination.currentPage
                      }{" "}
                      of{" "}
                      {
                        pagination.lastPage
                      }
                    </span>

                    <div className="d-flex gap-2">

                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        disabled={
                          pagination.currentPage <=
                            1 ||
                          loading
                        }
                        onClick={() =>
                          void fetchUsers(
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
                          loading
                        }
                        onClick={() =>
                          void fetchUsers(
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

        </div>
      </main>

      {/* =========================================================
          MANAGE SUBSCRIPTION MODAL
      ========================================================= */}

      {selectedUser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background:
              "rgba(15, 23, 42, 0.68)",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={
            closeModal
          }
        >

          <div
            className="card border-0 shadow-lg"
            style={{
              width:
                "min(650px, 100%)",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="card-header bg-white border-0 p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <h4 className="fw-bold mb-1">
                    💳 Manage Subscription
                  </h4>

                  <p className="text-muted mb-0">
                    {selectedUser.name ||
                      "User"}
                  </p>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={
                    closeModal
                  }
                  disabled={
                    actionLoading
                  }
                />

              </div>

            </div>

            {/* Modal Body */}

            <form
              onSubmit={
                handleSaveSubscription
              }
            >

              <div className="card-body p-4">

                {/* User */}

                <div className="alert alert-light border">

                  <div className="d-flex justify-content-between">

                    <div>

                      <strong>
                        User
                      </strong>

                      <div>
                        {selectedUser.name ||
                          "N/A"}
                      </div>

                    </div>

                    <div>

                      <strong>
                        Email
                      </strong>

                      <div>
                        {selectedUser.email ||
                          "N/A"}
                      </div>

                    </div>

                  </div>

                </div>

                {/* Action */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Action
                  </label>

                  <select
                    className="form-select"
                    value={
                      subscriptionAction
                    }
                    onChange={(event) =>
                      setSubscriptionAction(
                        event.target.value
                      )
                    }
                    disabled={
                      actionLoading
                    }
                  >

                    <option value="assign">
                      Assign Subscription
                    </option>

                    <option value="change">
                      Change Subscription
                    </option>

                  </select>

                </div>

                {/* Plan */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Subscription Plan *
                  </label>

                  {plansLoading ? (
                    <div className="text-muted">
                      Loading plans...
                    </div>
                  ) : plans.length ===
                    0 ? (
                    <div className="alert alert-warning">
                      No subscription plans
                      available.
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={
                        selectedPlan
                      }
                      onChange={(event) =>
                        setSelectedPlan(
                          event.target.value
                        )
                      }
                      disabled={
                        actionLoading
                      }
                      required
                    >

                      <option value="">
                        Select a plan
                      </option>

                      {plans
                        .filter(
                          (plan) =>
                            plan.is_active !==
                            false
                        )
                        .map(
                          (plan) => (
                            <option
                              key={
                                plan.id
                              }
                              value={
                                plan.id
                              }
                            >
                              {plan.name} -{" "}
                              {formatPrice(
                                plan.price
                              )}{" "}
                              /{" "}
                              {plan.billing_period ||
                                "monthly"}
                            </option>
                          )
                        )}

                    </select>
                  )}

                </div>

                {/* Selected Plan Preview */}

                {selectedPlan && (
                  <div className="alert alert-primary">

                    {plans
                      .filter(
                        (plan) =>
                          String(
                            plan.id
                          ) ===
                          String(
                            selectedPlan
                          )
                      )
                      .map(
                        (plan) => (
                          <div
                            key={
                              plan.id
                            }
                          >

                            <h6 className="fw-bold">
                              {plan.name}
                            </h6>

                            <div className="mb-2">
                              {plan.description ||
                                "No description"}
                            </div>

                            <div className="d-flex gap-3 flex-wrap">

                              <span>
                                📄 Resume:{" "}
                                {plan.resume_limit ??
                                  "∞"}
                              </span>

                              <span>
                                🤖 AI:{" "}
                                {plan.ai_usage_limit ??
                                  "∞"}
                              </span>

                              <span>
                                🎤 Interview:{" "}
                                {plan.interview_limit ??
                                  "∞"}
                              </span>

                              <span>
                                💼 Jobs:{" "}
                                {plan.job_tracker_limit ??
                                  "∞"}
                              </span>

                            </div>

                          </div>
                        )
                      )}

                  </div>
                )}

              </div>

              {/* Modal Footer */}

              <div className="card-footer bg-white border-0 p-4">

                <div className="d-flex justify-content-end gap-2">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      closeModal
                    }
                    disabled={
                      actionLoading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      actionLoading ||
                      plansLoading ||
                      plans.length ===
                        0
                    }
                  >
                    {actionLoading
                      ? "Saving..."
                      : subscriptionAction ===
                        "change"
                      ? "Change Plan"
                      : "Assign Plan"}
                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}