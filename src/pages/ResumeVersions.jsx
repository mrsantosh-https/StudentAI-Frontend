import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import "../styles/resumeVersions.css";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

import ModernTemplate from "../components/resumeTemplates/ModernTemplate";
import ProfessionalTemplate from "../components/resumeTemplates/ProfessionalTemplate";
import MinimalTemplate from "../components/resumeTemplates/MinimalTemplate";
import CorporateTemplate from "../components/resumeTemplates/CorporateTemplate";
import CreativeTemplate from "../components/resumeTemplates/CreativeTemplate";

export default function ResumeVersions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [previewVersion, setPreviewVersion] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Normalize API Response
  |--------------------------------------------------------------------------
  */

  const getVersionList = (response) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.versions)) {
      return response.data.versions;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    return [];
  };

  /*
  |--------------------------------------------------------------------------
  | Refresh Versions
  |--------------------------------------------------------------------------
  */

  const refreshVersions = async () => {
    try {
      const response = await api.get(
        `/resumes/${id}/versions`
      );

      setVersions(
        getVersionList(response)
      );
    } catch (error) {
      console.error(
        "Resume versions refresh error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Resume versions refresh nahi ho sake."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const loadVersions = async () => {
      if (!id) {
        if (isMounted) {
          setVersions([]);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);

        const response = await api.get(
          `/resumes/${id}/versions`
        );

        const versionList =
          getVersionList(response);

        if (isMounted) {
          setVersions(versionList);
        }
      } catch (error) {
        console.error(
          "Resume versions fetch error:",
          error.response?.data || error
        );

        if (!isMounted) {
          return;
        }

        setVersions([]);

        if (error.response?.status === 401) {
          toast.error(
            "Session expire ho gayi hai. Dobara login karo."
          );

          navigate("/login");
          return;
        }

        if (error.response?.status === 403) {
          toast.error(
            "Is resume ki version history access karne ki permission nahi hai."
          );

          navigate("/my-resumes");
          return;
        }

        if (error.response?.status === 404) {
          toast.error(
            "Resume nahi mila."
          );

          navigate("/my-resumes");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Resume versions load nahi ho sake."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadVersions();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  /*
  |--------------------------------------------------------------------------
  | Preview Version
  |--------------------------------------------------------------------------
  */

  const handlePreview = (version) => {
    setPreviewVersion(version);
  };

  const closePreview = () => {
    setPreviewVersion(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Render Preview Template
  |--------------------------------------------------------------------------
  */

  const renderPreviewTemplate = () => {
    if (!previewVersion) {
      return null;
    }

    const template =
      previewVersion.template || "modern";

    switch (template) {
      case "professional":
        return (
          <ProfessionalTemplate
            resume={previewVersion}
          />
        );

      case "minimal":
        return (
          <MinimalTemplate
            resume={previewVersion}
          />
        );

      case "corporate":
        return (
          <CorporateTemplate
            resume={previewVersion}
          />
        );

      case "creative":
        return (
          <CreativeTemplate
            resume={previewVersion}
          />
        );

      case "modern":
      default:
        return (
          <ModernTemplate
            resume={previewVersion}
          />
        );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Restore Version
  |--------------------------------------------------------------------------
  */

  const handleRestore = async (versionId) => {
    if (
      !versionId ||
      restoringId !== null ||
      deletingId !== null
    ) {
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Restore Version?",
      text: "Current resume ka snapshot save hoga aur selected version restore ho jayega.",
      showCancelButton: true,
      confirmButtonText: "Yes, Restore",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setRestoringId(versionId);

      const response = await api.post(
        `/resumes/${id}/versions/${versionId}/restore`
      );

      toast.success(
        response.data?.message ||
          "Resume version restored successfully."
      );

      setPreviewVersion(null);

      await refreshVersions();
    } catch (error) {
      console.error(
        "Restore version error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Version restore nahi ho saka."
      );
    } finally {
      setRestoringId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Version
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (versionId) => {
    if (
      !versionId ||
      deletingId !== null ||
      restoringId !== null
    ) {
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Version?",
      text: "Ye version permanently delete ho jayega.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(versionId);

      const response = await api.delete(
        `/resumes/${id}/versions/${versionId}`
      );

      toast.success(
        response.data?.message ||
          "Resume version deleted successfully."
      );

      setVersions((previousVersions) =>
        previousVersions.filter(
          (version) =>
            version.id !== versionId
        )
      );

      if (
        previewVersion?.id === versionId
      ) {
        setPreviewVersion(null);
      }
    } catch (error) {
      console.error(
        "Delete version error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Version delete nahi ho saka."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Format Date
  |--------------------------------------------------------------------------
  */

  const formatDate = (value) => {
    if (!value) {
      return "Unknown date";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown date";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Template Name
  |--------------------------------------------------------------------------
  */

  const getTemplateName = (template) => {
    const value =
      String(
        template || "modern"
      ).trim();

    if (!value) {
      return "Modern";
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  };

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
          <div className="resume-version-page">

            <div className="resume-version-header">
              <div>
                <h2>
                  🕘 Resume Version History
                </h2>

                <p>
                  View, preview, manage and restore previous
                  versions of your resume.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  navigate("/my-resumes")
                }
              >
                ← Back to My Resumes
              </button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  aria-hidden="true"
                />

                <p className="text-muted mt-3 mb-0">
                  Loading versions...
                </p>
              </div>
            ) : versions.length === 0 ? (
              <div className="resume-version-empty">
                <div
                  style={{
                    fontSize: "42px",
                    marginBottom: "12px",
                  }}
                >
                  🕘
                </div>

                <h4>
                  No Version History
                </h4>

                <p>
                  Resume edit karke save karoge to
                  previous versions yahan automatically
                  show hongi.
                </p>
              </div>
            ) : (
              <div className="resume-version-grid">
                {versions.map(
                  (version) => {
                    const isRestoring =
                      restoringId ===
                      version.id;

                    const isDeleting =
                      deletingId ===
                      version.id;

                    return (
                      <article
                        className="resume-version-card"
                        key={version.id}
                      >
                        <div className="resume-version-card-header">
                          <div className="resume-version-card-title">
                            <span className="resume-version-number">
                              Version{" "}
                              {version.version_number}
                            </span>

                            <h4>
                              {version.title ||
                                "Untitled Resume"}
                            </h4>

                            <p className="resume-version-date">
                              {formatDate(
                                version.created_at
                              )}
                            </p>
                          </div>

                          <span className="resume-version-template">
                            {getTemplateName(
                              version.template
                            )}
                          </span>
                        </div>

                        <div className="resume-version-details">
                          <div className="resume-version-detail-row">
                            <span>
                              Name
                            </span>

                            <span>
                              {version.full_name ||
                                "N/A"}
                            </span>
                          </div>

                          <div className="resume-version-detail-row">
                            <span>
                              Designation
                            </span>

                            <span>
                              {version.designation ||
                                "N/A"}
                            </span>
                          </div>

                          <div className="resume-version-detail-row">
                            <span>
                              ATS Score
                            </span>

                            <span>
                              {version.ats_score !== null &&
                              version.ats_score !==
                                undefined
                                ? `${version.ats_score}/100`
                                : "Not analyzed"}
                            </span>
                          </div>

                          <div className="resume-version-detail-row">
                            <span>
                              Template
                            </span>

                            <span>
                              {getTemplateName(
                                version.template
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="resume-version-actions">
                          <button
                            type="button"
                            className="btn resume-version-preview-btn"
                            onClick={() =>
                              handlePreview(
                                version
                              )
                            }
                            disabled={
                              isRestoring ||
                              isDeleting
                            }
                          >
                            👁 Preview
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              handleRestore(
                                version.id
                              )
                            }
                            disabled={
                              isRestoring ||
                              isDeleting ||
                              restoringId !==
                                null ||
                              deletingId !==
                                null
                            }
                          >
                            {isRestoring ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                />

                                Restoring...
                              </>
                            ) : (
                              "↩ Restore"
                            )}
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() =>
                              handleDelete(
                                version.id
                              )
                            }
                            disabled={
                              isDeleting ||
                              isRestoring ||
                              deletingId !==
                                null ||
                              restoringId !==
                                null
                            }
                          >
                            {isDeleting ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                />

                                Deleting...
                              </>
                            ) : (
                              "🗑 Delete"
                            )}
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {previewVersion && (
        <div className="resume-version-preview-overlay">
          <div className="resume-version-preview-modal">
            <div className="resume-version-preview-header">
              <div>
                <h3>
                  👁 Version {previewVersion.version_number}
                </h3>

                <p>
                  {getTemplateName(
                    previewVersion.template
                  )}{" "}
                  Template
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closePreview}
              >
                ✕ Close
              </button>
            </div>

            <div className="resume-version-preview-body">
              {renderPreviewTemplate()}
            </div>

            <div className="resume-version-preview-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closePreview}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  handleRestore(
                    previewVersion.id
                  )
                }
                disabled={
                  restoringId !== null ||
                  deletingId !== null
                }
              >
                {restoringId ===
                previewVersion.id
                  ? "Restoring..."
                  : "↩ Restore This Version"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}