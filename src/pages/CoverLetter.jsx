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
  const [copied, setCopied] = useState(false);

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
      setCopied(false);

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

  /* =====================================================
     COPY COVER LETTER
  ===================================================== */

  const handleCopy = async () => {
    if (!coverLetter) {
      return;
    }

    try {
      await navigator.clipboard.writeText(coverLetter);

      setCopied(true);

      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Cover letter copied to clipboard.",
        timer: 1200,
        showConfirmButton: false,
      });

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);

      Swal.fire({
        icon: "error",
        title: "Copy Failed",
        text: "Unable to copy cover letter.",
      });
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

        <div className="dashboard-content cover-letter-page">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="cover-page-header">
            <div>
              <h2>🤖 AI Cover Letter Generator</h2>

              <p>
                Generate a professional cover letter for any job.
              </p>
            </div>
          </div>


          <div className="row mt-4">

            {/* =================================================
                FORM
            ================================================= */}

            <div className="col-lg-5 mb-4">

              <div className="card border-0 shadow-sm p-4 cover-form-card">

                <div className="cover-form-header">
                  <span className="cover-form-icon">
                    ✨
                  </span>

                  <div>
                    <h4>Build Your Cover Letter</h4>

                    <p>
                      Enter your job details
                    </p>
                  </div>
                </div>

                <div className="cover-input-group">

                  <label>
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="company"
                    className="form-control"
                    placeholder="e.g. Google"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={loading}
                  />

                </div>


                <div className="cover-input-group">

                  <label>
                    Job Role
                  </label>

                  <input
                    type="text"
                    name="role"
                    className="form-control"
                    placeholder="e.g. Frontend Developer"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                  />

                </div>


                <div className="cover-input-group">

                  <label>
                    Skills & Experience
                  </label>

                  <textarea
                    name="details"
                    className="form-control"
                    rows="7"
                    placeholder="Example: I have experience with React, JavaScript, HTML, CSS and REST APIs..."
                    value={formData.details}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <small>
                    Minimum 20 characters
                  </small>

                </div>


                <button
                  type="button"
                  className="btn btn-primary cover-generate-btn"
                  onClick={handleGenerate}
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      Generating...
                    </>
                  ) : (
                    <>
                      ✨ Generate Cover Letter
                    </>
                  )}

                </button>

              </div>

            </div>


            {/* =================================================
                GENERATED COVER LETTER
            ================================================= */}

            <div className="col-lg-7 mb-4">

              <div className="card border-0 shadow p-4 cover-output">

                {/* OUTPUT HEADER */}

                <div className="cover-output-header">

                  <div>

                    <span className="cover-ai-badge">
                      🤖 AI Generated
                    </span>

                    <h4>
                      Generated Cover Letter
                    </h4>

                    <p>
                      Your personalized professional letter
                    </p>

                  </div>


                  {coverLetter && !loading && (
                    <button
                      type="button"
                      className={`cover-copy-btn ${
                        copied ? "copied" : ""
                      }`}
                      onClick={handleCopy}
                    >
                      {copied
                        ? "✅ Copied"
                        : "📋 Copy"}
                    </button>
                  )}

                </div>


                <hr />


                {/* OUTPUT */}

                <div className="cover-document-wrapper">

                  {loading ? (
                    <div className="cover-loading">

                      <div className="cover-loading-icon">
                        ✨
                      </div>

                      <h5>
                        Creating your cover letter...
                      </h5>

                      <p>
                        AI is writing a professional,
                        personalized letter for you.
                      </p>

                      <div className="cover-loading-bar">
                        <span />
                      </div>

                    </div>
                  ) : coverLetter ? (
                    <div className="cover-document">

                      <div className="cover-document-top">
                        <span>
                          {formData.company}
                        </span>

                        <span>
                          {formData.role}
                        </span>
                      </div>

                      <div className="cover-document-content">
                        {coverLetter}
                      </div>

                    </div>
                  ) : (
                    <div className="cover-empty">

                      <div className="cover-empty-icon">
                        📄
                      </div>

                      <h5>
                        Your cover letter will appear here
                      </h5>

                      <p>
                        Fill in your details and click
                        <strong>
                          {" "}Generate Cover Letter
                        </strong>.
                      </p>

                    </div>
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