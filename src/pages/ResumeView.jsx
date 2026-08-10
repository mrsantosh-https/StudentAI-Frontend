import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

import ModernTemplate from "../components/resumeTemplates/ModernTemplate";
import ProfessionalTemplate from "../components/resumeTemplates/ProfessionalTemplate";
import MinimalTemplate from "../components/resumeTemplates/MinimalTemplate";
import CorporateTemplate from "../components/resumeTemplates/CorporateTemplate";
import CreativeTemplate from "../components/resumeTemplates/CreativeTemplate";

export default function ViewResume() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch Resume
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const fetchResume = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/resumes/${id}`);

        const resumeData =
          response.data?.resume ||
          response.data?.data?.resume ||
          response.data?.data ||
          response.data;

        if (!resumeData) {
          throw new Error("Resume data not found.");
        }

        if (isMounted) {
          setResume(resumeData);
        }
      } catch (error) {
        console.error(
          "View resume fetch error:",
          error.response?.data || error
        );

        if (!isMounted) return;

        if (error.response?.status === 401) {
          toast.error(
            "Session expire ho gayi hai. Dobara login karo."
          );

          navigate("/login");
          return;
        }

        if (error.response?.status === 404) {
          toast.error("Resume nahi mila.");
          navigate("/my-resumes");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Resume load nahi ho saka."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResume();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  /*
  |--------------------------------------------------------------------------
  | Render Saved Template
  |--------------------------------------------------------------------------
  */

  const renderTemplate = () => {
    const template = resume?.template || "modern";

    switch (template) {
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
      toast.error("Resume template not found.");
      return;
    }

    try {
      setDownloading(true);

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

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
        position = heightLeft - imgHeight;

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

      const fileName =
        resume?.full_name
          ?.trim()
          ?.replace(/[^\w\s-]/g, "")
          ?.replace(/\s+/g, "_") ||
        "Resume";

      pdf.save(`${fileName}_Resume.pdf`);

      toast.success(
        "PDF downloaded successfully."
      );
    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      toast.error(
        "PDF download failed."
      );
    } finally {
      setDownloading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
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

  /*
  |--------------------------------------------------------------------------
  | Resume Not Found
  |--------------------------------------------------------------------------
  */

  if (!resume) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <Topbar />

          <div className="dashboard-content">
            <div className="card border-0 shadow p-4 text-center">
              <h4>Resume not found</h4>

              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={() =>
                  navigate("/my-resumes")
                }
              >
                Back to My Resumes
              </button>
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
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h2 className="fw-bold mb-1">
                👁 View Resume
              </h2>

              <p className="text-muted mb-0">
                Preview your saved resume and selected template.
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  navigate("/my-resumes")
                }
              >
                ← Back
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate(`/edit-resume/${resume.id}`)
                }
              >
                ✏️ Edit Resume
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={downloadResumePDF}
                disabled={downloading}
              >
                {downloading
                  ? "Downloading..."
                  : "📄 Download PDF"}
              </button>
            </div>
          </div>

          <div className="card border-0 shadow p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h4 className="mb-0">
                Resume Preview
              </h4>

              <span className="badge bg-primary">
                {(resume.template || "modern")
                  .charAt(0)
                  .toUpperCase() +
                  (resume.template || "modern").slice(1)}
              </span>
            </div>

            {renderTemplate()}
          </div>
        </div>
      </main>
    </div>
  );
}