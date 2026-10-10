import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/carrierRoadmap.css";
import { generateCareerRoadmap } from "../services/gemini";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CareerRoadmap() {
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!goal) {
      alert("Please select a career goal");
      return;
    }

    try {
      setLoading(true);
      setCopied(false);

      const result = await generateCareerRoadmap({
        goal,
        currentSkills:
          "HTML, CSS, JavaScript, React, PHP, Laravel, MySQL, Git, Bootstrap",
        experience: "Fresher",
      });

      setRoadmap(result);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roadmap);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">

          {/* Generator Card */}
          <div className="card border-0 shadow p-4 roadmap-generator-card">
            <h2>🗺 AI Career Roadmap</h2>

            <p className="text-muted">
              Select your career goal and let AI generate a personalized
              roadmap.
            </p>

            <select
              className="form-select mt-3"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="">Choose Career</option>
              <option value="Frontend Developer">
                Frontend Developer
              </option>
              <option value="Backend Developer">
                Backend Developer
              </option>
              <option value="Full Stack Developer">
                Full Stack Developer
              </option>
              <option value="AI Engineer">
                AI Engineer
              </option>
              <option value="Data Analyst">
                Data Analyst
              </option>
              <option value="Cyber Security">
                Cyber Security
              </option>
            </select>

            <button
              className="btn btn-primary mt-3"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "⏳ Generating..." : "🚀 Generate Roadmap"}
            </button>
          </div>

          {/* Result */}
          {roadmap && (
            <div className="roadmap-result-card mt-4">

              <div className="roadmap-result-header">
                <div>
                  <span className="roadmap-badge">
                    ✨ AI Generated
                  </span>

                  <h3>🗺 Your Career Roadmap</h3>

                  <p>
                    Personalized learning plan for{" "}
                    <strong>{goal}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="roadmap-copy-btn"
                  onClick={handleCopy}
                >
                  {copied ? "✅ Copied" : "📋 Copy"}
                </button>
              </div>

              {/* Markdown */}
              <div className="roadmap-content markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                >
                  {roadmap}
                </ReactMarkdown>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}