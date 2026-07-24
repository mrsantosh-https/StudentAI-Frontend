import { downloadPDF } from "../utils/pdf";

export default function ResumeForm({
  formData,
  handleChange,
  handleGenerateAI,
  handleSaveResume,
  generatingSummary,
  savingResume,
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
        type="url"
        name="linkedin"
        placeholder="LinkedIn Profile URL"
        className="form-control mb-3"
        value={formData.linkedin || ""}
        onChange={handleChange}
      />

      <input
        type="url"
        name="github"
        placeholder="GitHub Profile URL"
        className="form-control mb-3"
        value={formData.github || ""}
        onChange={handleChange}
      />

      <input
        type="url"
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
        rows="4"
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
        rows="4"
        value={formData.projects || ""}
        onChange={handleChange}
      />

      <textarea
        name="experience"
        placeholder="Experience"
        className="form-control mb-3"
        rows="4"
        value={formData.experience || ""}
        onChange={handleChange}
      />

      <div className="d-grid gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleGenerateAI}
          disabled={generatingSummary}
        >
          {generatingSummary ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Generating Summary...
            </>
          ) : (
            "✨ Generate Summary with AI"
          )}
        </button>

        <button
            type="button"
            className="btn btn-success"
            onClick={handleSaveResume}
            disabled={savingResume || generatingSummary}
          >
            {savingResume ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              "💾 Save Resume"
            )}
          </button>

        <button
          type="button"
          className="btn btn-danger"
          onClick={downloadPDF}
          disabled={generatingSummary}
        >
          📄 Download PDF
        </button>
      </div>
    </div>
  );
}