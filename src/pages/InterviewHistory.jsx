import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import api from "../services/api";

import toast from "react-hot-toast";
import Swal from "sweetalert2";

import ReactMarkdown from "react-markdown";

import "../styles/interviewhistory.css";

export default function InterviewHistory() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  /* =====================================================
     FETCH INTERVIEW HISTORY
  ===================================================== */

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);

        const response = await api.get("/interview-history");

        console.log("Interview history:", response.data);

        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setHistories(data);
      } catch (error) {
        console.error("Fetch interview history error:", error);

        toast.error(
          error.response?.data?.message ||
            "Interview history load failed"
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  /* =====================================================
     DELETE INTERVIEW
  ===================================================== */

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Interview?",
      text: "This action cannot be undone.",
      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",

      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",

      reverseButtons: true,

      background: "#ffffff",
      color: "#111827",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await api.delete(`/interview-history/${id}`);

      setHistories((previousHistories) =>
        previousHistories.filter(
          (item) => String(item.id) !== String(id)
        )
      );

      toast.success("Interview deleted successfully");
    } catch (error) {
      console.error("Delete interview error:", error);

      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =====================================================
     FORMAT SCORE
  ===================================================== */

  const formatScore = (score) => {
    if (
      score === null ||
      score === undefined ||
      score === ""
    ) {
      return "N/A";
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) {
      return "N/A";
    }

    /*
      Backend currently saves:
      2/10 = 20
      8/10 = 80

      So convert percentage back to 10.
    */

    if (numericScore > 10) {
      return `${Math.round(numericScore / 10)}/10`;
    }

    return `${numericScore}/10`;
  };

  /* =====================================================
     SCORE CLASS
  ===================================================== */

  const getScoreClass = (score) => {
    if (
      score === null ||
      score === undefined ||
      score === ""
    ) {
      return "score-neutral";
    }

    const numericScore = Number(score);

    if (numericScore >= 80) {
      return "score-excellent";
    }

    if (numericScore >= 60) {
      return "score-good";
    }

    if (numericScore >= 40) {
      return "score-average";
    }

    return "score-low";
  };

  /* =====================================================
     JSX
  ===================================================== */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content interview-history-page">

          {/* PAGE HEADER */}

          <div className="history-page-header">
            <div>
              <h2>📜 Interview History</h2>

              <p>
                Your saved interview practice records.
              </p>
            </div>

            {histories.length > 0 && !loading && (
              <div className="history-total">
                {histories.length}{" "}
                {histories.length === 1
                  ? "Interview"
                  : "Interviews"}
              </div>
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div className="history-loading">

              <div
                className="spinner-border text-primary"
                role="status"
              />

              <p>
                Loading interview history...
              </p>

            </div>
          )}

          {/* EMPTY */}

          {!loading && histories.length === 0 && (
            <div className="history-empty">

              <div className="history-empty-icon">
                📭
              </div>

              <h4>No Interview History</h4>

              <p>
                Your completed interview practice
                will appear here.
              </p>

            </div>
          )}

          {/* HISTORY LIST */}

          {!loading && histories.length > 0 && (
            <div className="history-list">

              {histories.map((item, index) => (
                <div
                  className="history-card"
                  key={item.id ?? index}
                >

                  {/* CARD HEADER */}

                  <div className="history-card-header">

                    <div className="history-role">

                      <span className="history-number">
                        #{index + 1}
                      </span>

                      <div>
                        <h4>
                          {item.role ||
                            "Interview Practice"}
                        </h4>

                        <span className="history-label">
                          Interview Practice
                        </span>
                      </div>

                    </div>

                    <div className="history-actions">

                      <span
                        className={`history-score ${getScoreClass(
                          item.score
                        )}`}
                      >
                        ⭐ {formatScore(item.score)}
                      </span>

                      <button
                        type="button"
                        className="history-delete-btn"
                        onClick={() =>
                          handleDelete(item.id)
                        }
                        disabled={
                          deletingId === item.id
                        }
                      >
                        {deletingId === item.id
                          ? "Deleting..."
                          : "🗑 Delete"}
                      </button>

                    </div>

                  </div>


                  {/* QUESTION */}

                  <div className="history-section">

                    <div className="history-section-title">
                      ❓ Question
                    </div>

                    <div className="history-question">
                      {item.question || "N/A"}
                    </div>

                  </div>


                  {/* ANSWER */}

                  <div className="history-section">

                    <div className="history-section-title">
                      ✍️ Your Answer
                    </div>

                    <div className="history-answer">
                      {item.answer || "N/A"}
                    </div>

                  </div>


                  {/* FEEDBACK */}

                  <div className="history-feedback">

                    <div className="history-feedback-header">

                      <div>
                        <span className="feedback-ai-badge">
                          🤖 AI Analysis
                        </span>

                        <h5>
                          AI Feedback
                        </h5>
                      </div>

                    </div>

                    <div className="history-feedback-content">

                      {item.feedback ? (
                        <ReactMarkdown>
                          {item.feedback}
                        </ReactMarkdown>
                      ) : (
                        <p className="no-feedback">
                          No feedback available.
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}