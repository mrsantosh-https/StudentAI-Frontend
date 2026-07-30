export default function ResumePreview({ formData = {} }) {
  const fullName = formData.fullName?.trim() || "Your Name";

  const designation =
    formData.designation?.trim() || "Professional Designation";

  const email = formData.email?.trim() || "your-email@example.com";
  const phone = formData.phone?.trim() || "+91 98765 43210";

  const addressParts = [
    formData.address,
    formData.city,
    formData.state,
    formData.country,
    formData.pincode,
  ]
    .map((item) => item?.trim())
    .filter(Boolean);

  const completeAddress =
    addressParts.length > 0
      ? addressParts.join(", ")
      : "Your complete address";

  const skills = formData.skills
    ? formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="resume-preview-wrapper">
      <div className="resume-preview-card" id="resume-preview">
        {/* Header */}
        <header className="resume-preview-header">
          <div>
            <h1>{fullName}</h1>
            <h2>{designation}</h2>
          </div>

          <div className="resume-preview-contact">
            <p>{email}</p>
            <p>{phone}</p>
            <p>{completeAddress}</p>
          </div>
        </header>

        {/* Social Links */}
        {(formData.linkedin ||
          formData.github ||
          formData.portfolio) && (
          <section className="resume-preview-links">
            {formData.linkedin && (
              <a
                href={formData.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}

            {formData.github && (
              <a
                href={formData.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            )}

            {formData.portfolio && (
              <a
                href={formData.portfolio}
                target="_blank"
                rel="noreferrer"
              >
                Portfolio
              </a>
            )}
          </section>
        )}

        {/* Career Objective */}
        {formData.careerObjective && (
          <section className="resume-preview-section">
            <h3>Career Objective</h3>
            <p>{formData.careerObjective}</p>
          </section>
        )}

        {/* Professional Summary */}
        {formData.summary && (
          <section className="resume-preview-section">
            <h3>Professional Summary</h3>
            <p>{formData.summary}</p>
          </section>
        )}

        {/* Skills */}
        <section className="resume-preview-section">
          <h3>Skills</h3>

          {skills.length > 0 ? (
            <div className="resume-preview-skills">
              {skills.map((skill, index) => (
                <span key={`${skill}-${index}`}>{skill}</span>
              ))}
            </div>
          ) : (
            <p className="resume-preview-empty">
              Add your technical and professional skills.
            </p>
          )}
        </section>

        {/* Education */}
        <section className="resume-preview-section">
          <h3>Education</h3>

          {formData.education ? (
            <p className="resume-preview-pre-line">
              {formData.education}
            </p>
          ) : (
            <p className="resume-preview-empty">
              Add your educational details.
            </p>
          )}
        </section>

        {/* Projects */}
        <section className="resume-preview-section">
          <h3>Projects</h3>

          {formData.projects ? (
            <p className="resume-preview-pre-line">
              {formData.projects}
            </p>
          ) : (
            <p className="resume-preview-empty">
              Add your project details.
            </p>
          )}
        </section>

        {/* Experience */}
        <section className="resume-preview-section">
          <h3>Experience</h3>

          {formData.experience ? (
            <p className="resume-preview-pre-line">
              {formData.experience}
            </p>
          ) : (
            <p className="resume-preview-empty">
              Add your professional experience.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}