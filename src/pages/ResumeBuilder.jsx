import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ResumeForm from "../components/ResumeForm";
import ResumePreview from "../components/ResumePreview";

import "../styles/dashboardLayout.css";
import "../styles/resume.css";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
  fullName: "",
  designation: "",
  email: "",
  phone: "",

  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",

  linkedin: "",
  github: "",
  portfolio: "",

  careerObjective: "",
  summary: "",
  education: "",
  skills: "",
  projects: "",
  experience: "",
};

/* =========================================================
   RESUME TEMPLATES
========================================================= */

const resumeTemplates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean modern resume design",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Professional ATS-friendly design",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and clean resume design",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stylish creative resume design",
  },
];

/* =========================================================
   RESUME BUILDER
========================================================= */

export default function ResumeBuilder() {
  const [formData, setFormData] = useState(initialFormData);

  const [selectedTemplate, setSelectedTemplate] =
    useState("modern");

  const [generatingSummary, setGeneratingSummary] =
    useState(false);

  const [savingResume, setSavingResume] =
    useState(false);

  const [loadingResume, setLoadingResume] =
    useState(false);

  const { id } = useParams();

  const navigate = useNavigate();

  /* =========================================================
     SAFE VALUE
  ========================================================= */

  const getValue = (value) => {
    return typeof value === "string" ? value : "";
  };

  /* =========================================================
     HANDLE FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  /* =========================================================
     TEMPLATE CHANGE
  ========================================================= */

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
  };

  /* =========================================================
     AI SUMMARY
  ========================================================= */

  const handleGenerateAI = async () => {
    if (generatingSummary) return;

    const fullName = getValue(
      formData.fullName
    ).trim();

    const skills = getValue(
      formData.skills
    ).trim();

    if (!fullName) {
      toast.error("Pehle full name enter karo.");
      return;
    }

    if (!skills) {
      toast.error("Pehle skills enter karo.");
      return;
    }

    try {
      setGeneratingSummary(true);

      const response = await api.post(
        "/ai/resume-summary",
        {
          fullName,

          designation: getValue(
            formData.designation
          ).trim(),

          education: getValue(
            formData.education
          ).trim(),

          skills,

          projects: getValue(
            formData.projects
          ).trim(),

          experience: getValue(
            formData.experience
          ).trim(),

          careerObjective: getValue(
            formData.careerObjective
          ).trim(),
        }
      );

      const generatedSummary =
        response.data?.summary ||
        response.data?.data?.summary ||
        response.data?.result?.summary ||
        "";

      if (!generatedSummary) {
        throw new Error(
          response.data?.message ||
            "AI summary receive nahi hui."
        );
      }

      setFormData((previousData) => ({
        ...previousData,
        summary: generatedSummary,
      }));

      toast.success(
        "AI summary generated successfully."
      );
    } catch (error) {
      console.error(
        "AI summary error:",
        error
      );

      console.error(
        "AI summary backend response:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "AI summary generate nahi ho saka."
      );
    } finally {
      setGeneratingSummary(false);
    }
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const fullName = getValue(
      formData.fullName
    ).trim();

    const email = getValue(
      formData.email
    ).trim();

    if (!fullName) {
      toast.error(
        "Full name required hai."
      );

      return false;
    }

    if (!email) {
      toast.error(
        "Email required hai."
      );

      return false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      toast.error(
        "Valid email address enter karo."
      );

      return false;
    }

    if (!selectedTemplate) {
      toast.error(
        "Resume template select karo."
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     CREATE RESUME PAYLOAD
  ========================================================= */

  const createResumePayload = () => {
    const fullName = getValue(
      formData.fullName
    ).trim();

    return {
      title: `${
        fullName || "Untitled"
      } Resume`,

      template: selectedTemplate,

      fullName,

      designation: getValue(
        formData.designation
      ).trim(),

      email: getValue(
        formData.email
      ).trim(),

      phone: getValue(
        formData.phone
      ).trim(),

      address: getValue(
        formData.address
      ).trim(),

      city: getValue(
        formData.city
      ).trim(),

      state: getValue(
        formData.state
      ).trim(),

      country: getValue(
        formData.country
      ).trim(),

      pincode: getValue(
        formData.pincode
      ).trim(),

      linkedin: getValue(
        formData.linkedin
      ).trim(),

      github: getValue(
        formData.github
      ).trim(),

      portfolio: getValue(
        formData.portfolio
      ).trim(),

      careerObjective: getValue(
        formData.careerObjective
      ).trim(),

      summary: getValue(
        formData.summary
      ).trim(),

      education: getValue(
        formData.education
      ).trim(),

      skills: getValue(
        formData.skills
      ).trim(),

      projects: getValue(
        formData.projects
      ).trim(),

      experience: getValue(
        formData.experience
      ).trim(),
    };
  };

  /* =========================================================
     SAVE / UPDATE RESUME
  ========================================================= */

  const handleSaveResume = async () => {
    if (savingResume) return;

    if (!validateForm()) return;

    try {
      setSavingResume(true);

      const payload =
        createResumePayload();

      console.log(
        "Resume payload:",
        payload
      );

      const response = id
        ? await api.put(
            `/resumes/${id}`,
            payload
          )
        : await api.post(
            "/resumes",
            payload
          );

      console.log(
        "Resume save response:",
        response.data
      );

      toast.success(
        response.data?.message ||
          (id
            ? "Resume updated successfully."
            : "Resume saved successfully.")
      );

      navigate("/my-resumes");
    } catch (error) {
      console.error(
        "Resume save error:",
        error
      );

      console.error(
        "Resume backend response:",
        error.response?.data
      );

      console.error(
        "Resume status code:",
        error.response?.status
      );

      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors) {
        const firstErrorGroup =
          Object.values(
            validationErrors
          )[0];

        const firstError =
          Array.isArray(
            firstErrorGroup
          )
            ? firstErrorGroup[0]
            : firstErrorGroup;

        toast.error(
          firstError ||
            "Resume validation failed."
        );

        return;
      }

      if (
        error.response?.status === 401
      ) {
        toast.error(
          "Session expire ho gayi hai. Dobara login karo."
        );

        navigate("/login");

        return;
      }

      if (error.response?.status === 403) {
        toast.error(
          error.response?.data?.message ||
            "Aapko is resume ko update karne ki permission nahi hai."
        );
        return;
      }

      if (
        error.response?.status === 404
      ) {
        toast.error(
          "Resume route ya resume record nahi mila."
        );

        return;
      }

      if (
        error.response?.status === 500
      ) {
        toast.error(
          error.response?.data?.message ||
            "Laravel backend me internal server error hai."
        );

        return;
      }

      if (
        error.code === "ERR_NETWORK"
      ) {
        toast.error(
          "Laravel backend connect nahi ho raha. Backend server aur controller check karo."
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Resume save/update failed."
      );
    } finally {
      setSavingResume(false);
    }
  };

  /* =========================================================
     FETCH RESUME
  ========================================================= */

   /* =========================================================
   FETCH RESUME FOR EDIT
========================================================= */

useEffect(() => {
  let isMounted = true;

  const fetchResume = async () => {
    /*
     * New Resume
     */
    if (!id) {
      if (isMounted) {
        setFormData(initialFormData);
        setSelectedTemplate("modern");
      }

      return;
    }

    try {
      setLoadingResume(true);

      /*
       * Database se saved resume fetch
       */
      const response = await api.get(`/resumes/${id}`);

      console.log("EDIT RESUME ID:", id);
      console.log("EDIT RESUME RESPONSE:", response.data);

      const resume =
        response.data?.resume ||
        response.data?.data?.resume ||
        response.data?.data ||
        response.data;

      console.log("FINAL RESUME DATA:", resume);

      if (!resume) {
        throw new Error("Resume data receive nahi hua.");
      }

      if (!isMounted) return;

      /*
       * Database fields -> ResumeForm fields
       */
      setFormData({
        fullName:
          resume.full_name ??
          resume.fullName ??
          "",

        designation:
          resume.designation ?? "",

        email:
          resume.email ?? "",

        phone:
          resume.phone ?? "",

        address:
          resume.address ?? "",

        city:
          resume.city ?? "",

        state:
          resume.state ?? "",

        country:
          resume.country ?? "",

        pincode:
          resume.pincode ?? "",

        linkedin:
          resume.linkedin ?? "",

        github:
          resume.github ?? "",

        portfolio:
          resume.portfolio ?? "",

        careerObjective:
          resume.career_objective ??
          resume.careerObjective ??
          "",

        summary:
          resume.summary ?? "",

        education:
          resume.education ?? "",

        skills:
          resume.skills ?? "",

        projects:
          resume.projects ?? "",

        experience:
          resume.experience ?? "",
      });

      /*
       * Saved template restore
       */
      setSelectedTemplate(
        resume.template || "modern"
      );

      console.log(
        "EDIT FORM FILLED SUCCESSFULLY"
      );
    } catch (error) {
      if (!isMounted) return;

      console.error(
        "Resume fetch error:",
        error
      );

      console.error(
        "Resume fetch backend response:",
        error.response?.data
      );

      if (error.response?.status === 401) {
        toast.error(
          "Session expire ho gayi hai. Dobara login karo."
        );

        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        toast.error(
          "Is resume ko access karne ki permission nahi hai."
        );

        navigate("/my-resumes");
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
        setLoadingResume(false);
      }
    }
  };

  fetchResume();

  return () => {
    isMounted = false;
  };
}, [id, navigate]);
  


  /* =========================================================
     CURRENT TEMPLATE
  ========================================================= */

  const currentTemplate =
    resumeTemplates.find(
      (template) =>
        template.id ===
        selectedTemplate
    );

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <h2 className="mb-2">
            {id
              ? "✏️ Edit Resume"
              : "📄 AI Resume Builder"}
          </h2>

          <p className="text-muted mb-4">
            Fill your details and see the live
            resume preview.
          </p>

          {/* ===============================================
              TEMPLATE SELECTOR
          =============================================== */}

          {!loadingResume && (
            <div className="resume-template-selector mb-4">
              <div className="resume-template-selector-header">
                <div>
                  <h5 className="mb-1">
                    🎨 Choose Resume Template
                  </h5>

                  <p className="text-muted mb-0">
                    Select a template before
                    creating your resume.
                  </p>
                </div>

                <span className="selected-template-name">
                  Selected:{" "}
                  <strong>
                    {currentTemplate?.name ||
                      "Modern"}
                  </strong>
                </span>
              </div>

              <div className="resume-template-options">
                {resumeTemplates.map(
                  (template) => {
                    const isSelected =
                      selectedTemplate ===
                      template.id;

                    return (
                      <button
                        key={
                          template.id
                        }
                        type="button"
                        className={`resume-template-option ${
                          isSelected
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          handleTemplateChange(
                            template.id
                          )
                        }
                        aria-pressed={
                          isSelected
                        }
                      >
                        <div
                          className={`resume-template-mini-preview template-preview-${template.id}`}
                        >
                          <div className="template-mini-header" />

                          <div className="template-mini-line long" />
                          <div className="template-mini-line" />
                          <div className="template-mini-line short" />

                          <div className="template-mini-section" />

                          <div className="template-mini-line long" />
                          <div className="template-mini-line" />

                          <div className="template-mini-section" />

                          <div className="template-mini-line long" />
                          <div className="template-mini-line short" />
                        </div>

                        <div className="resume-template-option-info">
                          <strong>
                            {template.name}
                          </strong>

                          <small>
                            {
                              template.description
                            }
                          </small>
                        </div>

                        {isSelected && (
                          <span className="template-selected-check">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* ===============================================
              ORIGINAL LOADING SECTION
          =============================================== */}

          {loadingResume ? (
            <div className="d-flex justify-content-center py-5">
              <div className="text-center">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  aria-hidden="true"
                />

                <p className="text-muted mt-3 mb-0">
                  Loading resume...
                </p>
              </div>
            </div>
          ) : (
            /*
             * Existing grid class names same
             */
            <div className="row g-4 align-items-start">
              <div className="col-lg-5">
                <ResumeForm
                  formData={formData}
                  handleChange={
                    handleChange
                  }
                  handleGenerateAI={
                    handleGenerateAI
                  }
                  handleSaveResume={
                    handleSaveResume
                  }
                  generatingSummary={
                    generatingSummary
                  }
                  savingResume={
                    savingResume
                  }
                />
              </div>

              <div className="col-lg-7 mb-4">
                <ResumePreview
                  formData={formData}
                  selectedTemplate={
                    selectedTemplate
                  }
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}