import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBriefcase,
  FaCheckCircle,
  FaRedo,
  FaStar,
  FaUserGraduate,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import { API_URL } from "../services/api";
import "../styles/mockInterviewResult.css";

export default function MockInterviewResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchInterviewResult();
  }, [id]);

  const fetchInterviewResult = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/mock-interview/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load mock interview result."
        );
      }

      const allRecords = Array.isArray(data.data) ? data.data : [];

      const selectedRecord = allRecords.find(
        (item) => String(item.id) === String(id)
      );

      if (!selectedRecord) {
        throw new Error("Mock interview result not found.");
      }

      const selectedCreatedAt = new Date(
        selectedRecord.created_at
      ).getTime();

      const groupedRecords = allRecords
        .filter((item) => {
          const itemCreatedAt = new Date(item.created_at).getTime();

          const sameRole = item.role === selectedRecord.role;
          const sameExperience =
            item.experience === selectedRecord.experience;

          const closeInTime =
            Math.abs(selectedCreatedAt - itemCreatedAt) <
            60 * 60 * 1000;

          return sameRole && sameExperience && closeInTime;
        })
        .sort(
          (first, second) =>
            Number(first.question_no) - Number(second.question_no)
        );

      setRecords(
        groupedRecords.length > 0 ? groupedRecords : [selectedRecord]
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const overallScore = useMemo(() => {
    if (records.length === 0) return 0;

    const totalScore = records.reduce(
      (total, item) => total + Number(item.score || 0),
      0
    );

    return Math.round(totalScore / records.length);
  }, [records]);

  const scoreLabel = useMemo(() => {
    if (overallScore >= 85) {
      return {
        title: "Excellent Performance",
        message:
          "Your interview answers were strong, relevant and confident.",
      };
    }

    if (overallScore >= 70) {
      return {
        title: "Good Performance",
        message:
          "You performed well. A little more practice can make your answers stronger.",
      };
    }

    if (overallScore >= 50) {
      return {
        title: "Average Performance",
        message:
          "Your basics are good, but your answers need more detail and examples.",
      };
    }

    return {
      title: "Needs Improvement",
      message:
        "Practice core concepts and give structured answers with practical examples.",
    };
  }, [overallScore]);

  const completedAnswers = records.filter((item) =>
    item.answer?.trim()
  ).length;

  const role = records[0]?.role || "Mock Interview";
  const experience = records[0]?.experience || "Not specified";

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRetakeInterview = () => {
    navigate("/mock-interview");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content">
          <div className="mock-result-page">
            {loading ? (
              <div className="mock-result-loading">
                <div className="result-spinner"></div>
                <p>Loading interview result...</p>
              </div>
            ) : errorMessage || records.length === 0 ? (
              <div className="mock-result-error">
                <h2>Result not found</h2>

                <p>
                  {errorMessage ||
                    "The requested mock interview result is unavailable."}
                </p>

                <Link
                  to="/mock-interview-history"
                  className="result-primary-btn"
                >
                  <FaArrowLeft />
                  Back to History
                </Link>
              </div>
            ) : (
              <div className="mock-result-container">
                <div className="mock-result-topbar">
                  <button
                    type="button"
                    className="result-back-btn"
                    onClick={() => navigate(-1)}
                  >
                    <FaArrowLeft />
                    Back
                  </button>

                  <div className="result-top-actions">
                    <button
                      type="button"
                      className="result-retake-btn"
                      onClick={handleRetakeInterview}
                    >
                      <FaRedo />
                      Retake Interview
                    </button>
                  </div>
                </div>

                <section className="result-hero-card">
                  <div className="result-hero-info">
                    <span className="result-tag">
                      AI Mock Interview Result
                    </span>

                    <h1>{role}</h1>

                    <p>
                      Review your answers, AI feedback and
                      question-wise performance.
                    </p>

                    <div className="result-meta">
                      <span>
                        <FaBriefcase />
                        {role}
                      </span>

                      <span>
                        <FaUserGraduate />
                        {experience}
                      </span>

                      <span>
                        <FaCheckCircle />
                        {completedAnswers}/{records.length} answered
                      </span>
                    </div>
                  </div>

                  <div className="result-score-section">
                    <div
                      className="result-score-circle"
                      style={{
                        "--score": `${overallScore * 3.6}deg`,
                      }}
                    >
                      <div className="result-score-inner">
                        <strong>{overallScore}</strong>
                        <span>/ 100</span>
                      </div>
                    </div>

                    <div className="score-description">
                      <h3>{scoreLabel.title}</h3>
                      <p>{scoreLabel.message}</p>
                    </div>
                  </div>
                </section>

                <section className="result-stats-grid">
                  <article className="result-stat-card">
                    <span>Total Questions</span>
                    <strong>{records.length}</strong>
                  </article>

                  <article className="result-stat-card">
                    <span>Answered</span>
                    <strong>{completedAnswers}</strong>
                  </article>

                  <article className="result-stat-card">
                    <span>Average Score</span>
                    <strong>{overallScore}%</strong>
                  </article>

                  <article className="result-stat-card">
                    <span>Interview Date</span>
                    <strong className="result-date">
                      {formatDate(records[0]?.created_at)}
                    </strong>
                  </article>
                </section>

                <section className="result-summary-card">
                  <div className="result-section-heading">
                    <div>
                      <span>Performance overview</span>
                      <h2>Interview Summary</h2>
                    </div>

                    <FaStar />
                  </div>

                  <div className="result-progress-info">
                    <div className="result-progress-text">
                      <span>Overall interview score</span>
                      <strong>{overallScore}%</strong>
                    </div>

                    <div className="result-progress-track">
                      <div
                        className="result-progress-fill"
                        style={{
                          width: `${Math.min(overallScore, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <p className="result-summary-text">
                    You completed {completedAnswers} out of{" "}
                    {records.length} interview questions for the{" "}
                    <strong>{role}</strong> role. Review each answer
                    below and use the AI feedback to improve your next
                    interview attempt.
                  </p>
                </section>

                <section className="result-question-section">
                  <div className="result-section-title">
                    <span>Detailed review</span>
                    <h2>Question-wise Performance</h2>
                  </div>

                  <div className="result-question-list">
                    {records.map((item, index) => {
                      const itemScore = Number(item.score || 0);

                      return (
                        <article
                          className="result-question-card"
                          key={item.id}
                        >
                          <div className="question-card-header">
                            <div className="question-number">
                              {item.question_no || index + 1}
                            </div>

                            <div className="question-title">
                              <span>
                                Question{" "}
                                {item.question_no || index + 1}
                              </span>

                              <h3>{item.question}</h3>
                            </div>

                            <div className="question-score">
                              <strong>{itemScore}</strong>
                              <span>/ 100</span>
                            </div>
                          </div>

                          <div className="question-score-bar">
                            <div
                              style={{
                                width: `${Math.min(itemScore, 100)}%`,
                              }}
                            ></div>
                          </div>

                          <div className="question-content-grid">
                            <div className="answer-box">
                              <span>Your Answer</span>

                              <p>
                                {item.answer ||
                                  "No answer was submitted."}
                              </p>
                            </div>

                            <div className="feedback-box">
                              <span>AI Feedback</span>

                              <p>
                                {item.feedback ||
                                  "No feedback is available for this answer."}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <div className="result-bottom-actions">
                  <Link
                    to="/mock-interview-history"
                    className="result-secondary-btn"
                  >
                    <FaArrowLeft />
                    Interview History
                  </Link>

                  <button
                    type="button"
                    className="result-primary-btn"
                    onClick={handleRetakeInterview}
                  >
                    <FaRedo />
                    Retake Interview
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}