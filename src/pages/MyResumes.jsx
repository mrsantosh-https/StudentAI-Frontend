import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

export default function MyResumes() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const [openResumeId, setOpenResumeId] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [improvingId, setImprovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Helper functions
  |--------------------------------------------------------------------------
  */

  const getResumeId = (resume) => {
    const id = resume?.id ?? resume?.resume_id;

    if (id === null || id === undefined) {
      return null;
    }

    return String(id);
  };

  const toggleResumeActions = (resumeId) => {
    if (!resumeId) {
      toast.error("Resume ID nahi mila.");
      return;
    }

    setOpenResumeId((currentId) => (currentId === resumeId ? null : resumeId));
  };

  const closeResumeActions = () => {
    setOpenResumeId(null);
  };

  const escapeHtml = (value = "") => {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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
    const cleanName = String(name).trim();

    if (!cleanName) {
      return "R";
    }

    return cleanName
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const getSkills = (skills = "") => {
    if (!skills) {
      return [];
    }

    return String(skills)
      .split(/,|\n/)
      .map((skill) => skill.trim())
      .filter(Boolean)
      .slice(0, 4);
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch resumes
  |--------------------------------------------------------------------------
  */

  const refreshResumes = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await api.get("/resumes");

      const resumeList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.resumes)
          ? response.data.resumes
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

      setResumes(resumeList);
    } catch (error) {
      console.error("Fetch resumes error:", error.response?.data || error);

      setResumes([]);

      toast.error(
        error.response?.data?.message || "Resumes load nahi ho sake.",
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadResumes = async () => {
      try {
        setLoading(true);

        const response = await api.get("/resumes");

        const resumeList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.resumes)
            ? response.data.resumes
            : Array.isArray(response.data?.data)
              ? response.data.data
              : [];

        if (isMounted) {
          setResumes(resumeList);
        }
      } catch (error) {
        console.error("Fetch resumes error:", error.response?.data || error);

        if (isMounted) {
          setResumes([]);

          toast.error(
            error.response?.data?.message || "Resumes load nahi ho sake.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadResumes();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Navigation handlers
  |--------------------------------------------------------------------------
  */

  const handleView = (resumeId) => {
    closeResumeActions();
    navigate(`/view-resume/${resumeId}`);
  };

  const handleEdit = (resumeId) => {
    closeResumeActions();
    navigate(`/edit-resume/${resumeId}`);
  };

  const handleReview = (resumeId) => {
    closeResumeActions();
    navigate(`/resumes/${resumeId}/review`);
  };

  const handleTemplates = (resumeId) => {
    closeResumeActions();
    navigate(`/resume-templates/${resumeId}`);
  };

  const handleVersions = (resumeId) => {
    closeResumeActions();
    navigate(`/resumes/${resumeId}/versions`);
  };

  /*
  |--------------------------------------------------------------------------
  | Delete resume
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (resumeId) => {
    if (!resumeId) {
      toast.error("Resume ID nahi mila.");
      return;
    }

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
      setDeletingId(resumeId);

      const response = await api.delete(`/resumes/${resumeId}`);

      setResumes((previousResumes) =>
        previousResumes.filter((resume) => getResumeId(resume) !== resumeId),
      );

      closeResumeActions();

      toast.success(response.data?.message || "Resume deleted successfully.");
    } catch (error) {
      console.error("Delete resume error:", error);

      toast.error(
        error.response?.data?.message || "Resume delete nahi ho saka.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Analyze resume
  |--------------------------------------------------------------------------
  */

  const analyzeResume = async (resumeId) => {
    if (!resumeId) {
      toast.error("Resume ID nahi mila.");
      return;
    }

    if (analyzingId !== null) {
      return;
    }

    try {
      setAnalyzingId(resumeId);

      const response = await api.post(`/resumes/${resumeId}/analyze`);

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
        Math.max(0, Number(analysis.ats_score) || 0),
      );

      const scoreColor =
        atsScore >= 80 ? "#16a34a" : atsScore >= 60 ? "#f59e0b" : "#dc2626";

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
              <h3 style="margin:0;color:#0f172a">
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
              strengths.length
                ? `
                  <ul style="padding-left:20px">
                    ${strengths
                      .map(
                        (item) => `
                          <li style="margin-bottom:8px">
                            ${escapeHtml(item)}
                          </li>
                        `,
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
              weaknesses.length
                ? `
                  <ul style="padding-left:20px">
                    ${weaknesses
                      .map(
                        (item) => `
                          <li style="margin-bottom:8px">
                            ${escapeHtml(item)}
                          </li>
                        `,
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
              suggestions.length
                ? `
                  <ul style="padding-left:20px">
                    ${suggestions
                      .map(
                        (item) => `
                          <li style="margin-bottom:8px">
                            ${escapeHtml(item)}
                          </li>
                        `,
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

      await refreshResumes();
    } catch (error) {
      console.error("Resume analysis error:", error);

      await Swal.fire({
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

  /*
  |--------------------------------------------------------------------------
  | Improve resume
  |--------------------------------------------------------------------------
  */

  const improveResume = async (resumeId) => {
    if (!resumeId) {
      toast.error("Resume ID nahi mila.");
      return;
    }

    if (improvingId !== null) {
      return;
    }

    try {
      setImprovingId(resumeId);

      const response = await api.post(`/resumes/${resumeId}/improve`);

      const data = response.data;

      if (!data?.success) {
        throw new Error(data?.message || "Resume improvement failed.");
      }

      const improvedResume = data.improved_resume || {};

      await Swal.fire({
        title: "✨ AI Improved Resume",
        width: 900,
        confirmButtonText: "Close",
        confirmButtonColor: "#2563eb",
        showCloseButton: true,

        html: `
          <div style="text-align:left">
            <h3>Professional Summary</h3>

            <div style="
              background:#f8fafc;
              padding:15px;
              border-radius:10px;
              margin-bottom:20px;
              white-space:pre-wrap;
            ">
              ${escapeHtml(improvedResume.summary || "Summary not available.")}
            </div>

            <h3>Skills</h3>

            <div style="
              background:#f8fafc;
              padding:15px;
              border-radius:10px;
              margin-bottom:20px;
              white-space:pre-wrap;
            ">
              ${escapeHtml(improvedResume.skills || "Skills not available.")}
            </div>

            <h3>Projects</h3>

            <div style="
              background:#f8fafc;
              padding:15px;
              border-radius:10px;
              margin-bottom:20px;
              white-space:pre-wrap;
            ">
              ${escapeHtml(
                improvedResume.projects || "Projects not available.",
              )}
            </div>

            <h3>Experience</h3>

            <div style="
              background:#f8fafc;
              padding:15px;
              border-radius:10px;
              white-space:pre-wrap;
            ">
              ${escapeHtml(
                improvedResume.experience || "Experience not available.",
              )}
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("Resume improvement error:", error);

      await Swal.fire({
        icon: "error",
        title: "Improvement Failed",
        text:
          error.response?.data?.message ||
          error.message ||
          "Resume improvement failed.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setImprovingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Search and sort
  |--------------------------------------------------------------------------
  */

  const filteredResumes = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return [...resumes]
      .filter((resume) => {
        const title = String(resume?.title || "").toLowerCase();

        const fullName = String(resume?.full_name || "").toLowerCase();

        const skills = String(resume?.skills || "").toLowerCase();

        return (
          title.includes(searchValue) ||
          fullName.includes(searchValue) ||
          skills.includes(searchValue)
        );
      })
      .sort((firstResume, secondResume) => {
        const firstDate = new Date(firstResume?.created_at || 0).getTime() || 0;

        const secondDate =
          new Date(secondResume?.created_at || 0).getTime() || 0;

        if (sort === "oldest") {
          return firstDate - secondDate;
        }

        return secondDate - firstDate;
      });
  }, [resumes, search, sort]);

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

              <p className="text-muted mt-3">Loading resumes...</p>
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
              {filteredResumes.map((resume, index) => {
                const resumeId = getResumeId(resume);

                const cardKey = resumeId || `resume-card-${index}`;

                const atsScore = Math.min(
                  100,
                  Math.max(0, Number(resume?.ats_score) || 0),
                );

                const hasAtsScore =
                  resume?.ats_score !== null && resume?.ats_score !== undefined;

                const isOpen = resumeId !== null && openResumeId === resumeId;

                const isAnalyzing = analyzingId === resumeId;

                const isImproving = improvingId === resumeId;

                const isDeleting = deletingId === resumeId;

                const skills = getSkills(resume?.skills);

                return (
                  <article
                    key={cardKey}
                    className={`modern-resume-card ${isOpen ? "is-open" : ""}`}
                    style={{
                      zIndex: isOpen ? 100 : 1,
                    }}
                  >
                    <button
                      type="button"
                      className="resume-card-trigger"
                      onClick={() => toggleResumeActions(resumeId)}
                      aria-expanded={isOpen}
                      aria-controls={`resume-actions-${cardKey}`}
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

                            <h3>{resume?.title || "Untitled Resume"}</h3>

                            <p>
                              {resume?.full_name ||
                                resume?.email ||
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
                            {getInitials(resume?.full_name || resume?.title)}
                          </div>
                        )}
                      </div>

                      <div className="resume-skills-preview">
                        {skills.length > 0 ? (
                          skills.map((skill, skillIndex) => (
                            <span key={`${cardKey}-skill-${skillIndex}`}>
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="empty-skill">Skills not added</span>
                        )}
                      </div>

                      <div className="resume-card-footer">
                        <div className="resume-date">
                          <span className="resume-status-dot" />

                          {formatUpdatedDate(
                            resume?.updated_at || resume?.created_at,
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

                    {isOpen && (
                      <div
                        id={`resume-actions-${cardKey}`}
                        className="resume-actions-wrapper show"
                      >
                        <div className="resume-actions-divider" />

                        <div className="modern-resume-actions">
                          <button
                            type="button"
                            className="resume-action-item action-view"
                            onClick={() => handleView(resumeId)}
                            disabled={!resumeId || isDeleting}
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
                            onClick={() => handleEdit(resumeId)}
                            disabled={
                              !resumeId ||
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
                            onClick={() => handleReview(resumeId)}
                            disabled={
                              !resumeId ||
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
                            onClick={() => analyzeResume(resumeId)}
                            disabled={
                              !resumeId ||
                              isAnalyzing ||
                              isImproving ||
                              isDeleting ||
                              analyzingId !== null
                            }
                          >
                            <span className="action-icon">
                              {isAnalyzing ? (
                                <span className="action-spinner" />
                              ) : (
                                "🤖"
                              )}
                            </span>

                            <span className="action-copy">
                              <strong>
                                {isAnalyzing ? "Analyzing..." : "Analyze"}
                              </strong>

                              <small>Check ATS score</small>
                            </span>
                          </button>

                          <button
                            type="button"
                            className="resume-action-item action-improve"
                            onClick={() => improveResume(resumeId)}
                            disabled={
                              !resumeId ||
                              isImproving ||
                              isAnalyzing ||
                              isDeleting ||
                              improvingId !== null
                            }
                          >
                            <span className="action-icon">
                              {isImproving ? (
                                <span className="action-spinner" />
                              ) : (
                                "✨"
                              )}
                            </span>

                            <span className="action-copy">
                              <strong>
                                {isImproving ? "Improving..." : "Improve"}
                              </strong>

                              <small>Enhance with AI</small>
                            </span>
                          </button>

                          <button
                              type="button"
                              className="resume-action-item action-history"
                              onClick={() => handleVersions(resumeId)}
                              disabled={
                                !resumeId ||
                                isAnalyzing ||
                                isImproving ||
                                isDeleting
                              }
                            >
                              <span className="action-icon">
                                🕘
                              </span>

                              <span className="action-copy">
                                <strong>Version History</strong>
                                <small>View old versions</small>
                              </span>
                            </button>

                          <button
                            type="button"
                            className="resume-action-item action-delete"
                            onClick={() => handleDelete(resumeId)}
                            disabled={
                              !resumeId ||
                              isDeleting ||
                              isAnalyzing ||
                              isImproving
                            }
                          >
                            <span className="action-icon">
                              {isDeleting ? (
                                <span className="action-spinner" />
                              ) : (
                                "🗑️"
                              )}
                            </span>

                            <span className="action-copy">
                              <strong>
                                {isDeleting ? "Deleting..." : "Delete"}
                              </strong>

                              <small>Remove permanently</small>
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary mb-2"
                          onClick={() => handleTemplates(resumeId)}
                          disabled={!resumeId || isDeleting}
                        >
                          <b>Use Templates</b>
                        </button>
                      </div>
                    )}
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
