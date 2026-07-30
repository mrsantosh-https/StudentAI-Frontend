import React from "react";

export default function ModernTemplate({ resume = {} }) {
  const getArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value) {
      return [];
    }

    if (typeof value === "string") {
      try {
        const parsedValue = JSON.parse(value);

        if (Array.isArray(parsedValue)) {
          return parsedValue;
        }
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  const name =
    resume.name ||
    resume.full_name ||
    resume.fullName ||
    "Your Name";

  const role =
    resume.role ||
    resume.job_title ||
    resume.jobTitle ||
    resume.professional_title ||
    "Your Job Role";

  const email = resume.email || "your-email@example.com";
  const phone = resume.phone || resume.phone_number || "Phone not added";
  const location =
    resume.location ||
    resume.address ||
    "Location not added";

  const summary =
    resume.summary ||
    resume.professional_summary ||
    resume.objective ||
    "Professional summary has not been added yet.";

  const skills = getArray(resume.skills);
  const experience = getArray(resume.experience);
  const projects = getArray(resume.projects);
  const education = getArray(resume.education);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
 
    <div className="modern-resume-template" id="resume-template">
      <aside className="modern-resume-sidebar">
        <div className="resume-profile-avatar">
          {initials || "YN"}
        </div>

        <h1>{name}</h1>
        <p className="resume-job-role">{role}</p>

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

        <div className="modern-sidebar-section">
          <h2>Skills</h2>

          <div className="resume-skill-list">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span key={`${String(skill)}-${index}`}>
                  {typeof skill === "string"
                    ? skill
                    : skill.name || skill.skill || "Skill"}
                </span>
              ))
            ) : (
              <p className="resume-empty-text">No skills added</p>
            )}
          </div>
        </div>
      </aside>

      <main className="modern-resume-main">
        <section className="modern-resume-section">
          <h2>Professional Summary</h2>
          <p>{summary}</p>
        </section>

        <section className="modern-resume-section">
          <h2>Experience</h2>

          {experience.length > 0 ? (
            experience.map((item, index) => (
              <article
                className="modern-resume-item"
                key={item.id || index}
              >
                <div className="resume-item-header">
                  <div>
                    <h3>
                      {item.title ||
                        item.position ||
                        item.job_title ||
                        "Job Title"}
                    </h3>

                    <h4>
                      {item.company ||
                        item.company_name ||
                        "Company Name"}
                    </h4>
                  </div>

                  <span>
                    {item.duration ||
                      item.date ||
                      item.period ||
                      ""}
                  </span>
                </div>

                <p>
                  {item.description ||
                    item.responsibilities ||
                    ""}
                </p>
              </article>
            ))
          ) : (
            <p className="resume-empty-text">
              No experience added
            </p>
          )}
        </section>

        <section className="modern-resume-section">
          <h2>Projects</h2>

          {projects.length > 0 ? (
            projects.map((project, index) => (
              <article
                className="modern-resume-item"
                key={project.id || index}
              >
                <h3>
                  {project.title ||
                    project.name ||
                    "Project Title"}
                </h3>

                <p>
                  {project.description ||
                    project.details ||
                    ""}
                </p>
              </article>
            ))
          ) : (
            <p className="resume-empty-text">
              No projects added
            </p>
          )}
        </section>

        <section className="modern-resume-section">
          <h2>Education</h2>

          {education.length > 0 ? (
            education.map((item, index) => (
              <article
                className="modern-resume-item"
                key={item.id || index}
              >
                <div className="resume-item-header">
                  <div>
                    <h3>
                      {item.course ||
                        item.degree ||
                        item.qualification ||
                        "Course Name"}
                    </h3>

                    <h4>
                      {item.college ||
                        item.institute ||
                        item.school ||
                        "College Name"}
                    </h4>
                  </div>

                  <span>
                    {item.year ||
                      item.duration ||
                      item.date ||
                      ""}
                  </span>
                </div>
              </article>
            ))
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