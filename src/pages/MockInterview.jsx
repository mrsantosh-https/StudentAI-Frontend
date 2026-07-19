import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/mockInterview.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function MockInterview() {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("Fresher");
  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  const startInterview = async (event) => {
    event.preventDefault();

    if (!role.trim()) {
      toast.error("Please enter a job role");
      return;
    }

    try {
      setStarting(true);
      setResult(null);
      setAnswer("");

      const response = await axios.post(
        `${API_URL}/mock-interview/start`,
        {
          role,
          experience,
        },
        { headers }
      );

      setInterview(response.data.data);
      toast.success("Mock interview started");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Mock interview start nahi ho saka"
      );
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async (event) => {
    event.preventDefault();

    if (answer.trim().length < 10) {
      toast.error("Answer kam se kam 10 characters ka hona chahiye");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/mock-interview/answer`,
        {
          interview_id: interview.id,
          answer,
        },
        { headers }
      );

      setResult(response.data.data);
      toast.success("Answer evaluated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Answer evaluate nahi ho saka"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const restartInterview = () => {
    setInterview(null);
    setResult(null);
    setAnswer("");
    setRole("");
    setExperience("Fresher");
  };

  return (
    <div className="mock-layout">
      <Sidebar />

      <div className="mock-main">
        <Topbar />

        <div className="mock-page">
          <div className="mock-heading">
            <span className="mock-icon">🎤</span>
            <h1>AI Mock Interview</h1>
            <p>
              Practice interview questions and get instant AI feedback.
            </p>
          </div>

          {!interview && (
            <div className="mock-card">
              <h2>Start New Interview</h2>

              <form onSubmit={startInterview}>
                <div className="mock-form-group">
                  <label htmlFor="job-role">Job Role</label>

                  <input
                    id="job-role"
                    type="text"
                    placeholder="Example: PHP Developer"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  />
                </div>

                <div className="mock-form-group">
                  <label htmlFor="experience">
                    Experience Level
                  </label>

                  <select
                    id="experience"
                    value={experience}
                    onChange={(event) =>
                      setExperience(event.target.value)
                    }
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="1-3 Years">1–3 Years</option>
                    <option value="3-5 Years">3–5 Years</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="mock-primary-btn"
                  disabled={starting}
                >
                  {starting
                    ? "Starting Interview..."
                    : "Start AI Interview"}
                </button>
              </form>
            </div>
          )}

          {interview && !result && (
            <div className="mock-card">
              <div className="mock-badges">
                <span>{interview.role}</span>
                <span>
                  Question {interview.question_no || 1}
                </span>
              </div>

              <div className="mock-question-box">
                <small>Interview Question</small>
                <h2>{interview.question}</h2>
              </div>

              <form onSubmit={submitAnswer}>
                <div className="mock-form-group">
                  <label htmlFor="answer">Your Answer</label>

                  <textarea
                    id="answer"
                    rows="7"
                    placeholder="Write your answer here..."
                    value={answer}
                    onChange={(event) =>
                      setAnswer(event.target.value)
                    }
                  />
                </div>

                <div className="mock-char-count">
                  {answer.length} characters
                </div>

                <button
                  type="submit"
                  className="mock-success-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "AI is evaluating..."
                    : "Submit Answer"}
                </button>
              </form>
            </div>
          )}

          {result && (
            <div className="mock-card">
              <div className="mock-result-heading">
                <p>Your Interview Score</p>

                <div className="mock-score">
                  {result.score}
                  <span>/10</span>
                </div>
              </div>

              <div className="mock-result-section">
                <h3>Question</h3>
                <p>{result.question}</p>
              </div>

              <div className="mock-result-section">
                <h3>Your Answer</h3>
                <p>{result.answer}</p>
              </div>

              <div className="mock-feedback">
                <h3>AI Feedback</h3>
                <p>{result.feedback}</p>
              </div>

              <button
                type="button"
                className="mock-primary-btn"
                onClick={restartInterview}
              >
                Start New Interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}