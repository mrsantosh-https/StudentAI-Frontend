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

export default function ResumeBuilder() {
  const [formData, setFormData] = useState(initialFormData);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [savingResume, setSavingResume] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const getValue = (value) => {
    return typeof value === "string" ? value : "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleGenerateAI = async () => {
    if (generatingSummary) return;

    const fullName = getValue(formData.fullName).trim();
    const skills = getValue(formData.skills).trim();

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

      const response = await api.post("/ai/resume-summary", {
        fullName,
        designation: getValue(formData.designation).trim(),
        education: getValue(formData.education).trim(),
        skills,
        projects: getValue(formData.projects).trim(),
        experience: getValue(formData.experience).trim(),
        careerObjective: getValue(formData.careerObjective).trim(),
      });

      const generatedSummary =
        response.data?.summary ||
        response.data?.data?.summary ||
        response.data?.result?.summary ||
        "";

      if (!generatedSummary) {
        throw new Error(
          response.data?.message || "AI summary receive nahi hui."
        );
      }

      setFormData((previousData) => ({
        ...previousData,
        summary: generatedSummary,
      }));

      toast.success("AI summary generated successfully.");
    } catch (error) {
      console.error("AI summary error:", error);
      console.error("AI summary backend response:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "AI summary generate nahi ho saka."
      );
    } finally {
      setGeneratingSummary(false);
    }
  };

  const validateForm = () => {
    const fullName = getValue(formData.fullName).trim();
    const email = getValue(formData.email).trim();

    if (!fullName) {
      toast.error("Full name required hai.");
      return false;
    }

    if (!email) {
      toast.error("Email required hai.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      toast.error("Valid email address enter karo.");
      return false;
    }

    return true;
  };

  const createResumePayload = () => {
    const fullName = getValue(formData.fullName).trim();

    return {
      title: `${fullName || "Untitled"} Resume`,

      fullName,
      designation: getValue(formData.designation).trim(),
      email: getValue(formData.email).trim(),
      phone: getValue(formData.phone).trim(),

      address: getValue(formData.address).trim(),
      city: getValue(formData.city).trim(),
      state: getValue(formData.state).trim(),
      country: getValue(formData.country).trim(),
      pincode: getValue(formData.pincode).trim(),

      linkedin: getValue(formData.linkedin).trim(),
      github: getValue(formData.github).trim(),
      portfolio: getValue(formData.portfolio).trim(),

      careerObjective: getValue(formData.careerObjective).trim(),
      summary: getValue(formData.summary).trim(),
      education: getValue(formData.education).trim(),
      skills: getValue(formData.skills).trim(),
      projects: getValue(formData.projects).trim(),
      experience: getValue(formData.experience).trim(),
    };
  };

  const handleSaveResume = async () => {
    if (savingResume) return;

    if (!validateForm()) return;

    try {
      setSavingResume(true);

      const payload = createResumePayload();

      console.log("Resume payload:", payload);

      const response = id
        ? await api.put(`/resumes/${id}`, payload)
        : await api.post("/resumes", payload);

      console.log("Resume save response:", response.data);

      toast.success(
        response.data?.message ||
          (id
            ? "Resume updated successfully."
            : "Resume saved successfully.")
      );

      navigate("/my-resumes");
    } catch (error) {
      console.error("Resume save error:", error);
      console.error("Resume backend response:", error.response?.data);
      console.error("Resume status code:", error.response?.status);

      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        const firstErrorGroup = Object.values(validationErrors)[0];
        const firstError = Array.isArray(firstErrorGroup)
          ? firstErrorGroup[0]
          : firstErrorGroup;

        toast.error(firstError || "Resume validation failed.");
        return;
      }

      if (error.response?.status === 401) {
        toast.error("Session expire ho gayi hai. Dobara login karo.");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        toast.error("Is resume ko update karne ki permission nahi hai.");
        return;
      }

      if (error.response?.status === 404) {
        toast.error("Resume route ya resume record nahi mila.");
        return;
      }

      if (error.response?.status === 500) {
        toast.error(
          error.response?.data?.message ||
            "Laravel backend me internal server error hai."
        );
        return;
      }

      if (error.code === "ERR_NETWORK") {
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

  const fetchResume = useCallback(async () => {
    if (!id) {
      setFormData(initialFormData);
      return;
    }

    try {
      setLoadingResume(true);

      const response = await api.get(`/resumes/${id}`);

      const resume =
        response.data?.resume ||
        response.data?.data ||
        response.data;

      if (!resume) {
        throw new Error("Resume data receive nahi hua.");
      }

      setFormData({
        fullName: resume.full_name || resume.fullName || "",
        designation: resume.designation || "",
        email: resume.email || "",
        phone: resume.phone || "",

        address: resume.address || "",
        city: resume.city || "",
        state: resume.state || "",
        country: resume.country || "",
        pincode: resume.pincode || "",

        linkedin: resume.linkedin || "",
        github: resume.github || "",
        portfolio: resume.portfolio || "",

        careerObjective:
          resume.career_objective ||
          resume.careerObjective ||
          "",

        summary: resume.summary || "",
        education: resume.education || "",
        skills: resume.skills || "",
        projects: resume.projects || "",
        experience: resume.experience || "",
      });
    } catch (error) {
      console.error("Resume fetch error:", error);
      console.error("Resume fetch backend response:", error.response?.data);

      if (error.response?.status === 401) {
        toast.error("Session expire ho gayi hai. Dobara login karo.");
        navigate("/login");
        return;
      }

      if (error.response?.status === 404) {
        toast.error("Resume nahi mila.");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Resume load nahi ho saka."
        );
      }

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

                <p className="text-muted mt-3 mb-0">
                  Loading resume...
                </p>
              </div>
            </div>
          ) : (
            <div className="row g-4 align-items-start">
              <div className="col-lg-5">
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