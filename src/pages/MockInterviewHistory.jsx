import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/mockInterviewHistory.css";
import { Link } from "react-router-dom";


const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function MockInterviewHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!token) {
      toast.error("Please login first");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/mock-interview/history`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(response.data.data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Mock interview history load nahi ho saki"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return history;
    }

    return history.filter((item) => {
      return (
        item.role?.toLowerCase().includes(keyword) ||
        item.experience?.toLowerCase().includes(keyword) ||
        item.question?.toLowerCase().includes(keyword)
      );
    });
  }, [history, search]);

  const averageScore = useMemo(() => {
    if (!history.length) {
      return 0;
    }

    const total = history.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    );

    return (total / history.length).toFixed(1);
  }, [history]);

  const highestScore = useMemo(() => {
    if (!history.length) {
      return 0;
    }

    return Math.max(
      ...history.map((item) => Number(item.score || 0))
    );
  }, [history]);

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getScoreClass = (score) => {
    const value = Number(score || 0);

    if (value >= 8) {
      return "score-high";
    }

    if (value >= 5) {
      return "score-medium";
    }

    return "score-low";
  };

  const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want delete interview history?"
  );

  if (!confirmed) {
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
      previousHistory.filter((item) => item.id !== id)
    );

    if (selectedInterview?.id === id) {
      setSelectedInterview(null);
    }

    toast.success("Mock interview history deleted");
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message ||
        "History note deleted"
    );
  }
};

  return (
    <div className="mock-history-layout">
      <Sidebar />

      <main className="mock-history-main">
        <Topbar />

        <div className="mock-history-page">
          <div className="mock-history-header">
            <div>
              <h1>Mock Interview History</h1>
              <p>
                Review your AI mock interview questions, answers and feedback.
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

          <div className="mock-history-stats">
            <div className="history-stat-card">
              <span>Total Interviews</span>
              <strong>{history.length}</strong>
            </div>

            <div className="history-stat-card">
              <span>Average Score</span>
              <strong>{averageScore}/10</strong>
            </div>

            <div className="history-stat-card">
              <span>Highest Score</span>
              <strong>{highestScore}/10</strong>
            </div>
          </div>

          <div className="mock-history-toolbar">
            <input
              type="search"
              placeholder="Search by role, experience or question..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <span>
              {filteredHistory.length} record
              {filteredHistory.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading && (
            <div className="history-state-box">
              <div className="history-loader"></div>
              <p>Loading mock interview history...</p>
            </div>
          )}

          {!loading && filteredHistory.length === 0 && (
            <div className="history-state-box">
              <div className="empty-history-icon">🎤</div>
              <h2>No mock interview found</h2>
              <p>
                Complete your first AI mock interview to see it here.
              </p>
            </div>
          )}

          {!loading && filteredHistory.length > 0 && (
            <div className="mock-history-grid">
              {filteredHistory.map((item) => (
                <article
                  className="mock-history-card"
                  key={item.id}
                >
                  <div className="history-card-top">
                    <div>
                      <span className="history-role">
                        {item.role || "Unknown Role"}
                      </span>

                      <p>
                        {item.experience || "Fresher"}
                      </p>
                    </div>

                    <div
                      className={`history-score ${getScoreClass(
                        item.score
                      )}`}
                    >
                      {item.score || 0}/10
                    </div>
                  </div>

                  <div className="history-question">
                    <span>Question</span>
                    <p>{item.question}</p>
                  </div>

                  <div className="history-card-footer">
                <span>{formatDate(item.created_at)}</span>

                <div className="history-card-actions">
                    <Link
                      to={`/mock-interview-result/${item.id}`}
                      className="view-result-btn"
                    >
                      View Result
                    </Link>
                    <button
                    type="button"
                    className="history-view-btn"
                    onClick={() => setSelectedInterview(item)}
                    >
                    View Details
                    </button>

                    <button
                    type="button"
                    className="history-delete-btn"
                    onClick={() => handleDelete(item.id)}
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

      {selectedInterview && (
        <div
          className="history-modal-overlay"
          onClick={() => setSelectedInterview(null)}
        >
          <div
            className="history-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="history-modal-header">
              <div>
                <h2>{selectedInterview.role}</h2>
                <p>{selectedInterview.experience}</p>
              </div>

              <button
                type="button"
                className="history-modal-close"
                onClick={() => setSelectedInterview(null)}
              >
                ×
              </button>
            </div>

            <div className="history-modal-score">
              Score: {selectedInterview.score || 0}/10
            </div>

            <div className="history-detail-section">
              <h3>Question</h3>
              <p>{selectedInterview.question}</p>
            </div>

            <div className="history-detail-section">
              <h3>Your Answer</h3>
              <p>
                {selectedInterview.answer ||
                  "Answer available nahi hai."}
              </p>
            </div>

            <div className="history-detail-section feedback-detail">
              <h3>AI Feedback</h3>
              <p>
                {selectedInterview.feedback ||
                  "Feedback available nahi hai."}
              </p>
            </div>

            <button
              type="button"
              className="history-modal-done"
              onClick={() => setSelectedInterview(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}