export default function ModernTemplate({ resume = {} }) {
  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const getString = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value).trim();
  };

  const getSkills = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") {
            return item.trim();
          }

          return (
            item?.name ||
            item?.skill ||
            item?.title ||
            ""
          );
        })
        .filter(Boolean);
    }

    if (!value) {
      return [];
    }

    if (typeof value === "string") {
      try {
        const parsedValue = JSON.parse(value);

        if (Array.isArray(parsedValue)) {
          return parsedValue
            .map((item) => {
              if (typeof item === "string") {
                return item.trim();
              }

              return (
                item?.name ||
                item?.skill ||
                item?.title ||
                ""
              );
            })
            .filter(Boolean);
        }
      } catch {
        return value
          .split(/,|\n/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  const getSectionArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value) {
      return [];
    }

    if (typeof value === "string") {
      const cleanValue = value.trim();

      if (!cleanValue) {
        return [];
      }

      try {
        const parsedValue = JSON.parse(cleanValue);

        if (Array.isArray(parsedValue)) {
          return parsedValue;
        }
      } catch {
        return cleanValue
          .split(/\n\s*\n|\n/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  /*
  |--------------------------------------------------------------------------
  | Basic Information
  |--------------------------------------------------------------------------
  */

  const name =
    getString(resume.name) ||
    getString(resume.full_name) ||
    getString(resume.fullName) ||
    "Your Name";

  const role =
    getString(resume.role) ||
    getString(resume.designation) ||
    getString(resume.job_title) ||
    getString(resume.jobTitle) ||
    getString(resume.professional_title) ||
    "Professional Designation";

  const email =
    getString(resume.email) ||
    "your-email@example.com";

  const phone =
    getString(resume.phone) ||
    getString(resume.phone_number) ||
    "+91 98765 43210";

  /*
  |--------------------------------------------------------------------------
  | Location
  |--------------------------------------------------------------------------
  */

  const addressParts = [
    resume.address,
    resume.city,
    resume.state,
    resume.country,
    resume.pincode,
  ]
    .map((item) => getString(item))
    .filter(Boolean);

  const location =
    getString(resume.location) ||
    (addressParts.length > 0
      ? addressParts.join(", ")
      : "Location not added");

  /*
  |--------------------------------------------------------------------------
  | Summary
  |--------------------------------------------------------------------------
  */

  const summary =
    getString(resume.summary) ||
    getString(resume.professional_summary) ||
    getString(resume.career_objective) ||
    getString(resume.careerObjective) ||
    getString(resume.objective) ||
    "Professional summary has not been added yet.";

  /*
  |--------------------------------------------------------------------------
  | Sections
  |--------------------------------------------------------------------------
  */

  const skills = getSkills(
    resume.skills
  );

  const experience =
    getSectionArray(
      resume.experience
    );

  const projects =
    getSectionArray(
      resume.projects
    );

  const education =
    getSectionArray(
      resume.education
    );

  /*
  |--------------------------------------------------------------------------
  | Initials
  |--------------------------------------------------------------------------
  */

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .slice(0, 2)
    .join("");

  /*
  |--------------------------------------------------------------------------
  | JSX
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="modern-resume-template"
      id="resume-template"
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="modern-resume-sidebar">
        <div className="resume-profile-avatar">
          {initials || "YN"}
        </div>

        <h1>{name}</h1>

        <p className="resume-job-role">
          {role}
        </p>

        {/* Contact */}

        <div className="modern-sidebar-section">
          <h2>Contact</h2>

          <ul className="resume-contact-list">
            <li>
              <span>Email</span>

              <p>{email}</p>
            </li>

            <li>
              <span>Phone</span>

              <p>{phone}</p>
            </li>

            <li>
              <span>Location</span>

              <p>{location}</p>
            </li>
          </ul>
        </div>

        {/* Skills */}

        <div className="modern-sidebar-section">
          <h2>Skills</h2>

          <div className="resume-skill-list">
            {skills.length > 0 ? (
              skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                )
              )
            ) : (
              <p className="resume-empty-text">
                No skills added
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="modern-resume-main">
        {/* Professional Summary */}

        <section className="modern-resume-section">
          <h2>
            Professional Summary
          </h2>

          <p>{summary}</p>
        </section>

        {/* ===================================================
            EXPERIENCE
        =================================================== */}

        <section className="modern-resume-section">
          <h2>Experience</h2>

          {experience.length > 0 ? (
            experience.map(
              (item, index) => {
                /*
                 * Resume Builder currently stores
                 * experience as plain text.
                 */
                if (
                  typeof item === "string"
                ) {
                  return (
                    <article
                      className="modern-resume-item"
                      key={`experience-${index}`}
                    >
                      <p>{item}</p>
                    </article>
                  );
                }

                return (
                  <article
                    className="modern-resume-item"
                    key={
                      item?.id ||
                      `experience-${index}`
                    }
                  >
                    <div className="resume-item-header">
                      <div>
                        <h3>
                          {item?.title ||
                            item?.position ||
                            item?.job_title ||
                            item?.role ||
                            "Job Title"}
                        </h3>

                        {(
                          item?.company ||
                          item?.company_name
                        ) && (
                          <h4>
                            {item.company ||
                              item.company_name}
                          </h4>
                        )}
                      </div>

                      {(item?.duration ||
                        item?.date ||
                        item?.period) && (
                        <span>
                          {item.duration ||
                            item.date ||
                            item.period}
                        </span>
                      )}
                    </div>

                    {(item?.description ||
                      item?.responsibilities) && (
                      <p>
                        {item.description ||
                          item.responsibilities}
                      </p>
                    )}
                  </article>
                );
              }
            )
          ) : (
            <p className="resume-empty-text">
              No experience added
            </p>
          )}
        </section>

        {/* ===================================================
            PROJECTS
        =================================================== */}

        <section className="modern-resume-section">
          <h2>Projects</h2>

          {projects.length > 0 ? (
            projects.map(
              (project, index) => {
                /*
                 * Plain text project
                 */
                if (
                  typeof project ===
                  "string"
                ) {
                  return (
                    <article
                      className="modern-resume-item"
                      key={`project-${index}`}
                    >
                      <p>
                        {project}
                      </p>
                    </article>
                  );
                }

                return (
                  <article
                    className="modern-resume-item"
                    key={
                      project?.id ||
                      `project-${index}`
                    }
                  >
                    <h3>
                      {project?.title ||
                        project?.name ||
                        "Project Title"}
                    </h3>

                    {(project?.description ||
                      project?.details) && (
                      <p>
                        {project.description ||
                          project.details}
                      </p>
                    )}
                  </article>
                );
              }
            )
          ) : (
            <p className="resume-empty-text">
              No projects added
            </p>
          )}
        </section>

        {/* ===================================================
            EDUCATION
        =================================================== */}

        <section className="modern-resume-section">
          <h2>Education</h2>

          {education.length > 0 ? (
            education.map(
              (item, index) => {
                /*
                 * Plain text education
                 */
                if (
                  typeof item === "string"
                ) {
                  return (
                    <article
                      className="modern-resume-item"
                      key={`education-${index}`}
                    >
                      <p>{item}</p>
                    </article>
                  );
                }

                return (
                  <article
                    className="modern-resume-item"
                    key={
                      item?.id ||
                      `education-${index}`
                    }
                  >
                    <div className="resume-item-header">
                      <div>
                        <h3>
                          {item?.course ||
                            item?.degree ||
                            item
                              ?.qualification ||
                            "Course Name"}
                        </h3>

                        {(
                          item?.college ||
                          item?.institute ||
                          item?.school
                        ) && (
                          <h4>
                            {item.college ||
                              item.institute ||
                              item.school}
                          </h4>
                        )}
                      </div>

                      {(item?.year ||
                        item?.duration ||
                        item?.date) && (
                        <span>
                          {item.year ||
                            item.duration ||
                            item.date}
                        </span>
                      )}
                    </div>
                  </article>
                );
              }
            )
          ) : (
            <p className="resume-empty-text">
              No education added
            </p>
          )}
        </section>
      </main>
    </div>
  );
}