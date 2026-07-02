import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ModernTemplate from "../templates/ModernTemplate";
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

  useEffect(() => {
    const fetchResume = async () => {
      const response = await api.get(`/resumes/${id}`);
      setResume(response.data);
    };

    fetchResume();
  }, [id]);

  const downloadResumePDF = async () => {
    const input = document.getElementById("resume-template");

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${resume.full_name}_Resume.pdf`);

    toast.success("PDF downloaded successfully");
  };

  const extractATSScore = (text) => {
    const match = text.match(/ATS Score:\s*(\d+)/i);
    return match ? Number(match[1]) : null;
  };

  const handleATSCheck = async () => {
    setAtsLoading(true);

    try {
      const result = await checkATSScore(resume);
      setAtsResult(result);

      const score = extractATSScore(result);

      if (score !== null) {
        await api.put(`/resumes/${id}/ats-score`, {
          ats_score: score,
        });
      }

      toast.success("ATS score checked and saved");
    } catch (error) {
      console.error(error);
      toast.error("ATS check failed");
    } finally {
      setAtsLoading(false);
    }
  };

  const handleImproveResume = async () => {
    setImproveLoading(true);

    try {
      const result = await improveResume(resume);
      setImproveResult(result);
      toast.success("Resume improved");
    } catch (error) {
      console.error(error);
      toast.error("Improve failed");
    } finally {
      setImproveLoading(false);
    }
  };

  const handleJobMatch = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste job description");
      return;
    }

    setMatchLoading(true);

    try {
      const result = await matchJobDescription(resume, jobDescription);
      setMatchResult(result);
      toast.success("Job match completed");
    } catch (error) {
      console.error(error);
      toast.error("Job match failed");
    } finally {
      setMatchLoading(false);
    }
  };

  if (!resume) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <button className="btn btn-danger mb-3" onClick={downloadResumePDF}>
            📄 Download Modern PDF
          </button>

          <button
            className="btn btn-primary mb-3 ms-2"
            onClick={handleATSCheck}
            disabled={atsLoading}
          >
            {atsLoading ? "Checking..." : "🤖 Check ATS Score"}
          </button>

          <button
            className="btn btn-success mb-3 ms-2"
            onClick={handleImproveResume}
            disabled={improveLoading}
          >
            {improveLoading ? "Improving..." : "✨ Improve Resume"}
          </button>

          <div className="card border-0 shadow p-4">
            <h4 className="mb-3">Resume Preview</h4>
            <ModernTemplate resume={resume} />
          </div>

          {atsResult && (
            <div className="card border-0 shadow p-4 mt-4 ats-card">
              <h4>🤖 ATS Analysis Result</h4>
              <hr />
              <div className="ats-result">{atsResult}</div>
            </div>
          )}

          {improveResult && (
            <div className="card border-0 shadow p-4 mt-4">
              <h4>✨ AI Resume Improvement</h4>
              <hr />
              <div style={{ whiteSpace: "pre-line" }}>{improveResult}</div>
            </div>
          )}

          <div className="card border-0 shadow p-4 mt-4">
            <h4>💼 Job Description Matcher</h4>

            <textarea
              className="form-control mb-3"
              rows="6"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <button
              className="btn btn-dark"
              onClick={handleJobMatch}
              disabled={matchLoading}
            >
              {matchLoading ? "Matching..." : "Check Match"}
            </button>
          </div>

          {matchResult && (
            <div className="card border-0 shadow p-4 mt-4 job-match-card">
              <h4>📊 Job Match Result</h4>
              <hr />
              <div className="job-match-result">{matchResult}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}