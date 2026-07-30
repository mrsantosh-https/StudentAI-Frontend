import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import { matchJobDescription } from "../services/gemini";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function JobMatcher() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumesLoading, setResumesLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Fetch resumes
  |--------------------------------------------------------------------------
  */

  const fetchResumes = useCallback(async () => {
    try {
      setResumesLoading(true);

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
      console.error(
        "Fetch resumes failed:",
        error.response?.data || error
      );

      setResumes([]);

      toast.error(
        error.response?.data?.message ||
          "Resumes load nahi ho sake."
      );
    } finally {
      setResumesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  /*
  |--------------------------------------------------------------------------
  | Match job description
  |--------------------------------------------------------------------------
  */

  const handleMatch = async () => {
    const cleanDescription = jobDescription.trim();

    if (!selectedResume) {
      await Swal.fire({
        icon: "warning",
        title: "Select Resume",
        text: "Please select a resume first.",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    if (cleanDescription.length < 20) {
      await Swal.fire({
        icon: "warning",
        title: "Job Description Too Short",
        text: "Please enter at least 20 characters.",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    try {
      setLoading(true);
      setResult("");

      const data = await matchJobDescription(
        Number(selectedResume),
        cleanDescription
      );

      if (!data?.success || !data?.result) {
        throw new Error(
          data?.message || "No match result received."
        );
      }

      setResult(data.result);
      toast.success("Job matched successfully!");
    } catch (error) {
      console.error(
        "Job match failed:",
        error.response?.data || error
      );

      const validationErrors =
        error.response?.data?.errors;

      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to match the job description.";

      if (validationErrors) {
        errorMessage = Object.values(validationErrors)
          .flat()
          .join("\n");
      }

      await Swal.fire({
        icon: "error",
        title: "Matching Failed",
        text: errorMessage,
        confirmButtonColor: "#2563eb",
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

        <div className="dashboard-content">
          <h2 className="fw-bold">🎯 AI Job Matcher</h2>

          <p className="text-muted">
            Compare your resume with a job description.
          </p>

          <div className="card border-0 shadow p-4 mt-4 matcher-card">
            <h4>Select Resume</h4>

            <select
              className="form-select mt-3"
              value={selectedResume}
              onChange={(event) =>
                setSelectedResume(event.target.value)
              }
              disabled={resumesLoading || resumes.length === 0}
            >
              <option value="">
                {resumesLoading
                  ? "Loading resumes..."
                  : resumes.length === 0
                  ? "No resumes available"
                  : "Choose Resume"}
              </option>

              {resumes.map((resume, index) => {
                const resumeId =
                  resume?.id ?? resume?.resume_id;

                if (
                  resumeId === null ||
                  resumeId === undefined
                ) {
                  return null;
                }

                return (
                  <option
                    key={`resume-${resumeId}-${index}`}
                    value={resumeId}
                  >
                    {resume?.title ||
                      resume?.full_name ||
                      `Resume ${index + 1}`}
                  </option>
                );
              })}
            </select>

            {!resumesLoading && resumes.length === 0 && (
              <p className="text-danger mt-2 mb-0">
                Pehle ek resume create karo.
              </p>
            )}
          </div>

          <div className="card border-0 shadow p-4 mt-4">
            <h4>Paste Job Description</h4>

            <textarea
              className="form-control mt-3"
              rows="8"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              disabled={loading}
            />

            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={handleMatch}
              disabled={
                loading ||
                resumesLoading ||
                resumes.length === 0
              }
            >
              {loading ? "Matching..." : "🎯 Check Match"}
            </button>
          </div>

          {result && (
            <div className="card border-0 shadow p-4 mt-4">
              <h4>📊 Match Result</h4>

              <hr />

              <div
                className="matcher-result"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {result}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}