import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/mockInterviewHistory.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function MockInterviewHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);

  // =========================
  // FETCH HISTORY
  // =========================
  const fetchHistory = useCallback(async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Please login first");
    return;
  }

  try {
    const response = await axios.get(
      `${API_URL}/mock-interview/history`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    setHistory(data);
  } catch (error) {
    console.error(
      "Fetch mock interview history error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Mock interview history load nahi ho saki"
    );
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  let cancelled = false;

  const loadHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");

      if (!cancelled) {
        setLoading(false);
      }

      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/mock-interview/history`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      if (!cancelled) {
        setHistory(data);
      }
    } catch (error) {
      console.error(
        "Initial history load error:",
        error
      );

      if (!cancelled) {
        toast.error(
          error.response?.data?.message ||
            "Mock interview history load nahi ho saki"
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadHistory();

  return () => {
    cancelled = true;
  };
}, []);
  // =========================
  // SEARCH / FILTER
  // =========================
  const filteredHistory = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return history;
    }

    return history.filter((item) => {
      const role = String(item.role || "").toLowerCase();
      const experience = String(
        item.experience || ""
      ).toLowerCase();
      const question = String(
        item.question || ""
      ).toLowerCase();

      return (
        role.includes(keyword) ||
        experience.includes(keyword) ||
        question.includes(keyword)
      );
    });
  }, [history, search]);

  // =========================
  // AVERAGE SCORE
  // =========================
  const averageScore = useMemo(() => {
    if (!history.length) {
      return "0.0";
    }

    const total = history.reduce((sum, item) => {
      return sum + Number(item.score || 0);
    }, 0);

    return (total / history.length).toFixed(1);
  }, [history]);

  // =========================
  // HIGHEST SCORE
  // =========================
  const highestScore = useMemo(() => {
    if (!history.length) {
      return 0;
    }

    return Math.max(
      ...history.map((item) => Number(item.score || 0))
    );
  }, [history]);

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // SCORE COLOR CLASS
  // =========================
  const getScoreClass = (score) => {
    const value = Number(score || 0);

    // Score is out of 5
    if (value >= 4) {
      return "score-high";
    }

    if (value >= 2.5) {
      return "score-medium";
    }

    return "score-low";
  };

  // =========================
  // DELETE HISTORY
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview history?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/mock-interview/history/${id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory((previousHistory) =>
        previousHistory.filter(
          (item) => item.id !== id
        )
      );

      if (selectedInterview?.id === id) {
        setSelectedInterview(null);
      }

      toast.success(
        "Mock interview history deleted"
      );
    } catch (error) {
      console.error(
        "Delete mock interview error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "History delete nahi ho saki"
      );
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="mock-history-layout">
      <Sidebar />

      <main className="mock-history-main">
        <Topbar />

        <div className="mock-history-page">
          {/* ================= HEADER ================= */}
          <div className="mock-history-header">
            <div>
              <h1>Mock Interview History</h1>

              <p>
                Review your AI mock interview questions,
                answers and feedback.
              </p>
            </div>

            <button
              type="button"
              className="refresh-history-btn"
              onClick={fetchHistory}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* ================= STATS ================= */}
          <div className="mock-history-stats">
            <div className="history-stat-card">
              <span>Total Interviews</span>

              <strong>{history.length}</strong>
            </div>

            <div className="history-stat-card">
              <span>Average Score</span>

              <strong>{averageScore}/5</strong>
            </div>

            <div className="history-stat-card">
              <span>Highest Score</span>

              <strong>{highestScore}/5</strong>
            </div>
          </div>

          {/* ================= SEARCH ================= */}
          <div className="mock-history-toolbar">
            <input
              type="search"
              placeholder="Search by role, experience or question..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search mock interview history"
            />

            <span>
              {filteredHistory.length} record
              {filteredHistory.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          {/* ================= LOADING ================= */}
          {loading && (
            <div className="history-state-box">
              <div
                className="history-loader"
                aria-hidden="true"
              ></div>

              <p>
                Loading mock interview history...
              </p>
            </div>
          )}

          {/* ================= EMPTY ================= */}
          {!loading &&
            filteredHistory.length === 0 && (
              <div className="history-state-box">
                <div className="empty-history-icon">
                  🎤
                </div>

                <h2>
                  {search.trim()
                    ? "No matching interview found"
                    : "No mock interview found"}
                </h2>

                <p>
                  {search.trim()
                    ? "Try a different search keyword."
                    : "Complete your first AI mock interview to see it here."}
                </p>
              </div>
            )}

          {/* ================= HISTORY GRID ================= */}
          {!loading &&
            filteredHistory.length > 0 && (
              <div className="mock-history-grid">
                {filteredHistory.map((item) => (
                  <article
                    className="mock-history-card"
                    key={item.id}
                  >
                    {/* CARD TOP */}
                    <div className="history-card-top">
                      <div>
                        <span className="history-role">
                          {item.role ||
                            "Unknown Role"}
                        </span>

                        <p>
                          {item.experience ||
                            "Fresher"}
                        </p>
                      </div>

                      <div
                        className={`history-score ${getScoreClass(
                          item.score
                        )}`}
                      >
                        {item.score || 0}/5
                      </div>
                    </div>

                    {/* QUESTION */}
                    <div className="history-question">
                      <span>Question</span>

                      <p>
                        {item.question ||
                          "Question not available."}
                      </p>
                    </div>

                    {/* FOOTER */}
                    <div className="history-card-footer">
                      <span>
                        {formatDate(
                          item.created_at
                        )}
                      </span>

                      <div className="history-card-actions">
                        {/* RESULT */}
                        <Link
                          to={`/mock-interview-result/${item.id}`}
                          className="view-result-btn"
                        >
                          View Result
                        </Link>

                        {/* DETAILS */}
                        <button
                          type="button"
                          className="history-view-btn"
                          onClick={() =>
                            setSelectedInterview(
                              item
                            )
                          }
                        >
                          View Details
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          className="history-delete-btn"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {selectedInterview && (
        <div
          className="history-modal-overlay"
          onClick={() =>
            setSelectedInterview(null)
          }
          role="presentation"
        >
          <div
            className="history-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
          >
            {/* MODAL HEADER */}
            <div className="history-modal-header">
              <div>
                <h2 id="history-modal-title">
                  {selectedInterview.role ||
                    "Mock Interview"}
                </h2>

                <p>
                  {selectedInterview.experience ||
                    "Fresher"}
                </p>
              </div>

              <button
                type="button"
                className="history-modal-close"
                onClick={() =>
                  setSelectedInterview(null)
                }
                aria-label="Close interview details"
              >
                ×
              </button>
            </div>

            {/* SCORE */}
            <div
              className={`history-modal-score ${getScoreClass(
                selectedInterview.score
              )}`}
            >
              Score:{" "}
              {selectedInterview.score || 0}
              /5
            </div>

            {/* QUESTION */}
            <div className="history-detail-section">
              <h3>Question</h3>

              <p>
                {selectedInterview.question ||
                  "Question not available."}
              </p>
            </div>

            {/* ANSWER */}
            <div className="history-detail-section">
              <h3>Your Answer</h3>

              <p>
                {selectedInterview.answer ||
                  "Answer available nahi hai."}
              </p>
            </div>

            {/* FEEDBACK */}
            <div className="history-detail-section feedback-detail">
              <h3>AI Feedback</h3>

              <p>
                {selectedInterview.feedback ||
                  "Feedback available nahi hai."}
              </p>
            </div>

            {/* DONE */}
            <button
              type="button"
              className="history-modal-done"
              onClick={() =>
                setSelectedInterview(null)
              }
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}