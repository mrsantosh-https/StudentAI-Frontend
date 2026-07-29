import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/carrierRoadmap.css";
import { generateCareerRoadmap } from "../services/gemini";
import ReactMarkdown from "react-markdown";

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
      currentSkills: "HTML, CSS, JavaScript, React, PHP, Laravel",
      experience: "Fresher",
    });

    setRoadmap(result);
  } catch (error) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <div className="card border-0 shadow p-4">

            <h2>🗺 AI Career Roadmap</h2>

            <p className="text-muted">
              Select your career goal and let AI generate a roadmap.
            </p>

            <select
              className="form-select mt-3"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="">Choose Career</option>

              <option>Frontend Developer</option>

              <option>Backend Developer</option>

              <option>Full Stack Developer</option>

              <option>AI Engineer</option>

              <option>Data Analyst</option>

              <option>Cyber Security</option>

            </select>
            <button
            className="btn btn-primary mt-3"
            onClick={handleGenerate}
            disabled={loading}
            >
            {loading ? "Generating..." : "Generate Roadmap"}
            </button>
        
          </div>
  
            {roadmap && (
              <div className="roadmap-result-card mt-4">
                <div className="roadmap-result-header">
                  <div>
                    <span className="roadmap-badge">AI Generated</span>
                    <h3>🗺 Your Career Roadmap</h3>
                    <p>{goal} ke liye personalized learning plan</p>
                  </div>

                  <button
                    type="button"
                    className="roadmap-copy-btn"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(roadmap);
                        setCopied(true);

                        setTimeout(() => {
                          setCopied(false);
                        }, 2000);
                      } catch (err) {
                        console.error("Copy failed:", err);
                      }
                    }}
                  >
                    {copied ? "✅ Copied" : "📋 Copy"}
                  </button>
                </div>

            <div className="roadmap-content markdown-body">
            <ReactMarkdown>{roadmap}</ReactMarkdown>
            </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}