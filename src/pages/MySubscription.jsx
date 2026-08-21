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

import api from "../services/api";

import "../styles/mySubscription.css";

export default function MySubscription() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [subscription, setSubscription] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // FETCH MY SUBSCRIPTION
  // =========================================================

  const fetchSubscription = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await api.get(
          "/my-subscription"
        );

        const data =
          response?.data || {};

        if (
          data.success === false
        ) {
          const message =
            data.message ||
            "Unable to load subscription.";

          setError(message);
          setSubscription(null);

          return;
        }

        if (
          data.has_subscription === false ||
          !data.subscription
        ) {
          setSubscription(null);
          return;
        }

        setSubscription(
          data.subscription
        );
      } catch (err) {
        console.error(
          "My subscription fetch error:",
          err?.response?.data || err
        );

        if (
          err?.response?.status === 401
        ) {
          toast.error(
            "Please login to continue."
          );

          navigate("/login");

          return;
        }

        const message =
          err?.response?.data?.message ||
          "Unable to load your subscription.";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate]
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void fetchSubscription();
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchSubscription]);

  // =========================================================
  // PLAN
  // =========================================================

  const plan = useMemo(() => {
    return (
      subscription?.plan ||
      null
    );
  }, [subscription]);

  // =========================================================
  // PRICE
  // =========================================================

  const price = useMemo(() => {
    const value = Number(
      plan?.price
    );

    if (
      !Number.isFinite(value)
    ) {
      return 0;
    }

    return value;
  }, [plan]);

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = useCallback(
    (value) => {
      const amount = Number(value);

      if (
        !Number.isFinite(amount) ||
        amount === 0
      ) {
        return "Free";
      }

      return `₹${amount.toLocaleString(
        "en-IN"
      )}`;
    },
    []
  );

  // =========================================================
  // BILLING PERIOD
  // =========================================================

  const billingPeriod =
    useMemo(() => {
      const period =
        String(
          plan?.billing_period ||
            plan?.billing_cycle ||
            plan?.interval ||
            "monthly"
        ).toLowerCase();

      if (
        [
          "yearly",
          "year",
          "annual",
          "1_year",
        ].includes(period)
      ) {
        return "year";
      }

      return "month";
    }, [plan]);

  // =========================================================
  // BILLING LABEL
  // =========================================================

  const billingLabel =
    billingPeriod === "year"
      ? "Yearly"
      : "Monthly";

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = useCallback(
    (value) => {
      if (!value) {
        return "—";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "—";
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    },
    []
  );

  // =========================================================
  // STATUS
  // =========================================================

  const status =
    String(
      subscription?.status ||
        "active"
    ).toLowerCase();

  const isActive =
    status === "active";

  // =========================================================
  // REMAINING DAYS
  // =========================================================

  const remainingDays =
    useMemo(() => {
      if (
        subscription?.remaining_days !==
        undefined
      ) {
        return Math.max(
          0,
          Number(
            subscription.remaining_days
          )
        );
      }

      if (
        !subscription?.ends_at
      ) {
        return null;
      }

      const endDate =
        new Date(
          subscription.ends_at
        );

      const now =
        new Date();

      const difference =
        endDate.getTime() -
        now.getTime();

      return Math.max(
        0,
        Math.ceil(
          difference /
            (1000 *
              60 *
              60 *
              24)
        )
      );
    }, [subscription]);

  // =========================================================
  // FEATURES
  // =========================================================

  const getFeatureValue =
    useCallback(
      (value) => {
        if (
          value === null ||
          value === undefined ||
          value === -1 ||
          String(value).toLowerCase() ===
            "unlimited"
        ) {
          return "Unlimited";
        }

        return value;
      },
      []
    );

  const features = useMemo(() => {
    if (!plan) {
      return [];
    }

    const list = [
      {
        icon: "📄",
        label: "Resume Builder",
        value:
          getFeatureValue(
            plan.resume_limit
          ),
      },

      {
        icon: "🤖",
        label: "AI Usage",
        value:
          getFeatureValue(
            plan.ai_usage_limit
          ),
      },

      {
        icon: "🎤",
        label: "Interview Practice",
        value:
          getFeatureValue(
            plan.interview_limit
          ),
      },

      {
        icon: "💼",
        label: "Job Tracker",
        value:
          getFeatureValue(
            plan.job_tracker_limit
          ),
      },
    ];

    if (
      plan.cover_letter_limit !==
      undefined
    ) {
      list.push({
        icon: "✉️",
        label: "Cover Letters",
        value:
          getFeatureValue(
            plan.cover_letter_limit
          ),
      });
    }

    if (
      plan.career_coach_limit !==
      undefined
    ) {
      list.push({
        icon: "🧠",
        label: "AI Career Coach",
        value:
          getFeatureValue(
            plan.career_coach_limit
          ),
      });
    }

    return list;
  }, [
    plan,
    getFeatureValue,
  ]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh =
    () => {
      void fetchSubscription(
        true
      );
    };

  // =========================================================
  // GO UPGRADE
  // =========================================================

  const handleUpgrade =
    () => {
      navigate("/upgrade");
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="student-dashboard-layout">
        <Sidebar />

        <div className="student-dashboard-main">
          <Topbar />

          <main className="my-subscription-page subscription-state-page">
            <div className="subscription-state-card">
              <div className="subscription-spinner" />

              <h2>
                Loading your subscription...
              </h2>

              <p>
                Please wait while we
                fetch your subscription
                details.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="student-dashboard-layout">
        <Sidebar />

        <div className="student-dashboard-main">
          <Topbar />

          <main className="my-subscription-page subscription-state-page">
            <div className="subscription-state-card subscription-error-card">
              <div className="subscription-state-icon">
                ⚠️
              </div>

              <h2>
                Unable to load subscription
              </h2>

              <p>
                {error}
              </p>

              <div className="subscription-state-actions">
                <button
                  type="button"
                  className="subscription-primary-btn"
                  onClick={() =>
                    fetchSubscription()
                  }
                >
                  ↻ Try Again
                </button>

                <button
                  type="button"
                  className="subscription-outline-btn"
                  onClick={() =>
                    navigate(
                      "/dashboard"
                    )
                  }
                >
                  ← Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO SUBSCRIPTION
  // =========================================================

  if (!subscription) {
    return (
      <div className="student-dashboard-layout">
        <Sidebar />

        <div className="student-dashboard-main">
          <Topbar />

          <main className="my-subscription-page subscription-state-page">

            <div className="subscription-state-card no-subscription-card">

              <div className="no-subscription-icon">
                📦
              </div>

              <span className="subscription-eyebrow">
                MY SUBSCRIPTION
              </span>

              <h2>
                No active subscription
              </h2>

              <p>
                You don't have an active
                subscription yet. Upgrade
                your StudentAI plan to unlock
                premium features.
              </p>

              <div className="subscription-state-actions">

                <button
                  type="button"
                  className="subscription-primary-btn"
                  onClick={
                    handleUpgrade
                  }
                >
                  View Plans →
                </button>

                <button
                  type="button"
                  className="subscription-outline-btn"
                  onClick={() =>
                    navigate(
                      "/dashboard"
                    )
                  }
                >
                  ← Dashboard
                </button>

              </div>

            </div>

          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="student-dashboard-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="student-dashboard-main">

        <Topbar />

        <main className="my-subscription-page">

          {/* =================================================
              BACKGROUND
          ================================================= */}

          <div className="subscription-glow subscription-glow-one" />

          <div className="subscription-glow subscription-glow-two" />

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="subscription-header">

            <div className="subscription-container">

              <button
                type="button"
                className="subscription-back-btn"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                ← Back to Dashboard
              </button>

              <div className="subscription-header-content">

                <div>

                  <span className="subscription-eyebrow">
                    ✨ MY SUBSCRIPTION
                  </span>

                  <h1>
                    Your
                    <span>
                      {" "}
                      subscription.
                    </span>
                  </h1>

                  <p>
                    Manage your current
                    StudentAI plan and
                    view your available
                    features.
                  </p>

                </div>

                <button
                  type="button"
                  className="subscription-refresh-btn"
                  onClick={
                    handleRefresh
                  }
                  disabled={
                    refreshing
                  }
                >
                  {refreshing
                    ? "Refreshing..."
                    : "↻ Refresh"}
                </button>

              </div>

            </div>

          </section>

          {/* =================================================
              CONTENT
          ================================================= */}

          <section className="subscription-content">

            <div className="subscription-container">

              <div className="subscription-grid">

                {/* =========================================
                    PLAN CARD
                ========================================= */}

                <div className="subscription-plan-card">

                  <div className="subscription-plan-top">

                    <div className="subscription-plan-icon">
                      {price === 0
                        ? "🌱"
                        : "🚀"}
                    </div>

                    <div>

                      <span className="subscription-card-label">
                        CURRENT PLAN
                      </span>

                      <h2>
                        {plan?.name ||
                          "Subscription Plan"}
                      </h2>

                    </div>

                    <span
                      className={
                        isActive
                          ? "subscription-status active"
                          : "subscription-status"
                      }
                    >
                      <span className="status-dot" />
                      {isActive
                        ? "Active"
                        : status}
                    </span>

                  </div>

                  <p className="subscription-plan-description">
                    {plan?.description ||
                      "Everything you need to grow your career with StudentAI."}
                  </p>

                  <div className="subscription-price">

                    <strong>
                      {formatPrice(
                        price
                      )}
                    </strong>

                    {price > 0 && (
                      <span>
                        / {billingPeriod}
                      </span>
                    )}

                  </div>

                  <div className="subscription-divider" />

                  {/* =======================================
                      DATES
                  ======================================= */}

                  <div className="subscription-dates">

                    <div className="subscription-date-item">

                      <span className="date-icon">
                        📅
                      </span>

                      <div>
                        <small>
                          Started
                        </small>

                        <strong>
                          {formatDate(
                            subscription.starts_at
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className="subscription-date-item">

                      <span className="date-icon">
                        ⏳
                      </span>

                      <div>
                        <small>
                          Expires
                        </small>

                        <strong>
                          {formatDate(
                            subscription.ends_at
                          )}
                        </strong>
                      </div>

                    </div>

                  </div>

                  {/* =======================================
                      REMAINING
                  ======================================= */}

                  <div className="subscription-remaining">

                    <div className="remaining-icon">
                      ⏱️
                    </div>

                    <div className="remaining-content">

                      <span>
                        Subscription
                        remaining
                      </span>

                      <strong>
                        {remainingDays ===
                        null
                          ? "Unlimited"
                          : `${remainingDays} ${
                              remainingDays ===
                              1
                                ? "day"
                                : "days"
                            }`}
                      </strong>

                    </div>

                  </div>

                  {/* =======================================
                      BILLING
                  ======================================= */}

                  <div className="subscription-billing">

                    <div>
                      <span>
                        Billing
                      </span>

                      <strong>
                        {billingLabel}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Status
                      </span>

                      <strong>
                        {isActive
                          ? "Active"
                          : status}
                      </strong>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="subscription-upgrade-btn"
                    onClick={
                      handleUpgrade
                    }
                  >
                    Upgrade / Change Plan →
                  </button>

                </div>

                {/* =========================================
                    FEATURES
                ========================================= */}

                <div className="subscription-features-card">

                  <div className="subscription-features-header">

                    <div>

                      <span className="subscription-card-label">
                        PLAN BENEFITS
                      </span>

                      <h2>
                        What's included
                      </h2>

                    </div>

                    <div className="features-header-icon">
                      ✨
                    </div>

                  </div>

                  <div className="subscription-features-list">

                    {features.length >
                    0 ? (
                      features.map(
                        (
                          feature
                        ) => (
                          <div
                            className="subscription-feature"
                            key={
                              feature.label
                            }
                          >

                            <div className="subscription-feature-icon">
                              {
                                feature.icon
                              }
                            </div>

                            <div className="subscription-feature-content">

                              <span>
                                {
                                  feature.label
                                }
                              </span>

                              <strong>
                                {
                                  feature.value
                                }
                              </strong>

                            </div>

                            <div className="subscription-feature-check">
                              ✓
                            </div>

                          </div>
                        )
                      )
                    ) : (
                      <div className="subscription-no-features">
                        No feature limits
                        available.
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* =================================================
                  SECURITY / TRUST
              ================================================= */}

              <div className="subscription-trust-card">

                <div className="subscription-trust-item">

                  <span>
                    🔒
                  </span>

                  <div>
                    <strong>
                      Secure
                    </strong>

                    <small>
                      Your subscription
                      data is protected.
                    </small>
                  </div>

                </div>

                <div className="subscription-trust-item">

                  <span>
                    ⚡
                  </span>

                  <div>
                    <strong>
                      Instant
                    </strong>

                    <small>
                      Plan activates after
                      successful payment.
                    </small>
                  </div>

                </div>

                <div className="subscription-trust-item">

                  <span>
                    💬
                  </span>

                  <div>
                    <strong>
                      Support
                    </strong>

                    <small>
                      We're here to help.
                    </small>
                  </div>

                </div>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}