import { useEffect, useState } from "react";
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
  | Fetch Resumes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const fetchResumes = async () => {
      try {
        const response = await api.get("/resumes");

        console.log(
          "Resumes API Response:",
          response.data
        );

        let resumeList = [];

        if (Array.isArray(response.data)) {
          resumeList = response.data;
        } else if (
          Array.isArray(response.data?.resumes)
        ) {
          resumeList = response.data.resumes;
        } else if (
          Array.isArray(response.data?.data)
        ) {
          resumeList = response.data.data;
        } else if (
          Array.isArray(
            response.data?.data?.resumes
          )
        ) {
          resumeList =
            response.data.data.resumes;
        }

        const validResumes =
          resumeList.filter((resume) => {
            const resumeId =
              resume?.id ??
              resume?.resume_id;

            const numericId =
              Number(resumeId);

            return (
              Number.isInteger(
                numericId
              ) &&
              numericId > 0
            );
          });

        if (!isMounted) {
          return;
        }

        setResumes(validResumes);
      } catch (error) {
        console.error(
          "Fetch resumes failed:",
          error.response?.data ||
            error
        );

        if (!isMounted) {
          return;
        }

        setResumes([]);
        setSelectedResume("");

        toast.error(
          error.response?.data
            ?.message ||
            "Resumes load nahi ho sake."
        );
      } finally {
        if (isMounted) {
          setResumesLoading(false);
        }
      }
    };

    fetchResumes();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Resume Change
  |--------------------------------------------------------------------------
  */

  const handleResumeChange = (
    event
  ) => {
    const value =
      event.target.value;

    if (!value) {
      setSelectedResume("");
      return;
    }

    const resumeId =
      Number(value);

    if (
      !Number.isInteger(
        resumeId
      ) ||
      resumeId <= 0
    ) {
      setSelectedResume("");
      return;
    }

    setSelectedResume(
      String(resumeId)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Match Job Description
  |--------------------------------------------------------------------------
  */

  const handleMatch = async () => {
    const resumeId =
      Number(selectedResume);

    const cleanDescription =
      String(
        jobDescription ?? ""
      ).trim();

    /*
    |--------------------------------------------------------------------------
    | Resume Validation
    |--------------------------------------------------------------------------
    */

    if (
      !selectedResume ||
      !Number.isInteger(
        resumeId
      ) ||
      resumeId <= 0
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Select Resume",
        text:
          "Please select a valid resume first.",
        confirmButtonColor:
          "#2563eb",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Check Selected Resume Exists
    |--------------------------------------------------------------------------
    */

    const resumeExists =
      resumes.some(
        (resume) => {
          const currentId =
            resume?.id ??
            resume?.resume_id;

          return (
            Number(currentId) ===
            resumeId
          );
        }
      );

    if (!resumeExists) {
      await Swal.fire({
        icon: "error",
        title: "Invalid Resume",
        text:
          "Selected resume is no longer available. Please select another resume.",
        confirmButtonColor:
          "#2563eb",
      });

      setSelectedResume("");

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Job Description Validation
    |--------------------------------------------------------------------------
    */

    if (
      cleanDescription.length <
      20
    ) {
      await Swal.fire({
        icon: "warning",
        title:
          "Job Description Too Short",
        text:
          "Please enter at least 20 characters.",
        confirmButtonColor:
          "#2563eb",
      });

      return;
    }

    try {
      setLoading(true);
      setResult("");

      console.log(
        "Selected Resume ID:",
        resumeId
      );

      console.log(
        "Job Matcher Request:",
        {
          resume_id:
            resumeId,

          job_description:
            cleanDescription,
        }
      );

      /*
      |--------------------------------------------------------------------------
      | API Request
      |--------------------------------------------------------------------------
      */

      const data =
        await matchJobDescription(
          resumeId,
          cleanDescription
        );

      console.log(
        "Job Matcher Response:",
        data
      );

      /*
      |--------------------------------------------------------------------------
      | Validate Response
      |--------------------------------------------------------------------------
      */

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Job matching failed."
        );
      }

      if (
        typeof data?.result !==
          "string" ||
        !data.result.trim()
      ) {
        throw new Error(
          data?.message ||
            "No match result received."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Success
      |--------------------------------------------------------------------------
      */

      setResult(
        data.result.trim()
      );

      toast.success(
        "Job matched successfully!"
      );
    } catch (error) {
      console.error(
        "Job match failed:",
        error.response?.data ||
          error
      );

      const validationErrors =
        error.response?.data
          ?.errors;

      let errorMessage =
        error.response?.data
          ?.message ||
        error.message ||
        "Failed to match the job description.";

      if (validationErrors) {
        errorMessage =
          Object.values(
            validationErrors
          )
            .flat()
            .join("\n");
      }

      await Swal.fire({
        icon: "error",
        title:
          "Matching Failed",
        text: errorMessage,
        confirmButtonColor:
          "#2563eb",
      });
    } finally {
      setLoading(false);
    }
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
          <h2 className="fw-bold">
            🎯 AI Job Matcher
          </h2>

          <p className="text-muted">
            Compare your resume with a
            job description.
          </p>

          {/* Resume Selection */}

          <div className="card border-0 shadow p-4 mt-4 matcher-card">
            <h4>
              Select Resume
            </h4>

            <select
              className="form-select mt-3"
              value={
                selectedResume
              }
              onChange={
                handleResumeChange
              }
              disabled={
                loading ||
                resumesLoading ||
                resumes.length ===
                  0
              }
            >
              <option value="">
                {resumesLoading
                  ? "Loading resumes..."
                  : resumes.length ===
                    0
                  ? "No resumes available"
                  : "Choose Resume"}
              </option>

              {resumes.map(
                (
                  resume,
                  index
                ) => {
                  const resumeId =
                    resume?.id ??
                    resume?.resume_id;

                  return (
                    <option
                      key={`resume-${resumeId}`}
                      value={String(
                        resumeId
                      )}
                    >
                      {resume?.title ||
                        resume?.full_name ||
                        `Resume ${
                          index +
                          1
                        }`}
                    </option>
                  );
                }
              )}
            </select>

            {!resumesLoading &&
              resumes.length ===
                0 && (
                <p className="text-danger mt-2 mb-0">
                  Pehle ek resume
                  create karo.
                </p>
              )}
          </div>

          {/* Job Description */}

          <div className="card border-0 shadow p-4 mt-4">
            <h4>
              Paste Job Description
            </h4>

            <textarea
              className="form-control mt-3"
              rows="8"
              placeholder="Paste job description here..."
              value={
                jobDescription
              }
              onChange={(
                event
              ) =>
                setJobDescription(
                  event.target
                    .value
                )
              }
              disabled={
                loading
              }
            />

            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={
                handleMatch
              }
              disabled={
                loading ||
                resumesLoading ||
                resumes.length ===
                  0 ||
                !selectedResume
              }
            >
              {loading
                ? "Matching..."
                : "🎯 Check Match"}
            </button>
          </div>

          {/* Result */}

          {result && (
            <div className="card border-0 shadow p-4 mt-4">
              <h4>
                📊 Match Result
              </h4>

              <hr />

              <div
                className="matcher-result"
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
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