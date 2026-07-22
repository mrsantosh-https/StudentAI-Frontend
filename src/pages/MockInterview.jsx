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

  // Current question
  const [interview, setInterview] = useState(null);

  // Current answer
  const [answer, setAnswer] = useState("");

  // Evaluated result of previous/current question
  const [result, setResult] = useState(null);

  // Backend se aaya next question
  const [nextInterview, setNextInterview] = useState(null);

  // Interview completion state
  const [completed, setCompleted] = useState(false);
  const [averageScore, setAverageScore] = useState(null);

  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  /*
  |--------------------------------------------------------------------------
  | Start interview
  |--------------------------------------------------------------------------
  */

  const startInterview = async (event) => {
    event.preventDefault();

    if (!role.trim()) {
      toast.error("Please enter a job role or programming language");
      return;
    }

    try {
      setStarting(true);

      setInterview(null);
      setResult(null);
      setNextInterview(null);
      setCompleted(false);
      setAverageScore(null);
      setAnswer("");

      const response = await axios.post(
        `${API_URL}/mock-interview/start`,
        {
          role: role.trim(),
          experience,
        },
        { headers }
      );

      setInterview(response.data.data);

      toast.success("Mock interview started");
    } catch (error) {
      console.error("Start interview error:", error);

      toast.error(
        error.response?.data?.message ||
          "Mock interview start nahi ho saka"
      );
    } finally {
      setStarting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Submit current answer
  |--------------------------------------------------------------------------
  */

  const submitAnswer = async (event) => {
    event.preventDefault();

    if (!interview?.id) {
      toast.error("Interview question available nahi hai");
      return;
    }

    if (answer.trim().length < 10) {
      toast.error(
        "Answer kam se kam 10 characters ka hona chahiye"
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/mock-interview/answer`,
        {
          interview_id: interview.id,
          answer: answer.trim(),
        },
        { headers }
      );

      /*
       * Interview ke question 1-9 ke response me:
       * previous_result = evaluated question
       * next_question = next generated question
       */
      if (!response.data.completed) {
        setResult(response.data.previous_result);
        setNextInterview(response.data.next_question);
        setCompleted(false);

        toast.success(
          `Question ${interview.question_no} evaluated successfully`
        );

        return;
      }

      /*
       * Question 10 complete hone par
       */
      setResult(response.data.data);
      setNextInterview(null);
      setCompleted(true);
      setAverageScore(response.data.average_score ?? null);

      toast.success("Mock interview completed successfully");
    } catch (error) {
      console.error("Submit answer error:", error);

      toast.error(
        error.response?.data?.message ||
          "Answer evaluate nahi ho saka"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Move to next question
  |--------------------------------------------------------------------------
  */

  const goToNextQuestion = () => {
    if (!nextInterview) {
      toast.error("Next question available nahi hai");
      return;
    }

    setInterview(nextInterview);
    setNextInterview(null);
    setResult(null);
    setAnswer("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Restart interview
  |--------------------------------------------------------------------------
  */

  const restartInterview = () => {
    setInterview(null);
    setResult(null);
    setNextInterview(null);
    setAnswer("");
    setRole("");
    setExperience("Fresher");
    setCompleted(false);
    setAverageScore(null);
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
              Practice questions one by one and get instant AI
              feedback.
            </p>
          </div>

          {/* Start interview form */}

          {!interview && !result && (
            <div className="mock-card">
              <h2>Start New Interview</h2>

              <form onSubmit={startInterview}>
                <div className="mock-form-group">
                  <label htmlFor="job-role">
                    Job Role or Programming Language
                  </label>

                  <input
                    id="job-role"
                    type="text"
                    placeholder="Example: PHP, Java, React Developer"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                    disabled={starting}
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
                    disabled={starting}
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

          {/* Current question */}

          {interview && !result && (
            <div className="mock-card">
              <div className="mock-badges">
                <span>{interview.role}</span>

                <span>{interview.experience}</span>

                <span>
                  Question {interview.question_no || 1} / 5
                </span>
              </div>

              <div className="mock-progress-wrapper">
                <div className="mock-progress-info">
                  <span>Interview Progress</span>

                  <span>
                    {Math.min(
                      (interview.question_no || 1) * 5,
                      100
                    )}
                    %
                  </span>
                </div>

                <div className="mock-progress-track">
                  <div
                    className="mock-progress-bar"
                    style={{
                      width: `${Math.min(
                        (interview.question_no || 1) * 5,
                        100
                      )}%`,
                    }}
                  />
                </div>
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
                    disabled={submitting}
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
                    : interview.question_no >= 5
                      ? "Submit Final Answer"
                      : "Submit Answer"}
                </button>
              </form>
            </div>
          )}

          {/* Evaluated result */}

          {result && (
            <div className="mock-card">
              <div className="mock-result-heading">
                <p>
                  {completed
                    ? "Final Question Score"
                    : `Question ${result.question_no} Score`}
                </p>

                <div className="mock-score">
                  {result.score}
                  <span>/10</span>
                </div>
              </div>

              {completed && averageScore !== null && (
                <div className="mock-average-score">
                  <span>Overall Average Score</span>

                  <strong>{averageScore}/10</strong>
                </div>
              )}

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

              {!completed && nextInterview && (
                <button
                  type="button"
                  className="mock-primary-btn"
                  onClick={goToNextQuestion}
                >
                  Continue to Question{" "}
                  {nextInterview.question_no}
                </button>
              )}

              {completed && (
                <div className="mock-completed-actions">
                  <div className="mock-completed-message">
                    🎉 Your 10-question mock interview has been
                    completed.
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
          )}
        </div>
      </div>
    </div>
  );
}