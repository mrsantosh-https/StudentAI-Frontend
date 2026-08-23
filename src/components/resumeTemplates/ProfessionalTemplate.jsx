export default function ProfessionalTemplate({ resume = {} }) {
  /*
  |--------------------------------------------------------------------------
  | SAFE VALUE
  |--------------------------------------------------------------------------
  */

  const getValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value).trim();
  };

  /*
  |--------------------------------------------------------------------------
  | SUPPORT DATABASE + FRONTEND FIELD NAMES
  |--------------------------------------------------------------------------
  */

  const fullName =
    getValue(resume.full_name) ||
    getValue(resume.fullName) ||
    getValue(resume.name) ||
    "Your Name";

  const designation =
    getValue(resume.designation) ||
    getValue(resume.role) ||
    getValue(resume.job_title) ||
    getValue(resume.jobTitle) ||
    "Professional";

  const email = getValue(resume.email);

  const phone =
    getValue(resume.phone) ||
    getValue(resume.phone_number);

  /*
  |--------------------------------------------------------------------------
  | LOCATION
  |--------------------------------------------------------------------------
  */

  const address = getValue(resume.address);
  const city = getValue(resume.city);
  const state = getValue(resume.state);
  const country = getValue(resume.country);
  const pincode = getValue(resume.pincode);

  const locationParts = [
    address,
    city,
    state,
    country,
    pincode,
  ].filter(Boolean);

  const location = locationParts.join(", ");

  /*
  |--------------------------------------------------------------------------
  | SOCIAL LINKS
  |--------------------------------------------------------------------------
  */

  const linkedin = getValue(resume.linkedin);
  const github = getValue(resume.github);
  const portfolio = getValue(resume.portfolio);

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const summary =
    getValue(resume.summary) ||
    getValue(resume.professional_summary) ||
    getValue(resume.career_objective) ||
    getValue(resume.careerObjective);

  /*
  |--------------------------------------------------------------------------
  | OTHER RESUME DATA
  |--------------------------------------------------------------------------
  */

  const education =
    getValue(resume.education);

  const skills =
    getValue(resume.skills);

  const projects =
    getValue(resume.projects);

  const experience =
    getValue(resume.experience);

  /*
  |--------------------------------------------------------------------------
  | TEXT FORMATTER
  |--------------------------------------------------------------------------
  | Converts multiline text into paragraphs.
  */

  const renderText = (text) => {
    if (!text) {
      return (
        <p className="resume-empty-text">
          No information added
        </p>
      );
    }

    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => (
        <p key={index}>{line}</p>
      ));
  };

  /*
  |--------------------------------------------------------------------------
  | SKILLS FORMATTER
  |--------------------------------------------------------------------------
  | Supports:
  | HTML/CSS/JS
  | HTML, CSS, JavaScript
  | HTML
  | CSS
  | JavaScript
  */

  const skillList = skills
    ? skills
        .split(/[,|\n]/)
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  /*
  |--------------------------------------------------------------------------
  | TEMPLATE
  |--------------------------------------------------------------------------
  */

  return (
    <div
      id="resume-template"
      className="professional-resume-template"
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="professional-resume-header">
        <h1>{fullName}</h1>

        <h2>{designation}</h2>

        <div className="professional-contact-row">
          {email && (
            <span>
              ✉ {email}
            </span>
          )}

          {phone && (
            <span>
              ☎ {phone}
            </span>
          )}

          {location && (
            <span>
              📍 {location}
            </span>
          )}
        </div>

        {(linkedin ||
          github ||
          portfolio) && (
          <div className="professional-social-row">
            {linkedin && (
              <span>
                LinkedIn: {linkedin}
              </span>
            )}

            {github && (
              <span>
                GitHub: {github}
              </span>
            )}

            {portfolio && (
              <span>
                Portfolio: {portfolio}
              </span>
            )}
          </div>
        )}
      </header>

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <main className="professional-resume-content">

        {/* =======================================================
            PROFESSIONAL SUMMARY
        ======================================================= */}

        {summary && (
          <section className="professional-resume-section">
            <h2>Professional Summary</h2>

            <div className="professional-summary">
              {renderText(summary)}
            </div>
          </section>
        )}

        {/* =======================================================
            SKILLS
        ======================================================= */}

        {skillList.length > 0 && (
          <section className="professional-resume-section">
            <h2>Skills</h2>

            <div className="professional-skills-list">
              {skillList.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </section>
        )}

        {/* =======================================================
            EXPERIENCE
        ======================================================= */}

        {experience && (
          <section className="professional-resume-section">
            <h2>Experience</h2>

            <div className="professional-text-section">
              {renderText(experience)}
            </div>
          </section>
        )}

        {/* =======================================================
            PROJECTS
        ======================================================= */}

        {projects && (
          <section className="professional-resume-section">
            <h2>Projects</h2>

            <div className="professional-text-section">
              {renderText(projects)}
            </div>
          </section>
        )}

        {/* =======================================================
            EDUCATION
        ======================================================= */}

        {education && (
          <section className="professional-resume-section">
            <h2>Education</h2>

            <div className="professional-text-section">
              {renderText(education)}
            </div>
          </section>
        )}

        {/* =======================================================
            EMPTY STATE
        ======================================================= */}

        {!summary &&
          !skills &&
          !experience &&
          !projects &&
          !education && (
            <section className="professional-resume-section">
              <p className="resume-empty-text">
                Resume information has not been added yet.
              </p>
            </section>
          )}
      </main>
    </div>
  );
}