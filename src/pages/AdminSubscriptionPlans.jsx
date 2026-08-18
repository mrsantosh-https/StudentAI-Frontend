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

// =========================================================
// DEFAULT FORM
// =========================================================

const DEFAULT_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  billing_period: "monthly",
  resume_limit: 5,
  ai_usage_limit: 20,
  interview_limit: 5,
  job_tracker_limit: 20,
  features: "",
  is_active: true,
};

// =========================================================
// HELPERS
// =========================================================

const generateSlug = (name) => {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getFeaturesText = (features) => {
  if (Array.isArray(features)) {
    return features
      .map((feature) => String(feature).trim())
      .filter(Boolean)
      .join("\n");
  }

  if (typeof features === "string") {
    const value = features.trim();

    if (!value) {
      return "";
    }

    // Backend JSON string support
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((feature) => String(feature).trim())
          .filter(Boolean)
          .join("\n");
      }
    } catch {
      // Normal string
    }

    return value;
  }

  return "";
};

const getFeaturesArray = (features) => {
  if (Array.isArray(features)) {
    return features
      .map((feature) => String(feature).trim())
      .filter(Boolean);
  }

  return String(features || "")
    .split(/\r?\n/)
    .map((feature) => feature.trim())
    .filter(Boolean);
};

// =========================================================
// COMPONENT
// =========================================================

export default function AdminSubscriptionPlans() {
  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showModal, setShowModal] =
    useState(false);

  const [editingPlan, setEditingPlan] =
    useState(null);

  const [form, setForm] = useState({
    ...DEFAULT_FORM,
  });

  // =======================================================
  // FETCH PLANS
  // =======================================================

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/subscriptions"
      );

      const data = response.data || {};

      let plansData =
        data.plans ??
        data.data ??
        [];

      // Laravel pagination support
      if (
        plansData &&
        !Array.isArray(plansData) &&
        Array.isArray(plansData.data)
      ) {
        plansData = plansData.data;
      }

      if (!Array.isArray(plansData)) {
        plansData = [];
      }

      setPlans(plansData);
    } catch (error) {
      console.error(
        "Subscription plans error:",
        error.response?.data || error
      );

      const status =
        error.response?.status;

      if (status === 401) {
        toast.error(
          "Please login again."
        );

        navigate("/login");

        return;
      }

      if (status === 403) {
        toast.error(
          "Admin access required."
        );

        navigate("/dashboard");

        return;
      }

      const message =
        error.response?.data?.message ||
        "Subscription plans load nahi ho sake.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // =======================================================
  // INITIAL FETCH
  // =======================================================
  //
  // React 19 ESLint:
  // react-hooks/set-state-in-effect
  //
  // setTimeout ke callback ke andar fetch call hone ki wajah
  // se fetch ke andar hone wale setState calls effect ke
  // synchronous body mein nahi hote.
  // =======================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPlans();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchPlans]);

  // =======================================================
  // FILTERED PLANS
  // =======================================================

  const filteredPlans = useMemo(() => {
    const cleanSearch = search
      .trim()
      .toLowerCase();

    return plans.filter((plan) => {
      const name = String(
        plan.name || ""
      ).toLowerCase();

      const slug = String(
        plan.slug || ""
      ).toLowerCase();

      const description = String(
        plan.description || ""
      ).toLowerCase();

      const matchesSearch =
        !cleanSearch ||
        name.includes(cleanSearch) ||
        slug.includes(cleanSearch) ||
        description.includes(cleanSearch);

      const active =
        Boolean(plan.is_active);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          active) ||
        (statusFilter === "inactive" &&
          !active);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    plans,
    search,
    statusFilter,
  ]);

  // =======================================================
  // STATS
  // =======================================================

  const stats = useMemo(() => {
    const total = plans.length;

    const active = plans.filter(
      (plan) =>
        Boolean(plan.is_active)
    ).length;

    const inactive =
      total - active;

    const paid = plans.filter(
      (plan) =>
        Number(plan.price) > 0
    ).length;

    return {
      total,
      active,
      inactive,
      paid,
    };
  }, [plans]);

  // =======================================================
  // FORM CHANGE
  // =======================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =======================================================
  // NAME CHANGE
  // =======================================================

  const handleNameChange = (event) => {
    const value =
      event.target.value;

    setForm((previous) => ({
      ...previous,

      name: value,

      slug: editingPlan
        ? previous.slug
        : generateSlug(value),
    }));
  };

  // =======================================================
  // CREATE MODAL
  // =======================================================

  const openCreateModal = () => {
    if (actionLoading) {
      return;
    }

    setEditingPlan(null);

    setForm({
      ...DEFAULT_FORM,
    });

    setShowModal(true);
  };

  // =======================================================
  // EDIT MODAL
  // =======================================================

  const openEditModal = (plan) => {
    if (actionLoading) {
      return;
    }

    setEditingPlan(plan);

    setForm({
      name: plan.name || "",

      slug: plan.slug || "",

      description:
        plan.description || "",

      price:
        plan.price ?? "",

      billing_period:
        plan.billing_period ||
        "monthly",

      resume_limit:
        plan.resume_limit ?? 5,

      ai_usage_limit:
        plan.ai_usage_limit ?? 20,

      interview_limit:
        plan.interview_limit ?? 5,

      job_tracker_limit:
        plan.job_tracker_limit ?? 20,

      features:
        getFeaturesText(
          plan.features
        ),

      is_active:
        plan.is_active !== false,
    });

    setShowModal(true);
  };

  // =======================================================
  // CLOSE MODAL
  // =======================================================

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setShowModal(false);

    setEditingPlan(null);

    setForm({
      ...DEFAULT_FORM,
    });
  };

  // =======================================================
  // SUBMIT PLAN
  // =======================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const name =
      form.name.trim();

    const slug =
      form.slug.trim() ||
      generateSlug(name);

    if (!name) {
      toast.error(
        "Plan name required."
      );

      return;
    }

    if (!slug) {
      toast.error(
        "Valid plan slug required."
      );

      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(
        Number(form.price)
      ) ||
      Number(form.price) < 0
    ) {
      toast.error(
        "Valid price enter karo."
      );

      return;
    }

    const limitFields = [
      {
        key: "resume_limit",
        label: "Resume limit",
      },
      {
        key: "ai_usage_limit",
        label: "AI usage limit",
      },
      {
        key: "interview_limit",
        label: "Interview limit",
      },
      {
        key: "job_tracker_limit",
        label: "Job tracker limit",
      },
    ];

    for (const field of limitFields) {
      const value =
        form[field.key];

      if (
        value === "" ||
        !Number.isFinite(
          Number(value)
        ) ||
        Number(value) < 0
      ) {
        toast.error(
          `Valid ${field.label} enter karo.`
        );

        return;
      }
    }

    try {
      setActionLoading(true);

      const features =
        getFeaturesArray(
          form.features
        );

      const payload = {
        name,

        slug,

        description:
          form.description.trim(),

        price:
          Number(form.price),

        billing_period:
          form.billing_period,

        resume_limit:
          Number(
            form.resume_limit
          ),

        ai_usage_limit:
          Number(
            form.ai_usage_limit
          ),

        interview_limit:
          Number(
            form.interview_limit
          ),

        job_tracker_limit:
          Number(
            form.job_tracker_limit
          ),

        features,

        is_active:
          Boolean(
            form.is_active
          ),
      };

      let response;

      if (editingPlan) {
        response =
          await api.put(
            `/admin/subscriptions/${editingPlan.id}`,
            payload
          );
      } else {
        response =
          await api.post(
            "/admin/subscriptions",
            payload
          );
      }

      toast.success(
        response.data?.message ||
          (editingPlan
            ? "Plan updated successfully."
            : "Plan created successfully.")
      );

      setShowModal(false);

      setEditingPlan(null);

      setForm({
        ...DEFAULT_FORM,
      });

      await fetchPlans();
    } catch (error) {
      console.error(
        "Save subscription plan error:",
        error.response?.data || error
      );

      const validationErrors =
        error.response?.data?.errors;

      if (
        validationErrors &&
        typeof validationErrors ===
          "object"
      ) {
        const firstError =
          Object.values(
            validationErrors
          )
            .flat()
            .find(Boolean);

        toast.error(
          firstError ||
            "Plan save nahi ho saka."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Plan save nahi ho saka."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  // =======================================================
  // TOGGLE STATUS
  // =======================================================

  const handleToggleStatus = async (
    plan
  ) => {
    if (actionLoading) {
      return;
    }

    const isActive =
      Boolean(plan.is_active);

    const result =
      await Swal.fire({
        icon: isActive
          ? "warning"
          : "question",

        title: isActive
          ? "Deactivate Plan?"
          : "Activate Plan?",

        text: isActive
          ? `"${plan.name}" users ke liye inactive ho jayega.`
          : `"${plan.name}" users ke liye active ho jayega.`,

        showCancelButton: true,

        confirmButtonText:
          isActive
            ? "Yes, Deactivate"
            : "Yes, Activate",

        cancelButtonText:
          "Cancel",

        confirmButtonColor:
          isActive
            ? "#f59e0b"
            : "#16a34a",

        cancelButtonColor:
          "#64748b",

        reverseButtons: true,
      });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await api.patch(
          `/admin/subscriptions/${plan.id}/status`,
          {
            is_active:
              !isActive,
          }
        );

      toast.success(
        response.data?.message ||
          (isActive
            ? "Plan deactivated."
            : "Plan activated.")
      );

      await fetchPlans();
    } catch (error) {
      console.error(
        "Toggle subscription error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Plan status update failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =======================================================
  // DELETE PLAN
  // =======================================================

  const handleDelete = async (
    plan
  ) => {
    if (actionLoading) {
      return;
    }

    const result =
      await Swal.fire({
        icon: "warning",

        title:
          "Delete Subscription Plan?",

        html: `
          <div style="text-align:center">
            <p>
              <strong>
                ${plan.name || "This plan"}
              </strong>
              permanently delete ho jayega.
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

      const response =
        await api.delete(
          `/admin/subscriptions/${plan.id}`
        );

      toast.success(
        response.data?.message ||
          "Plan deleted successfully."
      );

      await fetchPlans();
    } catch (error) {
      console.error(
        "Delete subscription error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Plan delete nahi ho saka."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =======================================================
  // RESET FILTERS
  // =======================================================

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  // =======================================================
  // FORMAT PRICE
  // =======================================================

  const formatPrice = (
    price
  ) => {
    const value =
      Number(price);

    if (
      !Number.isFinite(value)
    ) {
      return "₹0";
    }

    if (value === 0) {
      return "Free";
    }

    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

            <div>
              <h2 className="fw-bold mb-1">
                💳 Subscription Plans
              </h2>

              <p className="text-muted mb-0">
                Manage StudentAI
                subscription plans and
                pricing.
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">

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
                className="btn btn-primary"
                onClick={
                  openCreateModal
                }
                disabled={
                  actionLoading
                }
              >
                + Create Plan
              </button>

            </div>

          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="row g-4 mb-4">

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <p className="text-muted mb-2">
                        Total Plans
                      </p>

                      <h2 className="fw-bold mb-0">
                        {stats.total}
                      </h2>
                    </div>

                    <div
                      style={{
                        fontSize:
                          "34px",
                      }}
                    >
                      💳
                    </div>

                  </div>

                </div>

              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <p className="text-muted mb-2">
                        Active Plans
                      </p>

                      <h2 className="fw-bold text-success mb-0">
                        {stats.active}
                      </h2>
                    </div>

                    <div
                      style={{
                        fontSize:
                          "34px",
                      }}
                    >
                      ✅
                    </div>

                  </div>

                </div>

              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <p className="text-muted mb-2">
                        Inactive Plans
                      </p>

                      <h2 className="fw-bold text-warning mb-0">
                        {stats.inactive}
                      </h2>
                    </div>

                    <div
                      style={{
                        fontSize:
                          "34px",
                      }}
                    >
                      ⏸️
                    </div>

                  </div>

                </div>

              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <p className="text-muted mb-2">
                        Paid Plans
                      </p>

                      <h2 className="fw-bold text-primary mb-0">
                        {stats.paid}
                      </h2>
                    </div>

                    <div
                      style={{
                        fontSize:
                          "34px",
                      }}
                    >
                      💰
                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="card border-0 shadow-sm mb-4">

            <div className="card-body">

              <div className="row g-3">

                <div className="col-lg-7">

                  <label className="form-label fw-semibold">
                    Search Plans
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by plan name, slug or description..."
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
                    Status
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
                      All Plans
                    </option>

                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
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
                    disabled={
                      !search &&
                      statusFilter ===
                        "all"
                    }
                  >
                    Reset
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3">

              <span>
                {error}
              </span>

              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() =>
                  void fetchPlans()
                }
                disabled={
                  loading
                }
              >
                Retry
              </button>

            </div>
          )}

          {/* =================================================
              PLANS
          ================================================= */}

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">

                <div>

                  <h4 className="fw-bold mb-1">
                    Available Plans
                  </h4>

                  <p className="text-muted mb-0">
                    {
                      filteredPlans.length
                    }{" "}
                    plan(s) found.
                  </p>

                </div>

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() =>
                    void fetchPlans()
                  }
                  disabled={
                    loading ||
                    actionLoading
                  }
                >
                  🔄 Refresh
                </button>

              </div>

              {/* LOADING */}

              {loading ? (
                <div className="text-center py-5">

                  <div
                    className="spinner-border text-primary"
                    role="status"
                    aria-hidden="true"
                  />

                  <p className="text-muted mt-3 mb-0">
                    Loading subscription
                    plans...
                  </p>

                </div>
              ) : filteredPlans.length ===
                0 ? (

                /* EMPTY */

                <div className="text-center py-5">

                  <div
                    style={{
                      fontSize:
                        "48px",
                    }}
                  >
                    💳
                  </div>

                  <h5 className="mt-3">
                    No Plans Found
                  </h5>

                  <p className="text-muted">
                    Create a plan or
                    change your
                    filters.
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                      openCreateModal
                    }
                  >
                    + Create Plan
                  </button>

                </div>
              ) : (

                /* TABLE */

                <div className="table-responsive">

                  <table className="table align-middle">

                    <thead>

                      <tr>
                        <th>#</th>
                        <th>Plan</th>
                        <th>Price</th>
                        <th>Limits</th>
                        <th>Status</th>
                        <th>Billing</th>
                        <th className="text-end">
                          Actions
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {filteredPlans.map(
                        (
                          plan,
                          index
                        ) => {
                          const isActive =
                            Boolean(
                              plan.is_active
                            );

                          return (
                            <tr
                              key={
                                plan.id ??
                                plan.slug ??
                                index
                              }
                            >

                              {/* NUMBER */}

                              <td>
                                {index +
                                  1}
                              </td>

                              {/* PLAN */}

                              <td>

                                <div>

                                  <strong>
                                    {plan.name ||
                                      "Unnamed Plan"}
                                  </strong>

                                  <small className="d-block text-muted">
                                    {plan.slug ||
                                      "—"}
                                  </small>

                                  {plan.description && (
                                    <small className="d-block text-muted mt-1">
                                      {
                                        plan.description
                                      }
                                    </small>
                                  )}

                                </div>

                              </td>

                              {/* PRICE */}

                              <td>

                                <strong className="text-primary">
                                  {formatPrice(
                                    plan.price
                                  )}
                                </strong>

                                {Number(
                                  plan.price
                                ) > 0 && (
                                  <small className="d-block text-muted">
                                    per{" "}
                                    {plan.billing_period ||
                                      "month"}
                                  </small>
                                )}

                              </td>

                              {/* LIMITS */}

                              <td>

                                <div className="d-flex flex-column gap-1">

                                  <small>
                                    📄 Resume:{" "}
                                    <strong>
                                      {plan.resume_limit ??
                                        "∞"}
                                    </strong>
                                  </small>

                                  <small>
                                    🤖 AI:{" "}
                                    <strong>
                                      {plan.ai_usage_limit ??
                                        "∞"}
                                    </strong>
                                  </small>

                                  <small>
                                    🎤 Interview:{" "}
                                    <strong>
                                      {plan.interview_limit ??
                                        "∞"}
                                    </strong>
                                  </small>

                                  <small>
                                    💼 Jobs:{" "}
                                    <strong>
                                      {plan.job_tracker_limit ??
                                        "∞"}
                                    </strong>
                                  </small>

                                </div>

                              </td>

                              {/* STATUS */}

                              <td>

                                <span
                                  className={`badge ${
                                    isActive
                                      ? "bg-success"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {isActive
                                    ? "Active"
                                    : "Inactive"}
                                </span>

                              </td>

                              {/* BILLING */}

                              <td>

                                <span className="badge bg-light text-dark border">
                                  {plan.billing_period ||
                                    "monthly"}
                                </span>

                              </td>

                              {/* ACTIONS */}

                              <td>

                                <div className="d-flex justify-content-end gap-2 flex-wrap">

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      openEditModal(
                                        plan
                                      )
                                    }
                                    disabled={
                                      actionLoading
                                    }
                                  >
                                    ✏️ Edit
                                  </button>

                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      isActive
                                        ? "btn-outline-warning"
                                        : "btn-outline-success"
                                    }`}
                                    onClick={() =>
                                      void handleToggleStatus(
                                        plan
                                      )
                                    }
                                    disabled={
                                      actionLoading
                                    }
                                  >
                                    {isActive
                                      ? "⏸ Deactivate"
                                      : "▶ Activate"}
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      void handleDelete(
                                        plan
                                      )
                                    }
                                    disabled={
                                      actionLoading
                                    }
                                  >
                                    🗑 Delete
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

            </div>

          </div>

        </div>
      </main>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background:
              "rgba(15, 23, 42, 0.68)",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={closeModal}
        >

          <div
            className="card border-0 shadow-lg"
            style={{
              width:
                "min(850px, 100%)",
              maxHeight:
                "92vh",
              overflowY:
                "auto",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="card-header bg-white border-0 p-4">

              <div className="d-flex justify-content-between align-items-center gap-3">

                <div>

                  <h4 className="fw-bold mb-1">

                    {editingPlan
                      ? "✏️ Edit Subscription Plan"
                      : "➕ Create Subscription Plan"}

                  </h4>

                  <p className="text-muted mb-0">
                    Configure pricing,
                    limits and features.
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
                  aria-label="Close"
                />

              </div>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="card-body p-4">

                <div className="row g-3">

                  {/* NAME */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      Plan Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. Premium"
                      value={
                        form.name
                      }
                      onChange={
                        handleNameChange
                      }
                      disabled={
                        actionLoading
                      }
                      maxLength={100}
                      required
                    />

                  </div>

                  {/* SLUG */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      Slug
                    </label>

                    <input
                      type="text"
                      name="slug"
                      className="form-control"
                      placeholder="premium"
                      value={
                        form.slug
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        actionLoading
                      }
                    />

                  </div>

                  {/* PRICE */}

                  <div className="col-md-4">

                    <label className="form-label fw-semibold">
                      Price (₹) *
                    </label>

                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={
                        form.price
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        actionLoading
                      }
                      required
                    />

                  </div>

                  {/* BILLING */}

                  <div className="col-md-4">

                    <label className="form-label fw-semibold">
                      Billing Period
                    </label>

                    <select
                      name="billing_period"
                      className="form-select"
                      value={
                        form.billing_period
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        actionLoading
                      }
                    >

                      <option value="monthly">
                        Monthly
                      </option>

                      <option value="yearly">
                        Yearly
                      </option>

                      <option value="lifetime">
                        Lifetime
                      </option>

                    </select>

                  </div>

                  {/* STATUS */}

                  <div className="col-md-4">

                    <label className="form-label fw-semibold">
                      Status
                    </label>

                    <div className="form-control d-flex align-items-center">

                      <div className="form-check form-switch mb-0">

                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="is_active"
                          checked={Boolean(
                            form.is_active
                          )}
                          onChange={
                            handleChange
                          }
                          disabled={
                            actionLoading
                          }
                        />

                        <label className="form-check-label">
                          {form.is_active
                            ? "Active"
                            : "Inactive"}
                        </label>

                      </div>

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      Description
                    </label>

                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      placeholder="Describe this subscription plan..."
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        actionLoading
                      }
                    />

                  </div>

                  {/* RESUME LIMIT */}

                  <div className="col-md-3">

                    <label className="form-label fw-semibold">
                      📄 Resume Limit
                    </label>

                    <input
                      type="number"
                      name="resume_limit"
                      className="form-control"
                      min="0"
                      value={
                        form.resume_limit
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        actionLoading
                      }
                    />

                  </div>

                  {/* AI LIMIT */}

                  <div className="col-md-3">

                    <label className="form-label fw-semibold">
                      🤖 AI Usage Limit
                    </label>

                    <input
                      type="number"
                      name="ai_usage_limit"
                      className="form-control"
                      min="0"
                      value={
                        form.ai_usage_limit
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        actionLoading
                      }
                    />

                  </div>

                  {/* INTERVIEW LIMIT */}

                  <div className="col-md-3">

                    <label className="form-label fw-semibold">
                      🎤 Interview Limit
                    </label>

                    <input
                      type="number"
                      name="interview_limit"
                      className="form-control"
                      min="0"
                      value={
                        form.interview_limit
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        actionLoading
                      }
                    />

                  </div>

                  {/* JOB TRACKER LIMIT */}

                  <div className="col-md-3">

                    <label className="form-label fw-semibold">
                      💼 Job Tracker Limit
                    </label>

                    <input
                      type="number"
                      name="job_tracker_limit"
                      className="form-control"
                      min="0"
                      value={
                        form.job_tracker_limit
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        actionLoading
                      }
                    />

                  </div>

                  {/* FEATURES */}

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      Plan Features
                    </label>

                    <textarea
                      name="features"
                      className="form-control"
                      rows="6"
                      placeholder={
                        "Unlimited AI career coaching\nATS resume scoring\nPriority support\nAdvanced interview practice"
                      }
                      value={
                        form.features
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        actionLoading
                      }
                    />

                    <small className="text-muted">
                      Har feature ko
                      new line me
                      enter karo.
                    </small>

                  </div>

                </div>

              </div>

              {/* MODAL FOOTER */}

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
                      actionLoading
                    }
                  >

                    {actionLoading
                      ? "Saving..."
                      : editingPlan
                      ? "Update Plan"
                      : "Create Plan"}

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