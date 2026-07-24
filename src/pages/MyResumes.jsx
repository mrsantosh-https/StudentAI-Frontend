import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

export default function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const navigate = useNavigate();

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
            <div className="row">
              {filteredResumes.map((resume) => {
                const atsScore = Number(resume.ats_score);

                const hasAtsScore =
                  resume.ats_score !== null &&
                  resume.ats_score !== undefined;

                const isAnalyzing = analyzingId === resume.id;
                const isDeleting = deletingId === resume.id;

                return (
                  <div
                    className="col-lg-4 col-md-6 mb-4"
                    key={resume.id}
                  >
                    <div className="card border-0 shadow-sm p-4 h-100">
                      <h5 className="fw-bold mb-2">
                        {resume.title || "Untitled Resume"}
                      </h5>

                      {hasAtsScore && (
                        <div className="mb-3">
                          <span
                            className={`badge ${
                              atsScore >= 80
                                ? "bg-success"
                                : atsScore >= 60
                                ? "bg-warning text-dark"
                                : "bg-danger"
                            }`}
                          >
                            ATS Score: {atsScore}/100
                          </span>
                        </div>
                      )}

                      <p className="text-muted mb-2">
                        {resume.email || "Email not added"}
                      </p>

                      <p
                        className="text-secondary flex-grow-1"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {resume.skills || "Skills not added"}
                      </p>

                      <div className="d-grid gap-2 mt-auto">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            navigate(`/view-resume/${resume.id}`)
                          }
                        >
                          👁 View
                        </button>

                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() =>
                            navigate(`/edit-resume/${resume.id}`)
                          }
                          disabled={isAnalyzing || isDeleting}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(resume.id)}
                          disabled={isDeleting || isAnalyzing}
                        >
                          {isDeleting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                aria-hidden="true"
                              />
                              Deleting...
                            </>
                          ) : (
                            "🗑 Delete"
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => analyzeResume(resume.id)}
                          disabled={
                            isAnalyzing ||
                            isDeleting ||
                            analyzingId !== null
                          }
                        >
                          {isAnalyzing ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                aria-hidden="true"
                              />
                              Analyzing...
                            </>
                          ) : (
                            "🤖 Analyze Resume"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}