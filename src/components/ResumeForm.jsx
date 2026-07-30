import { downloadPDF } from "../utils/pdf";

export default function ResumeForm({
  formData,
  handleChange,
  handleGenerateAI,
  handleSaveResume,
  generatingSummary,
  savingResume,
}) {
  const isBusy = generatingSummary || savingResume;

  return (
    <div className="card shadow-sm border-0 p-4 resume-form-card">
      <div className="mb-4">
        <h3 className="mb-1">Resume Details</h3>
        <p className="text-muted mb-0">
          Fill your information and check the live preview.
        </p>
      </div>

      {/* Personal Information */}
      <section className="resume-form-section">
        <h5 className="resume-form-section-title">
          👤 Personal Information
        </h5>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="fullName" className="form-label">
              Full Name <span className="text-danger">*</span>
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Santosh Yadav"
              className="form-control"
              value={formData.fullName || ""}
              onChange={handleChange}
              disabled={isBusy}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="designation" className="form-label">
              Designation
            </label>

            <input
              id="designation"
              type="text"
              name="designation"
              placeholder="Frontend Developer"
              className="form-control"
              value={formData.designation || ""}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="email" className="form-label">
              Email <span className="text-danger">*</span>
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="santosh@example.com"
              className="form-control"
              value={formData.email || ""}
              onChange={handleChange}
              disabled={isBusy}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="phone" className="form-label">
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              className="form-control"
              value={formData.phone || ""}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>
        </div>
      </section>

      {/* Address */}
      <section className="resume-form-section mt-4">
        <h5 className="resume-form-section-title">📍 Address</h5>

        <div className="mb-3">
          <label htmlFor="address" className="form-label">
            Address
          </label>

          <textarea
            id="address"
            name="address"
            placeholder="House number, village, street or locality"
            className="form-control"
            rows="2"
            value={formData.address || ""}
            onChange={handleChange}
            disabled={isBusy}
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="city" className="form-label">
              City
            </label>

            <input
              id="city"
              type="text"
              name="city"
              placeholder="Gorakhpur"
              className="form-control"
              value={formData.city || ""}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="state" className="form-label">
              State
            </label>

            <input
              id="state"
              type="text"
              name="state"
              placeholder="Uttar Pradesh"
              className="form-control"
              value={formData.state || ""}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="country" className="form-label">
              Country
            </label>

            <input
              id="country"
              type="text"
              name="country"
              placeholder="India"
              className="form-control"
              value={formData.country || ""}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="pincode" className="form-label">
              Pincode
            </label>

            <input
              id="pincode"
              type="text"
              name="pincode"
              placeholder="273303"
              className="form-control"
              value={formData.pincode || ""}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="resume-form-section mt-4">
        <h5 className="resume-form-section-title">🌐 Social Links</h5>

        <div className="mb-3">
          <label htmlFor="linkedin" className="form-label">
            LinkedIn Profile
          </label>

          <input
            id="linkedin"
            type="url"
            name="linkedin"
            placeholder="https://linkedin.com/in/username"
            className="form-control"
            value={formData.linkedin || ""}
            onChange={handleChange}
            disabled={isBusy}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="github" className="form-label">
            GitHub Profile
          </label>

          <input
            id="github"
            type="url"
            name="github"
            placeholder="https://github.com/username"
            className="form-control"
            value={formData.github || ""}
            onChange={handleChange}
            disabled={isBusy}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="portfolio" className="form-label">
            Portfolio Website
          </label>

          <input
            id="portfolio"
            type="url"
            name="portfolio"
            placeholder="https://yourportfolio.com"
            className="form-control"
            value={formData.portfolio || ""}
            onChange={handleChange}
            disabled={isBusy}
          />
        </div>
      </section>

      {/* Career Objective */}
      <section className="resume-form-section mt-4">
        <h5 className="resume-form-section-title">🎯 Career Objective</h5>

        <textarea
          id="careerObjective"
          name="careerObjective"
          placeholder="Write your career objective..."
          className="form-control"
          rows="4"
          value={formData.careerObjective || ""}
          onChange={handleChange}
          disabled={isBusy}
        />
      </section>

      {/* Professional Summary */}
      <section className="resume-form-section mt-4">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
          <h5 className="resume-form-section-title mb-0">
            📝 Professional Summary
          </h5>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={handleGenerateAI}
            disabled={isBusy}
          >
            {generatingSummary ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Generating...
              </>
            ) : (
              "✨ Generate with AI"
            )}
          </button>
        </div>

        <textarea
          id="summary"
          name="summary"
          placeholder="Write your professional summary or generate it with AI..."
          className="form-control"
          rows="5"
          value={formData.summary || ""}
          onChange={handleChange}
          disabled={isBusy}
        />
      </section>

      {/* Education */}
      <section className="resume-form-section mt-4">
        <h5 className="resume-form-section-title">🎓 Education</h5>

        <textarea
          id="education"
          name="education"
          placeholder="Example: BCA, ABC College, 2023 - 2026, 75%"
          className="form-control"
          rows="4"
          value={formData.education || ""}
          onChange={handleChange}
          disabled={isBusy}
        />

        <small className="text-muted">
          Abhi education ko text format me enter karo. Baad me ise dynamic
          multiple entries me convert karenge.
        </small>
      </section>

      {/* Skills */}
      <section className="resume-form-section mt-4">
        <h5 className="resume-form-section-title">🛠 Skills</h5>

        <textarea
          id="skills"
          name="skills"
          placeholder="HTML, CSS, JavaScript, React, PHP, Laravel, SQL"
          className="form-control"
          rows="3"
          value={formData.skills || ""}
          onChange={handleChange}
          disabled={isBusy}
        />

        <small className="text-muted">
          Skills ko comma se separate karo.
        </small>
      </section>

      {/* Projects */}
      <section className="resume-form-section mt-4">
        <h5 className="resume-form-section-title">🚀 Projects</h5>

        <textarea
          id="projects"
          name="projects"
          placeholder="Project name, technologies and project description"
          className="form-control"
          rows="5"
          value={formData.projects || ""}
          onChange={handleChange}
          disabled={isBusy}
        />
      </section>

      {/* Experience */}
      <section className="resume-form-section mt-4">
        <h5 className="resume-form-section-title">💼 Experience</h5>

        <textarea
          id="experience"
          name="experience"
          placeholder="Company, designation, duration and responsibilities"
          className="form-control"
          rows="5"
          value={formData.experience || ""}
          onChange={handleChange}
          disabled={isBusy}
        />
      </section>

      {/* Actions */}
      <div className="d-grid gap-2 mt-4">
        <button
          type="button"
          className="btn btn-success"
          onClick={handleSaveResume}
          disabled={isBusy}
        >
          {savingResume ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Saving Resume...
            </>
          ) : (
            "💾 Save Resume"
          )}
        </button>

        <button
          type="button"
          className="btn btn-danger"
          onClick={downloadPDF}
          disabled={isBusy}
        >
          📄 Download PDF
        </button>
      </div>
    </div>
  );
}