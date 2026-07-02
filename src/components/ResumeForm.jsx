import { downloadPDF } from "../utils/pdf";

export default function ResumeForm({
  formData,
  handleChange,
  handleGenerateAI,
  handleSaveResume,
}) {
  return (
    <div className="card shadow-sm border-0 p-4">
      <h3 className="mb-4">Resume Details</h3>

      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        className="form-control mb-3"
        value={formData.fullName || ""}
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        className="form-control mb-3"
        value={formData.email || ""}
        onChange={handleChange}
      />

      <input
        type="text"
        name="phone"
        placeholder="Phone"
        className="form-control mb-3"
        value={formData.phone || ""}
        onChange={handleChange}
      />

      <input
        type="text"
        name="linkedin"
        placeholder="LinkedIn Profile URL"
        className="form-control mb-3"
        value={formData.linkedin || ""}
        onChange={handleChange}
      />

      <input
        type="text"
        name="github"
        placeholder="GitHub Profile URL"
        className="form-control mb-3"
        value={formData.github || ""}
        onChange={handleChange}
      />

      <input
        type="text"
        name="portfolio"
        placeholder="Portfolio Website URL"
        className="form-control mb-3"
        value={formData.portfolio || ""}
        onChange={handleChange}
      />

      <textarea
        name="summary"
        placeholder="Professional Summary"
        className="form-control mb-3"
        rows="3"
        value={formData.summary || ""}
        onChange={handleChange}
      />

      <textarea
        name="education"
        placeholder="Education"
        className="form-control mb-3"
        rows="3"
        value={formData.education || ""}
        onChange={handleChange}
      />

      <textarea
        name="skills"
        placeholder="Skills"
        className="form-control mb-3"
        rows="3"
        value={formData.skills || ""}
        onChange={handleChange}
      />

      <textarea
        name="projects"
        placeholder="Projects"
        className="form-control mb-3"
        rows="3"
        value={formData.projects || ""}
        onChange={handleChange}
      />

      <textarea
        name="experience"
        placeholder="Experience"
        className="form-control mb-3"
        rows="3"
        value={formData.experience || ""}
        onChange={handleChange}
      />

      <div className="d-flex gap-3 mt-4">
        <button type="button" className="btn btn-primary" onClick={handleGenerateAI}>
          🤖 Generate AI Resume
        </button>

        <button type="button" className="btn btn-success" onClick={handleSaveResume}>
          💾 Save Resume
        </button>

        <button type="button" className="btn btn-danger" onClick={downloadPDF}>
          📄 Download PDF
        </button>
      </div>
    </div>
  );
}