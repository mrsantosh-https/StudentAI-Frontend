import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import toast from "react-hot-toast";

import "../styles/interview.css";

import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} from "../services/gemini";

import ReactMarkdown from "react-markdown";

export default function Interview() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  // Extract score from AI feedback
  const extractScore = (text) => {
    if (!text) return null;

    const patterns = [
      /(?:\*\*)?Score(?:\*\*)?\s*:\s*(\d+)\s*\/\s*10/i,
      /(\d+)\s*\/\s*10/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);

      if (match) {
        const score = Number(match[1]);

        if (score >= 0 && score <= 10) {
          return score * 10;
        }
      }
    }

    return null;
  };

  const handleGenerate = async () => {
    if (!role.trim()) {
      toast.error("Please enter a role");
      return;
    }

    try {
      setLoading(true);
      setFeedback("");
      setSelectedQuestion("");
      setAnswer("");

      const result = await generateInterviewQuestions(role);

      const questionArray = result
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q !== "");

      setQuestions(questionArray);

      toast.success("Questions generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedQuestion.trim()) {
      toast.error("Please select or enter a question");
      return;
    }

    if (!answer.trim()) {
      toast.error("Please write your answer");
      return;
    }

    try {
      setLoading(true);

      const result = await evaluateInterviewAnswer(
        selectedQuestion,
        answer
      );

      setFeedback(result);

      const score = extractScore(result);

      await api.post("/interview-history", {
        role,
        question: selectedQuestion,
        answer,
        feedback: result,
        score,
      });

      toast.success("Feedback saved to history");
    } catch (error) {
      console.error(error);
      toast.error("Failed to evaluate/save interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content interview-page">

          {/* PAGE HEADER */}
          <div className="interview-page-header">
            <h2>🎤 AI Interview Assistant</h2>

            <p className="text-muted">
              Generate interview questions and get AI feedback on your answers.
            </p>
          </div>

          <div className="row mt-4">

            {/* LEFT COLUMN */}
            <div className="col-lg-4 mb-4">

              <div className="card border-0 shadow-sm p-4 interview-generator-card">

                <h4>🎯 Interview Setup</h4>

                <p className="interview-card-subtitle">
                  Enter your target job role
                </p>

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="e.g. React Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />

                <button
                  className="btn btn-primary interview-generate-btn"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Generating...
                    </>
                  ) : (
                    "Generate Questions"
                  )}
                </button>

              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="col-lg-8 mb-4">

              {/* QUESTIONS */}
              <div className="card border-0 shadow p-4 interview-card">

                <div className="interview-card-header">
                  <div>
                    <h4>Interview Questions</h4>
                    <p>Select a question to practice</p>
                  </div>

                  {questions.length > 0 && (
                    <span className="question-count">
                      {questions.length} Questions
                    </span>
                  )}
                </div>

                <hr />

                <div className="list-group interview-question-list">

                  {questions.length === 0 ? (
                    <div className="empty-questions">
                      <div className="empty-icon">💬</div>

                      <h5>No questions yet</h5>

                      <p>
                        Enter a role and click{" "}
                        <strong>Generate Questions</strong>.
                      </p>
                    </div>
                  ) : (
                    questions.map((question, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`list-group-item list-group-item-action question-item ${
                          selectedQuestion === question
                            ? "active-question"
                            : ""
                        }`}
                        onClick={() => setSelectedQuestion(question)}
                      >
                        <span className="question-number">
                          {index + 1}
                        </span>

                        <span className="question-text">
                          {question}
                        </span>
                      </button>
                    ))
                  )}

                </div>
              </div>

              {/* ANSWER PRACTICE */}
              <div className="card border-0 shadow p-4 mt-4 answer-practice-card">

                <div className="interview-card-header">
                  <div>
                    <h4>✍️ Answer Practice</h4>

                    <p>
                      Write your answer and let AI evaluate it.
                    </p>
                  </div>
                </div>

                <textarea
                  className="form-control interview-question-input mb-3"
                  rows="3"
                  placeholder="Paste or select an interview question here..."
                  value={selectedQuestion}
                  onChange={(e) =>
                    setSelectedQuestion(e.target.value)
                  }
                />

                <textarea
                  className="form-control interview-answer-input mb-3"
                  rows="7"
                  placeholder="Write your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />

                <button
                  className="btn btn-success interview-check-btn"
                  onClick={handleEvaluate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Checking...
                    </>
                  ) : (
                    "🤖 Check Answer"
                  )}
                </button>

              </div>

              {/* AI FEEDBACK */}
              <div className="card border-0 shadow p-4 mt-4 feedback-card">

                <div className="feedback-header">

                  <div>
                    <span className="feedback-badge">
                      🤖 AI Analysis
                    </span>

                    <h4>AI Feedback</h4>

                    <p>
                      Detailed analysis of your interview answer
                    </p>
                  </div>

                </div>

                <hr />

                <div className="feedback-content">

                  {!feedback ? (
                    <div className="feedback-empty">

                      <div className="feedback-empty-icon">
                        🤖
                      </div>

                      <h5>AI feedback will appear here</h5>

                      <p>
                        Answer an interview question and click{" "}
                        <strong>Check Answer</strong>.
                      </p>

                    </div>
                  ) : (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="feedback-h1">
                            {children}
                          </h1>
                        ),

                        h2: ({ children }) => (
                          <h2 className="feedback-h2">
                            {children}
                          </h2>
                        ),

                        h3: ({ children }) => (
                          <h3 className="feedback-h3">
                            {children}
                          </h3>
                        ),

                        p: ({ children }) => (
                          <p className="feedback-paragraph">
                            {children}
                          </p>
                        ),

                        ul: ({ children }) => (
                          <ul className="feedback-list">
                            {children}
                          </ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="feedback-list">
                            {children}
                          </ol>
                        ),

                        li: ({ children }) => (
                          <li>{children}</li>
                        ),

                        strong: ({ children }) => (
                          <strong>{children}</strong>
                        ),

                        code: ({ inline, children }) =>
                          inline ? (
                            <code className="feedback-inline-code">
                              {children}
                            </code>
                          ) : (
                            <pre className="feedback-code-block">
                              <code>{children}</code>
                            </pre>
                          ),

                        blockquote: ({ children }) => (
                          <blockquote className="feedback-blockquote">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {feedback}
                    </ReactMarkdown>
                  )}

                </div>

              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}