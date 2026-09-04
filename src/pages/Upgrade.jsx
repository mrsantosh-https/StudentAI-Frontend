// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";

// import api from "../services/api";

// import "../styles/upgrade.css";

// export default function Upgrade() {
//   const navigate = useNavigate();

//   // =========================================================
//   // STATE
//   // =========================================================

//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [billingCycle, setBillingCycle] = useState("monthly");

//   const [currentSubscription, setCurrentSubscription] =
//     useState(null);

//   const [selectedPlan, setSelectedPlan] = useState(null);

//   const [actionLoading, setActionLoading] = useState(false);

//   // =========================================================
//   // FETCH PLANS
//   // =========================================================

//   const fetchPlans = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get("/subscription-plans");

//       const data = response?.data || {};

//       const plansData =
//         data.plans ||
//         data.data ||
//         [];

//       const plansList = Array.isArray(plansData)
//         ? plansData
//         : [];

//       setPlans(plansList);

//       const subscription =
//         data.current_subscription ||
//         data.subscription ||
//         data.user_subscription ||
//         null;

//       setCurrentSubscription(subscription);
//     } catch (err) {
//       console.error(
//         "Upgrade plans fetch error:",
//         err?.response?.data || err
//       );

//       if (err?.response?.status === 401) {
//         toast.error("Please login to view subscription plans.");
//         navigate("/login");
//         return;
//       }

//       const message =
//         err?.response?.data?.message ||
//         "Subscription plans load nahi ho sake.";

//       setError(message);
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   // =========================================================
//   // INITIAL LOAD
//   // =========================================================

//   useEffect(() => {
//     const timer = window.setTimeout(() => {
//       fetchPlans();
//     }, 0);

//     return () => window.clearTimeout(timer);
//   }, [fetchPlans]);

//   // =========================================================
//   // CURRENT PLAN
//   // =========================================================

//   const currentPlanId = useMemo(() => {
//     if (!currentSubscription) {
//       return null;
//     }

//     const plan =
//       currentSubscription.plan ||
//       currentSubscription.subscription_plan ||
//       null;

//     return (
//       plan?.id ||
//       currentSubscription.plan_id ||
//       null
//     );
//   }, [currentSubscription]);

//   // =========================================================
//   // ACTIVE PLANS
//   // =========================================================

//   const activePlans = useMemo(() => {
//     return plans.filter((plan) => {
//       if (!plan) return false;

//       if (plan.is_active === false) {
//         return false;
//       }

//       if (plan.status === "inactive") {
//         return false;
//       }

//       return true;
//     });
//   }, [plans]);

//   // =========================================================
//   // BILLING FILTER
//   // =========================================================

//   const visiblePlans = useMemo(() => {
//     return activePlans.filter((plan) => {
//       const period = String(
//         plan.billing_period ||
//           plan.billing_cycle ||
//           plan.interval ||
//           "monthly"
//       ).toLowerCase();

//       if (billingCycle === "monthly") {
//         return [
//           "monthly",
//           "month",
//           "1_month",
//         ].includes(period);
//       }

//       if (billingCycle === "yearly") {
//         return [
//           "yearly",
//           "year",
//           "annual",
//           "1_year",
//         ].includes(period);
//       }

//       return true;
//     });
//   }, [activePlans, billingCycle]);

//   // =========================================================
//   // PRICE
//   // =========================================================

//   const formatPrice = useCallback((value) => {
//     const price = Number(value);

//     if (!Number.isFinite(price) || price === 0) {
//       return "Free";
//     }

//     return `₹${price.toLocaleString("en-IN")}`;
//   }, []);

//   // =========================================================
//   // BILLING PERIOD
//   // =========================================================

//   const getBillingPeriod = useCallback((plan) => {
//     const period = String(
//       plan?.billing_period ||
//         plan?.billing_cycle ||
//         plan?.interval ||
//         "monthly"
//     ).toLowerCase();

//     if (
//       [
//         "yearly",
//         "year",
//         "annual",
//         "1_year",
//       ].includes(period)
//     ) {
//       return "year";
//     }

//     return "month";
//   }, []);

//   // =========================================================
//   // FEATURE VALUE
//   // =========================================================

//   const getFeatureValue = (
//     value,
//     unlimitedText = "Unlimited"
//   ) => {
//     if (
//       value === null ||
//       value === undefined ||
//       value === -1 ||
//       value === "unlimited"
//     ) {
//       return unlimitedText;
//     }

//     return value;
//   };

//   // =========================================================
//   // CURRENT PLAN CHECK
//   // =========================================================

//   const isCurrentPlan = useCallback(
//     (plan) => {
//       if (!currentPlanId) {
//         return false;
//       }

//       return (
//         String(plan?.id) ===
//         String(currentPlanId)
//       );
//     },
//     [currentPlanId]
//   );

//   // =========================================================
//   // POPULAR PLAN
//   // =========================================================

//   const isPopularPlan = useCallback(
//     (plan, index) => {
//       return (
//         plan?.is_popular === true ||
//         plan?.popular === true ||
//         plan?.recommended === true ||
//         plan?.badge === "popular" ||
//         index === 1
//       );
//     },
//     []
//   );

//   // =========================================================
//   // SELECT PLAN
//   // =========================================================

//   const handleSelectPlan = (plan) => {
//     if (!plan) return;

//     if (isCurrentPlan(plan)) {
//       toast.success("This is your current plan.");
//       return;
//     }

//     setSelectedPlan(plan);
//   };

//   // =========================================================
//   // PAYMENT
//   // =========================================================

//   const handleUpgrade = async () => {
//     if (!selectedPlan) {
//       toast.error("Please select a subscription plan.");
//       return;
//     }

//     if (isCurrentPlan(selectedPlan)) {
//       toast.success("You are already using this plan.");
//       return;
//     }

//     try {
//       setActionLoading(true);

//       /*
//        * PAYMENT GATEWAY LATER
//        *
//        * Example:
//        *
//        * const response = await api.post(
//        *   "/payment/create-order",
//        *   {
//        *     plan_id: selectedPlan.id,
//        *   }
//        * );
//        */

//       navigate(
//         `/payment?plan=${selectedPlan.id}`
//       );
//     } catch (err) {
//       console.error(
//         "Upgrade error:",
//         err?.response?.data || err
//       );

//       if (err?.response?.status === 401) {
//         toast.error("Please login again.");
//         navigate("/login");
//         return;
//       }

//       toast.error(
//         err?.response?.data?.message ||
//           "Upgrade process failed."
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // =========================================================
//   // RETRY
//   // =========================================================

//   const handleRetry = () => {
//     fetchPlans();
//   };

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (loading) {
//     return (
//       <div className="student-dashboard-layout">

//         <Sidebar />

//         <div className="student-dashboard-main">

//           <Topbar />

//           <main className="upgrade-page upgrade-state-page">
//             <div className="upgrade-state-card">
//               <div className="upgrade-spinner" />

//               <h3>
//                 Loading subscription plans...
//               </h3>

//               <p>
//                 Please wait while we fetch the
//                 latest plans.
//               </p>
//             </div>
//           </main>

//         </div>
//       </div>
//     );
//   }

//   // =========================================================
//   // ERROR
//   // =========================================================

//   if (error) {
//     return (
//       <div className="student-dashboard-layout">

//         <Sidebar />

//         <div className="student-dashboard-main">

//           <Topbar />

//           <main className="upgrade-page upgrade-state-page">

//             <div className="upgrade-state-card upgrade-error-card">

//               <div className="upgrade-state-icon">
//                 ⚠️
//               </div>

//               <h3>
//                 Unable to load plans
//               </h3>

//               <p>
//                 {error}
//               </p>

//               <button
//                 type="button"
//                 className="upgrade-primary-btn"
//                 onClick={handleRetry}
//               >
//                 ↻ Try Again
//               </button>

//             </div>

//           </main>

//         </div>
//       </div>
//     );
//   }

//   // =========================================================
//   // MAIN UI
//   // =========================================================

//   return (
//     <div className="student-dashboard-layout">

//       {/* =====================================================
//           SIDEBAR
//       ===================================================== */}

//       <Sidebar />

//       {/* =====================================================
//           MAIN CONTENT
//       ===================================================== */}

//       <div className="student-dashboard-main">

//         {/* TOPBAR */}

//         <Topbar />

//         {/* ===================================================
//             UPGRADE PAGE
//         =================================================== */}

//         <main className="upgrade-page">

//           {/* Background */}

//           <div className="upgrade-glow upgrade-glow-one" />
//           <div className="upgrade-glow upgrade-glow-two" />

//           {/* =================================================
//               HERO
//           ================================================= */}

//           <section className="upgrade-hero">

//             <div className="upgrade-container">

//               <button
//                 type="button"
//                 className="upgrade-back"
//                 onClick={() =>
//                   navigate("/dashboard")
//                 }
//               >
//                 ← Back to Dashboard
//               </button>

//               <div className="upgrade-hero-inner">

//                 <span className="upgrade-eyebrow">
//                   ✨ STUDENTAI PREMIUM
//                 </span>

//                 <h1>
//                   Upgrade your
//                   <span> career potential.</span>
//                 </h1>

//                 <p>
//                   Unlock powerful AI tools,
//                   advanced resume features,
//                   interview preparation and
//                   smarter career management.
//                 </p>

//               </div>

//               {/* BILLING */}

//               <div className="upgrade-billing">

//                 <button
//                   type="button"
//                   className={
//                     billingCycle === "monthly"
//                       ? "active"
//                       : ""
//                   }
//                   onClick={() =>
//                     setBillingCycle("monthly")
//                   }
//                 >
//                   Monthly
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     billingCycle === "yearly"
//                       ? "active"
//                       : ""
//                   }
//                   onClick={() =>
//                     setBillingCycle("yearly")
//                   }
//                 >
//                   Yearly

//                   <span>
//                     Save more
//                   </span>
//                 </button>

//               </div>

//             </div>

//           </section>

//           {/* =================================================
//               CURRENT PLAN
//           ================================================= */}

//           {currentSubscription && (
//             <section className="upgrade-current-section">

//               <div className="upgrade-container">

//                 <div className="upgrade-current-card">

//                   <div className="current-check">
//                     ✓
//                   </div>

//                   <div className="current-info">

//                     <small>
//                       CURRENT PLAN
//                     </small>

//                     <strong>
//                       {
//                         currentSubscription
//                           ?.plan?.name ||
//                         currentSubscription
//                           ?.subscription_plan
//                           ?.name ||
//                         "Active Subscription"
//                       }
//                     </strong>

//                   </div>

//                   <span className="current-active">
//                     Active
//                   </span>

//                 </div>

//               </div>

//             </section>
//           )}

//           {/* =================================================
//               PLANS
//           ================================================= */}

//           <section className="upgrade-plans-section">

//             <div className="upgrade-container">

//               {visiblePlans.length === 0 ? (
//                 <div className="upgrade-empty">

//                   <div className="upgrade-empty-icon">
//                     📦
//                   </div>

//                   <h3>
//                     No plans available
//                   </h3>

//                   <p>
//                     There are no plans available
//                     for this billing cycle.
//                   </p>

//                   <button
//                     type="button"
//                     className="upgrade-outline-btn"
//                     onClick={() =>
//                       setBillingCycle(
//                         billingCycle ===
//                         "monthly"
//                           ? "yearly"
//                           : "monthly"
//                       )
//                     }
//                   >
//                     View{" "}
//                     {billingCycle ===
//                     "monthly"
//                       ? "Yearly"
//                       : "Monthly"}{" "}
//                     Plans
//                   </button>

//                 </div>
//               ) : (
//                 <div className="upgrade-plans-grid">

//                   {visiblePlans.map(
//                     (plan, index) => {

//                       const current =
//                         isCurrentPlan(plan);

//                       const popular =
//                         isPopularPlan(
//                           plan,
//                           index
//                         );

//                       const price =
//                         Number(plan.price);

//                       const period =
//                         getBillingPeriod(
//                           plan
//                         );

//                       return (
//                         <article
//                           key={
//                             plan.id ||
//                             `${plan.name}-${index}`
//                           }
//                           className={[
//                             "upgrade-plan-card",
//                             popular
//                               ? "is-popular"
//                               : "",
//                             current
//                               ? "is-current"
//                               : "",
//                           ]
//                             .filter(Boolean)
//                             .join(" ")}
//                         >

//                           {/* BADGE */}

//                           {popular && (
//                             <div className="popular-badge">
//                               ⭐ MOST POPULAR
//                             </div>
//                           )}

//                           {current && (
//                             <div className="current-badge">
//                               ✓ CURRENT PLAN
//                             </div>
//                           )}

//                           {/* ICON */}

//                           <div className="plan-icon">

//                             {index === 0
//                               ? "🌱"
//                               : index === 1
//                               ? "🚀"
//                               : "👑"}

//                           </div>

//                           {/* NAME */}

//                           <h2>
//                             {plan.name ||
//                               "Subscription Plan"}
//                           </h2>

//                           <p className="plan-description">
//                             {plan.description ||
//                               "Everything you need to grow your career."}
//                           </p>

//                           {/* PRICE */}

//                           <div className="plan-price">

//                             <strong>
//                               {formatPrice(price)}
//                             </strong>

//                             {price > 0 && (
//                               <span>
//                                 / {period}
//                               </span>
//                             )}

//                           </div>

//                           {/* FEATURES */}

//                           <div className="plan-features">

//                             <Feature
//                               value={getFeatureValue(
//                                 plan.resume_limit
//                               )}
//                               label="Resume Builder"
//                             />

//                             <Feature
//                               value={getFeatureValue(
//                                 plan.ai_usage_limit
//                               )}
//                               label="AI Usage"
//                             />

//                             <Feature
//                               value={getFeatureValue(
//                                 plan.interview_limit
//                               )}
//                               label="Interview Practice"
//                             />

//                             <Feature
//                               value={getFeatureValue(
//                                 plan.job_tracker_limit
//                               )}
//                               label="Job Tracker"
//                             />

//                             {plan.cover_letter_limit !==
//                               undefined && (
//                               <Feature
//                                 value={getFeatureValue(
//                                   plan.cover_letter_limit
//                                 )}
//                                 label="Cover Letters"
//                               />
//                             )}

//                             {plan.career_coach_limit !==
//                               undefined && (
//                               <Feature
//                                 value={getFeatureValue(
//                                   plan.career_coach_limit
//                                 )}
//                                 label="AI Career Coach"
//                               />
//                             )}

//                           </div>

//                           {/* BUTTON */}

//                           <button
//                             type="button"
//                             className={
//                               current
//                                 ? "upgrade-current-btn"
//                                 : popular
//                                 ? "upgrade-primary-btn"
//                                 : "upgrade-outline-btn"
//                             }
//                             disabled={
//                               current ||
//                               actionLoading
//                             }
//                             onClick={() =>
//                               handleSelectPlan(
//                                 plan
//                               )
//                             }
//                           >
//                             {current
//                               ? "✓ Current Plan"
//                               : price === 0
//                               ? "Get Started"
//                               : "Upgrade Now →"}
//                           </button>

//                         </article>
//                       );
//                     }
//                   )}

//                 </div>
//               )}

//               {/* =================================================
//                   TRUST
//               ================================================= */}

//               <div className="upgrade-trust">

//                 <TrustItem
//                   icon="🔒"
//                   title="Secure Payments"
//                   text="Your payment information is protected."
//                 />

//                 <TrustItem
//                   icon="⚡"
//                   title="Instant Activation"
//                   text="Your plan activates after payment."
//                 />

//                 <TrustItem
//                   icon="💬"
//                   title="Premium Support"
//                   text="Get help whenever you need it."
//                 />

//               </div>

//             </div>

//           </section>

//         </main>

//       </div>

//       {/* =====================================================
//           PAYMENT MODAL
//       ===================================================== */}

//       {selectedPlan && (
//         <div
//           className="upgrade-modal-overlay"
//           onClick={() => {
//             if (!actionLoading) {
//               setSelectedPlan(null);
//             }
//           }}
//         >

//           <div
//             className="upgrade-modal"
//             onClick={(event) =>
//               event.stopPropagation()
//             }
//           >

//             <button
//               type="button"
//               className="upgrade-modal-close"
//               onClick={() =>
//                 setSelectedPlan(null)
//               }
//               disabled={actionLoading}
//             >
//               ×
//             </button>

//             <div className="modal-icon">
//               🚀
//             </div>

//             <span className="modal-label">
//               UPGRADE PLAN
//             </span>

//             <h2>
//               {selectedPlan.name}
//             </h2>

//             <p>
//               You're one step away from
//               unlocking premium StudentAI
//               features.
//             </p>

//             <div className="modal-price">
//               {formatPrice(
//                 selectedPlan.price
//               )}

//               {Number(
//                 selectedPlan.price
//               ) > 0 && (
//                 <span>
//                   /{" "}
//                   {getBillingPeriod(
//                     selectedPlan
//                   )}
//                 </span>
//               )}
//             </div>

//             <div className="modal-summary">

//               <div>
//                 <span>
//                   Resume Builder
//                 </span>

//                 <strong>
//                   {getFeatureValue(
//                     selectedPlan.resume_limit
//                   )}
//                 </strong>
//               </div>

//               <div>
//                 <span>
//                   AI Usage
//                 </span>

//                 <strong>
//                   {getFeatureValue(
//                     selectedPlan.ai_usage_limit
//                   )}
//                 </strong>
//               </div>

//               <div>
//                 <span>
//                   Interview
//                 </span>

//                 <strong>
//                   {getFeatureValue(
//                     selectedPlan.interview_limit
//                   )}
//                 </strong>
//               </div>

//               <div>
//                 <span>
//                   Job Tracker
//                 </span>

//                 <strong>
//                   {getFeatureValue(
//                     selectedPlan.job_tracker_limit
//                   )}
//                 </strong>
//               </div>

//             </div>

//             <div className="modal-actions">

//               <button
//                 type="button"
//                 className="upgrade-outline-btn"
//                 onClick={() =>
//                   setSelectedPlan(null)
//                 }
//                 disabled={actionLoading}
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 className="upgrade-primary-btn"
//                 onClick={handleUpgrade}
//                 disabled={actionLoading}
//               >
//                 {actionLoading
//                   ? "Processing..."
//                   : "Continue to Payment →"}
//               </button>

//             </div>

//             <small className="modal-note">
//               🔒 Secure payment processing
//             </small>

//           </div>

//         </div>
//       )}

//     </div>
//   );
// }


// // =============================================================
// // FEATURE COMPONENT
// // =============================================================

// function Feature({ value, label }) {
//   return (
//     <div className="plan-feature">

//       <div className="feature-check">
//         ✓
//       </div>

//       <div>
//         <strong>
//           {value}
//         </strong>

//         <span>
//           {label}
//         </span>
//       </div>

//     </div>
//   );
// }


// // =============================================================
// // TRUST COMPONENT
// // =============================================================

// function TrustItem({
//   icon,
//   title,
//   text,
// }) {
//   return (
//     <div className="trust-item">

//       <div className="trust-icon">
//         {icon}
//       </div>

//       <div>
//         <strong>
//           {title}
//         </strong>

//         <span>
//           {text}
//         </span>
//       </div>

//     </div>
//   );
// }


import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/upgrade.css";

export default function Upgrade() {
const navigate = useNavigate();

const handleNotify = () => {
toast.success(
"You'll be notified when StudentAI Premium launches! 🚀"
);
};

return ( <div className="student-dashboard-layout"> <Sidebar />

```
  <div className="student-dashboard-main">
    <Topbar />

    <main className="upgrade-page coming-soon-page">
      {/* Background Effects */}
      <div className="upgrade-glow upgrade-glow-one" />
      <div className="upgrade-glow upgrade-glow-two" />

      <div className="upgrade-container">
        <section className="coming-soon-card">
          <div className="coming-soon-icon">
            🚀
          </div>

          <span className="upgrade-eyebrow">
            STUDENTAI PREMIUM
          </span>

          <div className="coming-soon-badge">
            ✨ COMING SOON
          </div>

          <h1>
            Something exciting is
            <span> coming soon.</span>
          </h1>

          <p className="coming-soon-description">
            We're working on StudentAI Premium to bring you more
            powerful AI tools, advanced career features, and an
            even better learning experience.
          </p>

          <div className="coming-soon-features">
            <div className="coming-feature">
              <span>🤖</span>
              <div>
                <strong>Advanced AI Tools</strong>
                <p>More powerful AI assistance for your career.</p>
              </div>
            </div>

            <div className="coming-feature">
              <span>📄</span>
              <div>
                <strong>Premium Resume Features</strong>
                <p>Advanced templates and ATS improvements.</p>
              </div>
            </div>

            <div className="coming-feature">
              <span>🎯</span>
              <div>
                <strong>Unlimited Career Growth</strong>
                <p>More tools to help you achieve your goals.</p>
              </div>
            </div>
          </div>

          <div className="coming-soon-actions">
            <button
              type="button"
              className="upgrade-outline-btn"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <button
              type="button"
              className="upgrade-primary-btn"
              onClick={handleNotify}
            >
              🔔 Notify Me
            </button>
          </div>

          <p className="coming-soon-footer">
            Thank you for being part of StudentAI ❤️
          </p>
        </section>
      </div>
    </main>
  </div>
</div>


);
}
