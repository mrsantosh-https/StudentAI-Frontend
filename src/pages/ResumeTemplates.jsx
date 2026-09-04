import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import ModernTemplate from "../components/resumeTemplates/ModernTemplate";
import CorporateTemplate from "../components/resumeTemplates/CorporateTemplate";
import ProfessionalTemplate from "../components/resumeTemplates/ProfessionalTemplate";
import MinimalTemplate from "../components/resumeTemplates/MinimalTemplate";
import CreativeTemplate from "../components/resumeTemplates/CreativeTemplate";

import "../styles/resumeTemplates.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function ResumeTemplates() {
  const { id } = useParams();

  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Two-column modern resume",
    },
    {
      id: "professional",
      name: "Professional",
      description: "ATS-friendly professional style",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean and simple layout",
    },
    {
      id: "corporate",
      name: "Corporate",
      description: "Formal corporate resume",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Colorful creative design",
    },
  ];

  useEffect(() => {
    // Agar ID nahi hai to API call mat karo
    if (!id) {
      return;
    }

    const fetchResume = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await axios.get(`${API_URL}/resumes/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const resume =
          response.data.resume ||
          response.data.data ||
          response.data;

        setResumeData(resume);
      } catch (err) {
        console.error("Resume fetch failed:", err);

        if (err.response?.status === 404) {
          setError("Resume not found.");
        } else if (err.response?.status === 401) {
          setError("Please login again. Your session has expired.");
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Unable to load resume. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case "modern":
        return <ModernTemplate resume={resumeData} />;

      case "professional":
        return <ProfessionalTemplate resume={resumeData} />;

      case "minimal":
        return <MinimalTemplate resume={resumeData} />;

      case "corporate":
        return <CorporateTemplate resume={resumeData} />;

      case "creative":
        return <CreativeTemplate resume={resumeData} />;

      default:
        return <ModernTemplate resume={resumeData} />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ID missing hone par render ke through error show karo
  if (!id) {
    return (
      <div className="resume-page-status resume-error-state">
        <h2>Unable to Open Resume</h2>
        <p>Resume ID is missing.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="resume-page-status">
        <div className="resume-loading-spinner"></div>
        <h2>Loading Resume...</h2>
        <p>Please wait while we prepare your resume.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resume-page-status resume-error-state">
        <h2>Unable to Open Resume</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="resume-page-status resume-error-state">
        <h2>Resume Not Found</h2>
        <p>No resume data is available for this ID.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <div className="resume-templates-page">
          <div className="templates-page-header">
            <div>
              <span className="templates-badge">Resume Studio</span>

              <h1>Choose Your Resume Template</h1>

              <p>
                Select a template and see your resume update instantly in the
                live preview.
              </p>
            </div>

            <button
              type="button"
              className="download-resume-btn"
              onClick={handlePrint}
            >
              Download PDF
            </button>
          </div>

          <div className="template-selector-section">
            <h2>Select Template</h2>

            <div className="template-selector-grid">
              {templates.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  className={`template-selector-card ${
                    selectedTemplate === template.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="template-card-preview">
                    <span>{template.name.charAt(0)}</span>
                  </div>

                  <div className="template-card-info">
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                  </div>

                  {selectedTemplate === template.id && (
                    <span className="selected-template-mark">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="live-preview-section">
            <div className="preview-section-header">
              <div>
                <span className="live-indicator">
                  <span className="live-indicator-dot"></span>
                  Live Preview
                </span>

                <h2>
                  {templates.find(
                    (template) => template.id === selectedTemplate
                  )?.name || "Modern"}{" "}
                  Template
                </h2>
              </div>

              <button
                type="button"
                className="print-resume-btn"
                onClick={handlePrint}
              >
                Print Resume
              </button>
            </div>

            <div className="resume-preview-wrapper">
              {renderTemplate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}