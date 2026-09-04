import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/coverLetter.css";
import Swal from "sweetalert2";
import SEO from "../components/SEO";
import { generateCoverLetter } from "../services/gemini";

export default function CoverLetter() {
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    details: "",
  });

  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleGenerate = async () => {
    const company = formData.company.trim();
    const role = formData.role.trim();
    const details = formData.details.trim();

    if (!company || !role || !details) {
      Swal.fire({
        icon: "warning",
        title: "All Fields Required",
        text: "Company name, job role aur skills/experience fill karein.",
      });

      return;
    }

    if (details.length < 20) {
      Swal.fire({
        icon: "warning",
        title: "Details Too Short",
        text: "Skills and experience kam se kam 20 characters ka hona chahiye.",
      });

      return;
    }

    try {
      setLoading(true);
      setCoverLetter("");

      const result = await generateCoverLetter({
        company,
        role,
        details,
      });

      if (!result) {
        throw new Error("AI returned an empty cover letter.");
      }

      setCoverLetter(result);
    } catch (error) {
      console.error("Cover letter generation error:", error);

      Swal.fire({
        icon: "error",
        title: "Generation Failed",
        text:
          error.message ||
          "Cover letter generate nahi ho saka. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />
        <SEO
          title="AI Cover Letter Generator - StudentAI"
          description="Generate professional and personalized cover letters using artificial intelligence."
        />
        <div className="dashboard-content">
          <h2>🤖 AI Cover Letter Generator</h2>

          <p className="text-muted">
            Generate a professional cover letter for any job.
          </p>

          <div className="row mt-4">
            <div className="col-lg-5 mb-4">
              <div className="card border-0 shadow-sm p-4">
                <input
                  type="text"
                  name="company"
                  className="form-control mb-3"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={loading}
                />

                <input
                  type="text"
                  name="role"
                  className="form-control mb-3"
                  placeholder="Job Role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                />

                <textarea
                  name="details"
                  className="form-control mb-3"
                  rows="5"
                  placeholder="Your skills and experience"
                  value={formData.details}
                  onChange={handleChange}
                  disabled={loading}
                ></textarea>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading
                    ? "Generating..."
                    : "✨ Generate Cover Letter"}
                </button>
              </div>
            </div>

            <div className="col-lg-7 mb-4">
              <div className="card border-0 shadow p-4 cover-output">
                <h4>Generated Cover Letter</h4>

                <hr />

                <div className="cover-text">
                  {loading
                    ? "Generating your professional cover letter..."
                    : coverLetter ||
                      "Your cover letter will appear here..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}