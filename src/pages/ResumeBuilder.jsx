import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ResumeForm from "../components/ResumeForm";
import ResumePreview from "../components/ResumePreview";

import "../styles/dashboardLayout.css";
import "../styles/resume.css";

const initialFormData = {
  fullName: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  education: "",
  skills: "",
  projects: "",
  experience: "",
};

export default function ResumeBuilder() {
  const [formData, setFormData] = useState(initialFormData);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [savingResume, setSavingResume] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleGenerateAI = async () => {
    if (generatingSummary) return;

    if (!formData.fullName.trim()) {
      toast.error("Pehle full name enter karo.");
      return;
    }

    if (!formData.skills.trim()) {
      toast.error("Pehle skills enter karo.");
      return;
    }

    try {
      setGeneratingSummary(true);

      const response = await api.post("/ai/resume-summary", {
        fullName: formData.fullName.trim(),
        education: formData.education.trim(),
        skills: formData.skills.trim(),
        projects: formData.projects.trim(),
        experience: formData.experience.trim(),
      });

      if (!response.data?.success || !response.data?.summary) {
        throw new Error(
          response.data?.message || "AI summary receive nahi hui."
        );
      }

      setFormData((previousData) => ({
        ...previousData,
        summary: response.data.summary,
      }));

      toast.success("AI summary generated successfully.");
    } catch (error) {
      console.error("AI summary error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "AI summary generate nahi ho saka."
      );
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSaveResume = async () => {
    if (savingResume) return;

    if (!formData.fullName.trim()) {
      toast.error("Full name required hai.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email required hai.");
      return;
    }

    try {
      setSavingResume(true);

      const payload = {
        ...formData,
        title: formData.fullName.trim() || "Untitled Resume",
      };

      const response = id
        ? await api.put(`/resumes/${id}`, payload)
        : await api.post("/resumes", payload);

      toast.success(
        response.data?.message ||
          (id
            ? "Resume updated successfully."
            : "Resume saved successfully.")
      );

      navigate("/my-resumes");
    } catch (error) {
      console.error("Resume save error:", error);

      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)?.[0]?.[0];
        toast.error(firstError || "Resume validation failed.");
      } else {
        toast.error(
          error.response?.data?.message || "Resume save/update failed."
        );
      }
    } finally {
      setSavingResume(false);
    }
  };

  const fetchResume = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingResume(true);

      const response = await api.get(`/resumes/${id}`);
      const resume = response.data;

      setFormData({
        fullName: resume.full_name || "",
        email: resume.email || "",
        phone: resume.phone || "",
        linkedin: resume.linkedin || "",
        github: resume.github || "",
        portfolio: resume.portfolio || "",
        summary: resume.summary || "",
        education: resume.education || "",
        skills: resume.skills || "",
        projects: resume.projects || "",
        experience: resume.experience || "",
      });
    } catch (error) {
      console.error("Resume fetch error:", error);

      toast.error(
        error.response?.data?.message || "Resume load nahi ho saka."
      );

      navigate("/my-resumes");
    } finally {
      setLoadingResume(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <h2 className="mb-2">
            {id ? "✏️ Edit Resume" : "📄 AI Resume Builder"}
          </h2>

          <p className="text-muted mb-4">
            Fill your details and see the live resume preview.
          </p>

          {loadingResume ? (
            <div className="d-flex justify-content-center py-5">
              <div className="text-center">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  aria-hidden="true"
                />
                <p className="text-muted mt-3 mb-0">Loading resume...</p>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-5 mb-4">
                <ResumeForm
                  formData={formData}
                  handleChange={handleChange}
                  handleGenerateAI={handleGenerateAI}
                  handleSaveResume={handleSaveResume}
                  generatingSummary={generatingSummary}
                  savingResume={savingResume}
                />
              </div>

              <div className="col-lg-7 mb-4">
                <ResumePreview formData={formData} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}