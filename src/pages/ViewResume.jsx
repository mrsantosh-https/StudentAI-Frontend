import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import ModernTemplate from "../components/resumeTemplates/ModernTemplate";
import ProfessionalTemplate from "../components/resumeTemplates/ProfessionalTemplate";
import MinimalTemplate from "../components/resumeTemplates/MinimalTemplate";
import CorporateTemplate from "../components/resumeTemplates/CorporateTemplate";
import CreativeTemplate from "../components/resumeTemplates/CreativeTemplate";
import {
  checkATSScore,
  improveResume,
  matchJobDescription,
} from "../services/gemini";

export default function ViewResume() {
  const { id } = useParams();

  const [resume, setResume] = useState(null);

  const [atsResult, setAtsResult] = useState("");
  const [atsLoading, setAtsLoading] = useState(false);

  const [improveResult, setImproveResult] = useState("");
  const [improveLoading, setImproveLoading] = useState(false);

  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);

  const [loadingResume, setLoadingResume] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Fetch Resume
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const fetchResume = async () => {
      try {
        setLoadingResume(true);

        const response = await api.get(`/resumes/${id}`);

        const resumeData =
          response.data?.resume ||
          response.data?.data ||
          response.data;

        if (!resumeData) {
          throw new Error("Resume data receive nahi hua.");
        }

        if (isMounted) {
          setResume(resumeData);
        }
      } catch (error) {
        console.error(
          "Resume fetch error:",
          error.response?.data || error
        );

        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Resume load nahi ho saka."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingResume(false);
        }
      }
    };

    fetchResume();

    return () => {
      isMounted = false;
    };
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Template Renderer
  |--------------------------------------------------------------------------
  */

  const renderTemplate = () => {
  const selectedTemplate =
    resume?.template || "modern";

    switch (selectedTemplate) {
      case "professional":  
        return <ProfessionalTemplate resume={resume} />;

      case "minimal":
        return <MinimalTemplate resume={resume} />;

      case "corporate":
        return <CorporateTemplate resume={resume} />;

      case "creative":
        return <CreativeTemplate resume={resume} />;

      case "modern":
      default:
        return <ModernTemplate resume={resume} />;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Download PDF
  |--------------------------------------------------------------------------
  */

  const downloadResumePDF = async () => {
    const input = document.getElementById("resume-template");

    if (!input) {
      toast.error("Resume preview not found.");
      return;
    }

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF(
        "p",
        "mm",
        "a4"
      );

      const pdfWidth =
        pdf.internal.pageSize.getWidth();

      const pdfHeight =
        pdf.internal.pageSize.getHeight();

      const imgHeight =
        (canvas.height * pdfWidth) /
        canvas.width;

      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        pdfWidth,
        imgHeight
      );

      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position =
          heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          pdfWidth,
          imgHeight
        );

        heightLeft -= pdfHeight;
      }

      const safeName =
        resume?.full_name
          ?.trim()
          ?.replace(/[^\w\s-]/g, "")
          ?.replace(/\s+/g, "_") ||
        "Resume";

      pdf.save(
        `${safeName}_Resume.pdf`
      );

      toast.success(
        "PDF downloaded successfully"
      );
    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      toast.error(
        "PDF download failed"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ATS Score Extractor
  |--------------------------------------------------------------------------
  */

  const extractATSScore = (text) => {
    if (!text) {
      return null;
    }

    const match = String(text).match(
      /ATS\s*Score\s*:\s*(\d{1,3})/i
    );

    if (!match) {
      return null;
    }

    const score =
      Number(match[1]);

    if (
      Number.isNaN(score) ||
      score < 0 ||
      score > 100
    ) {
      return null;
    }

    return score;
  };

  /*
  |--------------------------------------------------------------------------
  | ATS Check
  |--------------------------------------------------------------------------
  */

  const handleATSCheck = async () => {
    if (!resume || atsLoading) {
      return;
    }

    setAtsLoading(true);

    try {
      const result =
        await checkATSScore(resume);

      setAtsResult(result);

      const score =
        extractATSScore(result);

      if (score !== null) {
        await api.put(
          `/resumes/${id}/ats-score`,
          {
            ats_score: score,
          }
        );

        setResume(
          (previousResume) => ({
            ...previousResume,
            ats_score: score,
          })
        );
      }

      toast.success(
        score !== null
          ? "ATS score checked and saved"
          : "ATS analysis completed"
      );
    } catch (error) {
      console.error(
        "ATS check error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "ATS check failed"
      );
    } finally {
      setAtsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Improve Resume
  |--------------------------------------------------------------------------
  */

  const handleImproveResume = async () => {
    if (
      !resume ||
      improveLoading
    ) {
      return;
    }

    setImproveLoading(true);

    try {
      const result =
        await improveResume(resume);

      setImproveResult(
        typeof result === "string"
          ? result
          : JSON.stringify(
              result,
              null,
              2
            )
      );

      toast.success(
        "Resume improved"
      );
    } catch (error) {
      console.error(
        "Resume improvement error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Improve failed"
      );
    } finally {
      setImproveLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Job Matcher
  |--------------------------------------------------------------------------
  */

  const handleJobMatch = async () => {
    const cleanDescription =
      jobDescription.trim();

    if (!cleanDescription) {
      toast.error(
        "Please paste job description"
      );

      return;
    }

    if (
      cleanDescription.length < 20
    ) {
      toast.error(
        "Job description is too short"
      );

      return;
    }

    if (!resume?.id) {
      toast.error(
        "Resume ID not found"
      );

      return;
    }

    setMatchLoading(true);

    try {
      const response =
        await matchJobDescription(
          resume.id,
          cleanDescription
        );

      const result =
        response?.result ||
        response?.match_result ||
        response?.data ||
        response;

      setMatchResult(
        typeof result === "string"
          ? result
          : JSON.stringify(
              result,
              null,
              2
            )
      );

      toast.success(
        "Job match completed"
      );
    } catch (error) {
      console.error(
        "Job match error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Job match failed"
      );
    } finally {
      setMatchLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loadingResume) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <Topbar />

          <div className="dashboard-content">
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
                aria-hidden="true"
              />

              <p className="text-muted mt-3">
                Loading resume...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <Topbar />

          <div className="dashboard-content">
            <div className="card border-0 shadow p-4">
              <h4>Resume not found</h4>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | JSX
  |--------------------------------------------------------------------------
  */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <button
            className="btn btn-danger mb-3"
            onClick={downloadResumePDF}
          >
            📄 Download{" "}
            {resume.template
              ? `${resume.template
                  .charAt(0)
                  .toUpperCase()}${resume.template.slice(
                  1
                )}`
              : "Modern"}{" "}
            PDF
          </button>

          <button
            className="btn btn-primary mb-3 ms-2"
            onClick={handleATSCheck}
            disabled={atsLoading}
          >
            {atsLoading
              ? "Checking..."
              : "🤖 Check ATS Score"}
          </button>

          <button
            className="btn btn-success mb-3 ms-2"
            onClick={
              handleImproveResume
            }
            disabled={improveLoading}
          >
            {improveLoading
              ? "Improving..."
              : "✨ Improve Resume"}
          </button>

          <div className="card border-0 shadow p-4">
            <h4 className="mb-3">
              Resume Preview
            </h4>

            {renderTemplate()}
          </div>

          {atsResult && (
            <div className="card border-0 shadow p-4 mt-4 ats-card">
              <h4>
                🤖 ATS Analysis Result
              </h4>

              <hr />

              <div className="ats-result">
                {atsResult}
              </div>
            </div>
          )}

          {improveResult && (
            <div className="card border-0 shadow p-4 mt-4">
              <h4>
                ✨ AI Resume Improvement
              </h4>

              <hr />

              <div
                style={{
                  whiteSpace:
                    "pre-line",
                }}
              >
                {improveResult}
              </div>
            </div>
          )}

          <div className="card border-0 shadow p-4 mt-4">
            <h4>
              💼 Job Description Matcher
            </h4>

            <textarea
              className="form-control mb-3"
              rows="6"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(
                  e.target.value
                )
              }
            />

            <button
              className="btn btn-dark"
              onClick={handleJobMatch}
              disabled={matchLoading}
            >
              {matchLoading
                ? "Matching..."
                : "Check Match"}
            </button>
          </div>

          {matchResult && (
            <div className="card border-0 shadow p-4 mt-4 job-match-card">
              <h4>
                📊 Job Match Result
              </h4>

              <hr />

              <div className="job-match-result">
                {matchResult}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}