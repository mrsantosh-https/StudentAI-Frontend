import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import api from "../services/api";

import "../styles/payment.css";

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =========================================================
  // PLAN ID
  // =========================================================

  const planId = searchParams.get("plan");

  // =========================================================
  // STATE
  // =========================================================

  const [selectedPlan, setSelectedPlan] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [paymentLoading, setPaymentLoading] = useState(false);

  // =========================================================
  // LOAD RAZORPAY SCRIPT
  // =========================================================

  const loadRazorpay = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const scriptUrl =
        "https://checkout.razorpay.com/v1/checkout.js";

      const existingScript =
        document.querySelector(
          `script[src="${scriptUrl}"]`
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true),
          { once: true }
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false),
          { once: true }
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src = scriptUrl;
      script.async = true;

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }, []);

  // =========================================================
  // FETCH SELECTED PLAN
  // =========================================================

  const fetchPlan = useCallback(async () => {
    if (!planId) {
      setError(
        "No subscription plan was selected."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/subscription-plans"
      );

      const data = response?.data || {};

      const plansData =
        data.plans ||
        data.data ||
        [];

      const plansList =
        Array.isArray(plansData)
          ? plansData
          : [];

      const plan = plansList.find(
        (item) =>
          String(item?.id) ===
          String(planId)
      );

      if (!plan) {
        setError(
          "Selected subscription plan was not found."
        );

        return;
      }

      if (
        plan.is_active === false ||
        plan.status === "inactive"
      ) {
        setError(
          "This subscription plan is currently unavailable."
        );

        return;
      }

      setSelectedPlan(plan);
    } catch (err) {
      console.error(
        "Payment plan fetch error:",
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
        "Unable to load the selected subscription plan.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [planId, navigate]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPlan();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchPlan]);

  // =========================================================
  // PRICE FORMATTER
  // =========================================================

  const formatPrice = useCallback(
    (value) => {
      const price = Number(value);

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        return "Free";
      }

      return `₹${price.toLocaleString(
        "en-IN"
      )}`;
    },
    []
  );

  // =========================================================
  // BILLING PERIOD
  // =========================================================

  const getBillingPeriod = useCallback(
    (plan) => {
      const period = String(
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
    },
    []
  );

  // =========================================================
  // FEATURE VALUE
  // =========================================================

  const getFeatureValue = useCallback(
    (value) => {
      if (
        value === null ||
        value === undefined ||
        value === -1 ||
        value === "unlimited"
      ) {
        return "Unlimited";
      }

      return value;
    },
    []
  );

  // =========================================================
  // PLAN PRICE
  // =========================================================

  const planPrice = useMemo(() => {
    if (!selectedPlan) {
      return 0;
    }

    const price = Number(
      selectedPlan.price
    );

    return Number.isFinite(price)
      ? price
      : 0;
  }, [selectedPlan]);

  // =========================================================
  // FEATURES
  // =========================================================

  const features = useMemo(() => {
    if (!selectedPlan) {
      return [];
    }

    const list = [
      {
        label: "Resume Builder",
        value: getFeatureValue(
          selectedPlan.resume_limit
        ),
        icon: "📄",
      },

      {
        label: "AI Usage",
        value: getFeatureValue(
          selectedPlan.ai_usage_limit
        ),
        icon: "🤖",
      },

      {
        label: "Interview Practice",
        value: getFeatureValue(
          selectedPlan.interview_limit
        ),
        icon: "🎤",
      },

      {
        label: "Job Tracker",
        value: getFeatureValue(
          selectedPlan.job_tracker_limit
        ),
        icon: "💼",
      },
    ];

    if (
      selectedPlan.cover_letter_limit !==
      undefined
    ) {
      list.push({
        label: "Cover Letters",
        value: getFeatureValue(
          selectedPlan.cover_letter_limit
        ),
        icon: "✉️",
      });
    }

    if (
      selectedPlan.career_coach_limit !==
      undefined
    ) {
      list.push({
        label: "AI Career Coach",
        value: getFeatureValue(
          selectedPlan.career_coach_limit
        ),
        icon: "🧠",
      });
    }

    return list;
  }, [
    selectedPlan,
    getFeatureValue,
  ]);

  // =========================================================
  // FREE PLAN
  // =========================================================

  const handleFreePlan = async () => {
    if (!selectedPlan) {
      toast.error(
        "Subscription plan not available."
      );

      return;
    }

    try {
      setPaymentLoading(true);

      /*
       * IMPORTANT:
       * Backend me free-plan activation endpoint
       * available hona chahiye.
       */

      const response = await api.post(
        "/subscriptions/activate",
        {
          plan_id: selectedPlan.id,
        }
      );

      if (
        response?.data?.success === false
      ) {
        throw new Error(
          response?.data?.message ||
            "Unable to activate free plan."
        );
      }

      toast.success(
        "Free plan activated successfully."
      );

      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Free plan activation error:",
        err?.response?.data || err
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to activate the plan."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // =========================================================
  // PAID PAYMENT
  // =========================================================

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast.error(
        "Subscription plan not available."
      );

      return;
    }

    // -------------------------------------------------------
    // FREE PLAN
    // -------------------------------------------------------

    if (planPrice <= 0) {
      await handleFreePlan();
      return;
    }

    try {
      setPaymentLoading(true);

      // -----------------------------------------------------
      // LOAD RAZORPAY
      // -----------------------------------------------------

      const razorpayLoaded =
        await loadRazorpay();

      if (!razorpayLoaded) {
        toast.error(
          "Razorpay failed to load. Please check your internet connection."
        );

        setPaymentLoading(false);

        return;
      }

      if (!window.Razorpay) {
        toast.error(
          "Razorpay checkout is not available."
        );

        setPaymentLoading(false);

        return;
      }

      // -----------------------------------------------------
      // CREATE ORDER
      // -----------------------------------------------------

      const response = await api.post(
        "/payment/create-order",
        {
          plan_id: selectedPlan.id,
        }
      );

      const data =
        response?.data || {};

      console.log(
        "Razorpay order response:",
        data
      );

      // -----------------------------------------------------
      // ORDER
      // -----------------------------------------------------

      const order =
        data.order || {};

      const orderId =
        data.order_id ||
        order.id ||
        data.id ||
        null;

      const razorpayKey =
        data.key_id ||
        data.key ||
        data.razorpay_key ||
        null;

      const amount =
        data.amount ||
        order.amount ||
        Math.round(
          planPrice * 100
        );

      const currency =
        data.currency ||
        order.currency ||
        "INR";

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      if (!orderId) {
        console.error(
          "Missing Razorpay order ID:",
          data
        );

        toast.error(
          "Payment order was not created."
        );

        setPaymentLoading(false);

        return;
      }

      if (!razorpayKey) {
        console.error(
          "Missing Razorpay key:",
          data
        );

        toast.error(
          "Razorpay configuration is missing."
        );

        setPaymentLoading(false);

        return;
      }

      // -----------------------------------------------------
      // RAZORPAY OPTIONS
      // -----------------------------------------------------

      const options = {
        key: razorpayKey,

        amount: Number(amount),

        currency: currency,

        name: "StudentAI",

        description:
          `${selectedPlan.name} Subscription`,

        order_id: orderId,

        // ===================================================
        // PREFILL
        // ===================================================

        prefill: {
          name:
            data.user?.name ||
            "",

          email:
            data.user?.email ||
            "",

          contact:
            data.user?.phone ||
            "",
        },

        // ===================================================
        // PAYMENT METHODS
        // ===================================================

        method: {
          card: true,
          netbanking: true,
          wallet: true,
          upi: true,
        },

        // ===================================================
        // NOTES
        // ===================================================

        notes: {
          plan_id:
            String(
              selectedPlan.id
            ),

          plan_name:
            String(
              selectedPlan.name
            ),
        },

        // ===================================================
        // THEME
        // ===================================================

        theme: {
          color: "#6366f1",
        },

        // ===================================================
        // MODAL
        // ===================================================

        modal: {
          confirm_close: true,

          ondismiss: function () {
            setPaymentLoading(false);

            toast(
              "Payment cancelled."
            );
          },
        },

        // ===================================================
        // SUCCESS HANDLER
        // ===================================================

        handler: async function (
          paymentResponse
        ) {
          try {
            console.log(
              "Razorpay payment response:",
              paymentResponse
            );

            const paymentId =
              paymentResponse?.razorpay_payment_id;

            const razorpayOrderId =
              paymentResponse?.razorpay_order_id;

            const signature =
              paymentResponse?.razorpay_signature;

            if (
              !paymentId ||
              !razorpayOrderId ||
              !signature
            ) {
              toast.error(
                "Invalid payment response received."
              );

              setPaymentLoading(false);

              return;
            }

            // -------------------------------------------------
            // VERIFY PAYMENT
            // -------------------------------------------------

            const verifyResponse =
              await api.post(
                "/payment/verify",
                {
                  razorpay_payment_id:
                    paymentId,

                  razorpay_order_id:
                    razorpayOrderId,

                  razorpay_signature:
                    signature,

                  plan_id:
                    selectedPlan.id,
                }
              );

            console.log(
              "Payment verification response:",
              verifyResponse?.data
            );

            if (
              verifyResponse?.data
                ?.success === false
            ) {
              toast.error(
                verifyResponse?.data
                  ?.message ||
                  "Payment verification failed."
              );

              return;
            }

            toast.success(
              "Payment successful! Your plan has been activated."
            );

            navigate(
              "/dashboard"
            );
          } catch (err) {
            console.error(
              "Payment verification error:",
              err?.response?.data ||
                err
            );

            toast.error(
              err?.response?.data
                ?.message ||
                "Payment verification failed."
            );
          } finally {
            setPaymentLoading(false);
          }
        },
      };

      // -----------------------------------------------------
      // CREATE RAZORPAY INSTANCE
      // -----------------------------------------------------

      const razorpay =
        new window.Razorpay(
          options
        );

      // -----------------------------------------------------
      // PAYMENT FAILED
      // -----------------------------------------------------

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response?.error
          );

          toast.error(
            response?.error
              ?.description ||
              "Payment failed. Please try again."
          );

          setPaymentLoading(false);
        }
      );

      // -----------------------------------------------------
      // OPEN CHECKOUT
      // -----------------------------------------------------

      razorpay.open();
    } catch (err) {
      console.error(
        "Payment error:",
        err?.response?.data ||
          err
      );

      if (
        err?.response?.status ===
        401
      ) {
        toast.error(
          "Please login again."
        );

        navigate("/login");

        return;
      }

      toast.error(
        err?.response?.data
          ?.message ||
          "Payment process failed."
      );

      setPaymentLoading(false);
    }
  };

  // =========================================================
  // RETRY
  // =========================================================

  const handleRetry = () => {
    setError("");
    setLoading(true);

    void fetchPlan();
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

          <main className="payment-page payment-state-page">
            <div className="payment-state-card">
              <div className="payment-spinner" />

              <h2>
                Loading payment details...
              </h2>

              <p>
                Please wait while we
                prepare your selected
                subscription plan.
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

  if (
    error ||
    !selectedPlan
  ) {
    return (
      <div className="student-dashboard-layout">
        <Sidebar />

        <div className="student-dashboard-main">
          <Topbar />

          <main className="payment-page payment-state-page">
            <div className="payment-state-card payment-error-card">

              <div className="payment-error-icon">
                ⚠️
              </div>

              <h2>
                Unable to load payment details
              </h2>

              <p>
                {error ||
                  "Selected subscription plan could not be loaded."}
              </p>

              <div className="payment-error-actions">

                <button
                  type="button"
                  className="payment-primary-btn"
                  onClick={
                    handleRetry
                  }
                >
                  ↻ Try Again
                </button>

                <button
                  type="button"
                  className="payment-outline-btn"
                  onClick={() =>
                    navigate(
                      "/upgrade"
                    )
                  }
                >
                  ← Back to Plans
                </button>

              </div>

            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="student-dashboard-layout">

      <Sidebar />

      <div className="student-dashboard-main">

        <Topbar />

        <main className="payment-page">

          <div className="payment-glow payment-glow-one" />

          <div className="payment-glow payment-glow-two" />

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="payment-header">

            <div className="payment-container">

              <button
                type="button"
                className="payment-back-btn"
                onClick={() =>
                  navigate(
                    "/upgrade"
                  )
                }
              >
                ← Back to Plans
              </button>

              <div className="payment-header-content">

                <span className="payment-eyebrow">
                  🔒 SECURE CHECKOUT
                </span>

                <h1>
                  Complete your
                  <span>
                    {" "}
                    subscription.
                  </span>
                </h1>

                <p>
                  Review your plan details
                  before continuing to
                  payment.
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              PAYMENT CONTENT
          ================================================= */}

          <section className="payment-content">

            <div className="payment-container">

              <div className="payment-grid">

                {/* =========================================
                    LEFT PLAN
                ========================================= */}

                <div className="payment-plan-column">

                  <div className="payment-card payment-plan-card">

                    <div className="payment-card-top">

                      <div className="payment-plan-icon">
                        {planPrice ===
                        0
                          ? "🌱"
                          : "🚀"}
                      </div>

                      <div>

                        <span className="payment-card-label">
                          SELECTED PLAN
                        </span>

                        <h2>
                          {selectedPlan.name ||
                            "Subscription Plan"}
                        </h2>

                      </div>

                    </div>

                    <p className="payment-plan-description">
                      {selectedPlan.description ||
                        "Everything you need to grow your career with StudentAI."}
                    </p>

                    <div className="payment-plan-price">

                      <strong>
                        {formatPrice(
                          planPrice
                        )}
                      </strong>

                      {planPrice >
                        0 && (
                        <span>
                          /{" "}
                          {getBillingPeriod(
                            selectedPlan
                          )}
                        </span>
                      )}

                    </div>

                    <div className="payment-divider" />

                    <div className="payment-features-title">
                      What's included
                    </div>

                    <div className="payment-features">

                      {features.map(
                        (feature) => (
                          <div
                            className="payment-feature"
                            key={
                              feature.label
                            }
                          >

                            <div className="payment-feature-icon">
                              {
                                feature.icon
                              }
                            </div>

                            <div className="payment-feature-content">

                              <strong>
                                {
                                  feature.value
                                }
                              </strong>

                              <span>
                                {
                                  feature.label
                                }
                              </span>

                            </div>

                            <div className="payment-feature-check">
                              ✓
                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                </div>

                {/* =========================================
                    RIGHT PAYMENT
                ========================================= */}

                <div className="payment-summary-column">

                  <div className="payment-card payment-summary-card">

                    <div className="payment-summary-header">

                      <div>

                        <span className="payment-card-label">
                          ORDER SUMMARY
                        </span>

                        <h2>
                          Payment Details
                        </h2>

                      </div>

                      <div className="payment-secure-icon">
                        🔒
                      </div>

                    </div>

                    <div className="payment-summary-row">

                      <span>
                        {
                          selectedPlan.name
                        }
                      </span>

                      <strong>
                        {formatPrice(
                          planPrice
                        )}
                      </strong>

                    </div>

                    <div className="payment-summary-row">

                      <span>
                        Billing
                      </span>

                      <strong>
                        {getBillingPeriod(
                          selectedPlan
                        ) ===
                        "year"
                          ? "Yearly"
                          : "Monthly"}
                      </strong>

                    </div>

                    <div className="payment-divider" />

                    <div className="payment-total-row">

                      <div>

                        <span>
                          Total
                        </span>

                        <small>
                          Inclusive of
                          applicable
                          charges
                        </small>

                      </div>

                      <strong>
                        {formatPrice(
                          planPrice
                        )}
                      </strong>

                    </div>

                    <button
                      type="button"
                      className="payment-primary-btn payment-main-btn"
                      onClick={
                        handlePayment
                      }
                      disabled={
                        paymentLoading
                      }
                    >
                      {paymentLoading
                        ? "Processing..."
                        : planPrice ===
                          0
                        ? "Activate Free Plan"
                        : "Continue to Payment →"}
                    </button>

                    <button
                      type="button"
                      className="payment-cancel-btn"
                      onClick={() =>
                        navigate(
                          "/upgrade"
                        )
                      }
                      disabled={
                        paymentLoading
                      }
                    >
                      ← Choose another
                      plan
                    </button>

                    <div className="payment-security">

                      <div className="security-icon">
                        🔐
                      </div>

                      <div>

                        <strong>
                          Secure Checkout
                        </strong>

                        <span>
                          Your payment
                          information is
                          securely
                          protected.
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* =======================================
                      TRUST
                  ======================================= */}

                  <div className="payment-trust-card">

                    <div className="payment-trust-item">

                      <span>
                        🔒
                      </span>

                      <div>

                        <strong>
                          Secure
                        </strong>

                        <small>
                          Protected
                          checkout
                        </small>

                      </div>

                    </div>

                    <div className="payment-trust-item">

                      <span>
                        ⚡
                      </span>

                      <div>

                        <strong>
                          Fast
                        </strong>

                        <small>
                          Instant
                          activation
                        </small>

                      </div>

                    </div>

                    <div className="payment-trust-item">

                      <span>
                        💬
                      </span>

                      <div>

                        <strong>
                          Support
                        </strong>

                        <small>
                          We're here
                          to help
                        </small>

                      </div>

                    </div>

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