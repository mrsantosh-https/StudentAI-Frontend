import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../services/api";
import "../styles/resumeReview.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useCallback, useEffect, useState } from "react";

export default function ResumeReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 const fetchReview = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.post(`/resumes/${id}/review`);

    const data = response.data;

    if (!data?.success) {
      throw new Error(
        data?.message || "AI resume review generate nahi hua."
      );
    }

    setReview(data.review);
  } catch (error) {
    console.error("Resume review error:", error);

    setError(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "AI resume review generate nahi hua."
    );
  } finally {
    setLoading(false);
  }
}, [id]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const scoreClass = () => {
    const score = review?.score || 0;

    if (score >= 80) return "score-good";
    if (score >= 60) return "score-average";
    return "score-low";
  };

  if (loading) {
    return (

        
      <div className="resume-review-page">
        <div className="review-loading-card">
          <div className="review-spinner"></div>
          <h3>AI aapka resume review kar raha hai...</h3>
          <p>ATS score, strengths aur improvements analyze kiye ja rahe hain.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resume-review-page">
        <div className="review-error-card">
          <div className="review-error-icon">!</div>

          <h2>Review generate nahi hua</h2>
          <p>{error}</p>

          <div className="review-error-actions">
            <button
              type="button"
              className="review-back-btn"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

            <button
              type="button"
              className="review-retry-btn"
              onClick={fetchReview}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div className="dashboard-layout">
    <Sidebar />

    <div className="dashboard-main">
      <Topbar title="AI Resume Review" />
    <div className="resume-review-page">
      <div className="review-page-header">
        <div>
          <span className="review-ai-badge">AI Powered</span>
          <h1>AI Resume Review</h1>
          <p>
            Detailed ATS analysis, strengths, weaknesses aur improvement
            suggestions.
          </p>
        </div>

        <button
          type="button"
          className="review-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      <div className="review-score-section">
       <div
        className={`review-score-circle ${scoreClass()}`}
        style={{
            "--score-value": review?.score ?? 0,
        }}
        >
          <div className="score-value">
            {review?.score ?? 0}
          </div>
          <div className="score-total">/100</div>
        </div>

        <div className="score-description">
          <span>Overall Resume Score</span>

          <h2>
            {(review?.score ?? 0) >= 80
              ? "Excellent Resume"
              : (review?.score ?? 0) >= 60
              ? "Good, but needs improvement"
              : "Major improvements required"}
          </h2>

          <p>{review?.verdict || "No verdict available."}</p>
        </div>
      </div>

      <div className="review-grid">
        <ReviewCard
          icon="✓"
          title="Strengths"
          items={review?.strengths}
          type="strength"
        />

        <ReviewCard
          icon="!"
          title="Weaknesses"
          items={review?.weaknesses}
          type="weakness"
        />

        <ReviewCard
          icon="⌕"
          title="Missing Keywords"
          items={review?.missing_keywords}
          type="keyword"
        />

        <ReviewCard
          icon="✦"
          title="Improvement Suggestions"
          items={review?.suggestions}
          type="suggestion"
        />
      </div>

      <section className="section-review-wrapper">
        <div className="section-review-heading">
          <span>Detailed Review</span>
          <h2>Resume Section Analysis</h2>
          <p>
            Resume ke har important section ka AI feedback.
          </p>
        </div>

        <div className="section-review-grid">
          <SectionReviewCard
            title="Professional Summary"
            text={review?.section_reviews?.summary}
          />

          <SectionReviewCard
            title="Skills"
            text={review?.section_reviews?.skills}
          />

          <SectionReviewCard
            title="Experience"
            text={review?.section_reviews?.experience}
          />

          <SectionReviewCard
            title="Education"
            text={review?.section_reviews?.education}
          />

          <SectionReviewCard
            title="Projects"
            text={review?.section_reviews?.projects}
          />
        </div>
      </section>

      <div className="review-bottom-actions">
        <button
          type="button"
          className="review-secondary-btn"
          onClick={() => navigate(`/edit-resume/${id}`)}
        >
          Edit Resume
        </button>

        <button
          type="button"
          className="review-primary-btn"
          onClick={fetchReview}
        >
          Regenerate Review
        </button>
      </div>
    </div>
    </div>
  </div>
  );
}

function ReviewCard({ icon, title, items = [], type }) {
  return (
    <div className={`review-card review-card-${type}`}>
      <div className="review-card-header">
        <span className="review-card-icon">{icon}</span>
        <h3>{title}</h3>
      </div>

      {Array.isArray(items) && items.length > 0 ? (
        <ul className="review-list">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>
              <span className="review-list-marker"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="review-empty-text">
          Is section ke liye koi feedback nahi mila.
        </p>
      )}
    </div>
  );
}

function SectionReviewCard({ title, text }) {
  return (
    <article className="section-review-card">
      <h3>{title}</h3>

      <div className="section-review-content">
        <ReactMarkdown>
          {text || "No review available."}
        </ReactMarkdown>
      </div>
    </article>
  );
}