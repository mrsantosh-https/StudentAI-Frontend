import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

export default function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [improvingId, setImprovingId] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
const [openResumeId, setOpenResumeId] = useState(null);
  const navigate = useNavigate();

  const toggleResumeActions = (resumeId) => {
  setOpenResumeId((currentId) =>
    currentId === resumeId ? null : resumeId
  );
};

const formatUpdatedDate = (dateValue) => {
  if (!dateValue) {
    return "Recently updated";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  return `Updated ${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
};

const getInitials = (name = "") => {
  const cleanName = name.trim();

  if (!cleanName) {
    return "R";
  }

  return cleanName
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};
  const escapeHtml = (value = "") => {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/resumes");

      const resumeList = Array.isArray(response.data)
        ? response.data
        : response.data?.resumes || [];

      setResumes(resumeList);
    } catch (error) {
      console.error("Fetch resumes error:", error);

      toast.error(
        error.response?.data?.message || "Resumes load nahi ho sake."
      );

      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Resume?",
      text: "Ye resume permanently delete ho jayega.",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await api.delete(`/resumes/${id}`);

      setResumes((previousResumes) =>
        previousResumes.filter((resume) => resume.id !== id)
      );

      toast.success(
        response.data?.message || "Resume deleted successfully."
      );
    } catch (error) {
      console.error("Delete resume error:", error);

      toast.error(
        error.response?.data?.message || "Resume delete nahi ho saka."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const analyzeResume = async (id) => {
    if (analyzingId !== null) {
      return;
    }

    try {
      setAnalyzingId(id);

      const response = await api.post(`/resumes/${id}/analyze`);

      const data = response.data;

      if (!data?.success) {
        throw new Error(data?.message || "Resume analysis failed.");
      }

      const analysis = data.analysis || {};

      const strengths = Array.isArray(analysis.strengths)
        ? analysis.strengths
        : [];

      const weaknesses = Array.isArray(analysis.weaknesses)
        ? analysis.weaknesses
        : [];

      const suggestions = Array.isArray(analysis.suggestions)
        ? analysis.suggestions
        : [];

      const atsScore = Math.min(
        100,
        Math.max(0, Number(analysis.ats_score) || 0)
      );

      const scoreColor =
        atsScore >= 80
          ? "#16a34a"
          : atsScore >= 60
          ? "#f59e0b"
          : "#dc2626";

      await Swal.fire({
        title: "🤖 AI Resume Analysis",
        width: 750,
        confirmButtonText: "Close",
        confirmButtonColor: "#2563eb",
        showCloseButton: true,

        html: `
          <div style="text-align:left">

            <div style="
              text-align:center;
              background:#f1f5f9;
              padding:18px;
              border-radius:12px;
              margin-bottom:20px;
            ">
              <h3 style="
                margin:0;
                color:#0f172a;
              ">
                ATS Score
              </h3>

              <h1 style="
                margin:8px 0 0;
                color:${scoreColor};
              ">
                ${atsScore}/100
              </h1>

              <div style="
                width:100%;
                height:10px;
                background:#e2e8f0;
                border-radius:20px;
                overflow:hidden;
                margin-top:12px;
              ">
                <div style="
                  width:${atsScore}%;
                  height:100%;
                  background:${scoreColor};
                  border-radius:20px;
                "></div>
              </div>
            </div>

            <h4 style="color:#16a34a">
              ✅ Strengths
            </h4>

            ${
              strengths.length > 0
                ? `
                  <ul style="padding-left:20px">
                    ${strengths
                      .map(
                        (item) => `
                          <li style="margin-bottom:8px">
                            ${escapeHtml(item)}
                          </li>
                        `
                      )
                      .join("")}
                  </ul>
                `
                : `
                  <p style="color:#64748b">
                    No strengths received.
                  </p>
                `
            }

            <hr />

            <h4 style="color:#dc2626">
              ❌ Weaknesses
            </h4>

            ${
              weaknesses.length > 0
                ? `
                  <ul style="padding-left:20px">
                    ${weaknesses
                      .map(
                        (item) => `
                          <li style="margin-bottom:8px">
                            ${escapeHtml(item)}
                          </li>
                        `
                      )
                      .join("")}
                  </ul>
                `
                : `
                  <p style="color:#64748b">
                    No weaknesses received.
                  </p>
                `
            }

            <hr />

            <h4 style="color:#2563eb">
              💡 Suggestions
            </h4>

            ${
              suggestions.length > 0
                ? `
                  <ul style="padding-left:20px">
                    ${suggestions
                      .map(
                        (item) => `
                          <li style="margin-bottom:8px">
                            ${escapeHtml(item)}
                          </li>
                        `
                      )
                      .join("")}
                  </ul>
                `
                : `
                  <p style="color:#64748b">
                    No suggestions received.
                  </p>
                `
            }

          </div>
        `,
      });

      await fetchResumes();
    } catch (error) {
      console.error("Resume analysis error:", error);

      Swal.fire({
        icon: "error",
        title: "Analysis Failed",
        text:
          error.response?.data?.message ||
          error.message ||
          "Resume analysis failed. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setAnalyzingId(null);
    }
  };
  const improveResume = async (id) => {
  try {
    setImprovingId(id);

    const response = await api.post(`/resumes/${id}/improve`);

    const data = response.data;

    if (!data.success) {
      throw new Error(data.message);
    }

    const resume = data.improved_resume;

    await Swal.fire({
      title: "✨ AI Improved Resume",
      width: 900,
      confirmButtonText: "Close",
      html: `
        <div style="text-align:left">

          <h3>Professional Summary</h3>
          <div style="
              background:#f8fafc;
              padding:15px;
              border-radius:10px;
              margin-bottom:20px;
          ">
              ${escapeHtml(resume.summary)}
          </div>

          <h3>Skills</h3>

          <div style="
              background:#f8fafc;
              padding:15px;
              border-radius:10px;
              margin-bottom:20px;
              white-space:pre-wrap;
          ">
              ${escapeHtml(resume.skills)}
          </div>

          <h3>Projects</h3>

          <div style="
              background:#f8fafc;
              padding:15px;
              border-radius:10px;
              margin-bottom:20px;
              white-space:pre-wrap;
          ">
              ${escapeHtml(resume.projects)}
          </div>

          <h3>Experience</h3>

          <div style="
              background:#f8fafc;
              padding:15px;
              border-radius:10px;
              white-space:pre-wrap;
          ">
              ${escapeHtml(resume.experience)}
          </div>

        </div>
      `,
    });

  } catch (err) {

    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Failed",
      text:
        err.response?.data?.message ||
        err.message ||
        "Resume improvement failed.",
    });

  } finally {

    setImprovingId(null);

  }
};
  const filteredResumes = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return [...resumes]
      .filter((resume) => {
        const title = resume.title || "";
        const fullName = resume.full_name || "";
        const skills = resume.skills || "";

        return (
          title.toLowerCase().includes(searchValue) ||
          fullName.toLowerCase().includes(searchValue) ||
          skills.toLowerCase().includes(searchValue)
        );
      })
      .sort((a, b) => {
        const firstDate = new Date(a.created_at).getTime();
        const secondDate = new Date(b.created_at).getTime();

        if (sort === "oldest") {
          return firstDate - secondDate;
        }

        return secondDate - firstDate;
      });
  }, [resumes, search, sort]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1">📋 My Resumes</h2>

              <p className="text-muted mb-0">
                View, edit and analyze your saved resumes.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/resume-builder")}
            >
              + Create Resume
            </button>
          </div>

          <div className="row mt-4 mb-4 g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, name or skills..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
                aria-hidden="true"
              />

              <p className="text-muted mt-3">
                Loading resumes...
              </p>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="card border-0 shadow-sm text-center p-5">
              <h4>No resumes found</h4>

              <p className="text-muted">
                Create your first resume or change the search keyword.
              </p>

              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate("/resume-builder")}
                >
                  Create Resume
                </button>
              </div>
            </div>
          ) : (
            <div className="modern-resume-grid">
  {filteredResumes.map((resume) => {
    const atsScore = Math.min(
      100,
      Math.max(0, Number(resume.ats_score) || 0)
    );

    const hasAtsScore =
      resume.ats_score !== null &&
      resume.ats_score !== undefined;

    const isAnalyzing = analyzingId === resume.id;
    const isImproving = improvingId === resume.id;
    const isDeleting = deletingId === resume.id;
    const isOpen = openResumeId === resume.id;

    return (
      <article
        key={resume.id}
        className={`modern-resume-card ${isOpen ? "is-open" : ""}`}
      >
        <button
          type="button"
          className="resume-card-trigger"
          onClick={() => toggleResumeActions(resume.id)}
          aria-expanded={isOpen}
          aria-controls={`resume-actions-${resume.id}`}
        >
          <div className="resume-card-top">
            <div className="resume-file-identity">
              <div className="resume-file-icon">
                <span>📄</span>
              </div>

              <div className="resume-title-content">

                <span className="resume-card-label">
                  Saved resume
                </span>
                <h3>
                  {resume.title || "Untitled Resume"}
                </h3>

                <p>
                  {resume.full_name ||
                    resume.email ||
                    "Candidate details not added"}
                </p>
              </div>
            </div>

            {hasAtsScore ? (
              <div
                className={`resume-ats-circle ${
                  atsScore >= 80
                    ? "ats-high"
                    : atsScore >= 60
                    ? "ats-medium"
                    : "ats-low"
                }`}
                style={{
                  "--ats-progress": `${atsScore * 3.6}deg`,
                }}
              >
                <div className="resume-ats-inner">
                  <strong>{atsScore}</strong>
                  <span>ATS</span>
                </div>
              </div>
            ) : (
              <div className="resume-avatar">
                {getInitials(
                  resume.full_name || resume.title
                )}
              </div>
            )}
          </div>

          <div className="resume-skills-preview">
            {resume.skills
              ? resume.skills
                  .split(",")
                  .slice(0, 4)
                  .map((skill, index) => (
                    <span key={`${resume.id}-skill-${index}`}>
                      {skill.trim()}
                    </span>
                  ))
              : (
                <span className="empty-skill">
                  Skills not added
                </span>
              )}
          </div>

          <div className="resume-card-footer">
            <div className="resume-date">
              <span className="resume-status-dot"></span>

              {formatUpdatedDate(
                resume.updated_at || resume.created_at
              )}
            </div>

            <div className="resume-manage-text">
              <span>
                {isOpen ? "Close actions" : "Manage resume"}
              </span>

              <span
                className={`resume-chevron ${
                  isOpen ? "rotate" : ""
                }`}
              >
                ⌄
              </span>
            </div>
          </div>
        </button>

        <div
          id={`resume-actions-${resume.id}`}
          className={`resume-actions-wrapper ${
            isOpen ? "show" : ""
          }`}
        >
          <div className="resume-actions-divider"></div>

          <div className="modern-resume-actions">
            <button
              type="button"
              className="resume-action-item action-view"
              onClick={() =>
                navigate(`/view-resume/${resume.id}`)
              }
              disabled={isDeleting}
            >
              <span className="action-icon">👁</span>

              <span className="action-copy">
                <strong>View</strong>
                <small>Open resume</small>
              </span>
            </button>

            <button
              type="button"
              className="resume-action-item action-edit"
              onClick={() =>
                navigate(`/edit-resume/${resume.id}`)
              }
              disabled={
                isAnalyzing ||
                isImproving ||
                isDeleting
              }
            >
              <span className="action-icon">✏️</span>

              <span className="action-copy">
                <strong>Edit</strong>
                <small>Update details</small>
              </span>
            </button>

            <button
              type="button"
              className="resume-action-item action-review"
              onClick={() =>
                navigate(`/resumes/${resume.id}/review`)
              }
              disabled={
                isAnalyzing ||
                isImproving ||
                isDeleting
              }
            >
              <span className="action-icon">⭐</span>

              <span className="action-copy">
                <strong>AI Review</strong>
                <small>Detailed feedback</small>
              </span>
            </button>

            <button
              type="button"
              className="resume-action-item action-analyze"
              onClick={() => analyzeResume(resume.id)}
              disabled={
                isAnalyzing ||
                isImproving ||
                isDeleting ||
                analyzingId !== null
              }
            >
              <span className="action-icon">
                {isAnalyzing ? (
                  <span className="action-spinner"></span>
                ) : (
                  "🤖"
                )}
              </span>

              <span className="action-copy">
                <strong>
                  {isAnalyzing
                    ? "Analyzing..."
                    : "Analyze"}
                </strong>

                <small>Check ATS score</small>
              </span>
            </button>

            <button
              type="button"
              className="resume-action-item action-improve"
              onClick={() => improveResume(resume.id)}
              disabled={
                isImproving ||
                isAnalyzing ||
                isDeleting
              }
            >
              <span className="action-icon">
                {isImproving ? (
                  <span className="action-spinner"></span>
                ) : (
                  "✨"
                )}
              </span>

              <span className="action-copy">
                <strong>
                  {isImproving
                    ? "Improving..."
                    : "Improve"}
                </strong>

                <small>Enhance with AI</small>
              </span>
            </button>

            <button
              type="button"
              className="resume-action-item action-delete"
              onClick={() => handleDelete(resume.id)}
              disabled={
                isDeleting ||
                isAnalyzing ||
                isImproving
              }
            >
              <span className="action-icon">
                {isDeleting ? (
                  <span className="action-spinner"></span>
                ) : (
                  "🗑️"
                )}
              </span>

              <span className="action-copy">
                <strong>
                  {isDeleting
                    ? "Deleting..."
                    : "Delete"}
                </strong>

                <small>Remove permanently</small>
              </span>
            </button>
          </div>
        </div>
      </article>
    );
  })}
</div>
          )}
        </div>
      </main>
    </div>
  );
}