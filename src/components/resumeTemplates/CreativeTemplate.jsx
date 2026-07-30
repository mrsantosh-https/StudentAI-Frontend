import React from "react";

export default function CreativeTemplate({ resume = {} }) {
  const getArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
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
    "Creative Professional";

  const email = resume.email || "your-email@example.com";
  const phone = resume.phone || resume.phone_number || "Phone not added";
  const location = resume.location || resume.address || "Location not added";

  const summary =
    resume.summary ||
    resume.professional_summary ||
    resume.objective ||
    "Add your professional summary here.";

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
    <div className="creative-resume-template" id="resume-template">
      <header className="creative-resume-header">
        <div className="creative-avatar">
          {initials || "YN"}
        </div>

        <div className="creative-header-content">
          <span className="creative-header-label">Creative Resume</span>
          <h1>{name}</h1>
          <h2>{role}</h2>

          <div className="creative-contact-row">
            <span>{email}</span>
            <span>{phone}</span>
            <span>{location}</span>
          </div>
        </div>
      </header>

      <div className="creative-resume-body">
        <aside className="creative-resume-sidebar">
          <section className="creative-sidebar-section">
            <h3>About Me</h3>
            <p>{summary}</p>
          </section>

          <section className="creative-sidebar-section">
            <h3>Skills</h3>

            {skills.length > 0 ? (
              <div className="creative-skills-list">
                {skills.map((skill, index) => (
                  <span key={`${String(skill)}-${index}`}>
                    {typeof skill === "string"
                      ? skill
                      : skill.name || skill.skill || "Skill"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="resume-empty-text">No skills added</p>
            )}
          </section>

          <section className="creative-sidebar-section">
            <h3>Education</h3>

            {education.length > 0 ? (
              education.map((item, index) => (
                <article
                  className="creative-education-item"
                  key={item.id || index}
                >
                  <h4>
                    {item.course ||
                      item.degree ||
                      item.qualification ||
                      "Course Name"}
                  </h4>

                  <p>
                    {item.college ||
                      item.institute ||
                      item.school ||
                      "College Name"}
                  </p>

                  <span>
                    {item.year ||
                      item.duration ||
                      item.date ||
                      ""}
                  </span>
                </article>
              ))
            ) : (
              <p className="resume-empty-text">No education added</p>
            )}
          </section>
        </aside>

        <main className="creative-resume-main">
          <section className="creative-resume-section">
            <div className="creative-section-title">
              <span>01</span>
              <h3>Experience</h3>
            </div>

            {experience.length > 0 ? (
              experience.map((item, index) => (
                <article
                  className="creative-resume-item"
                  key={item.id || index}
                >
                  <div className="creative-item-header">
                    <div>
                      <h4>
                        {item.title ||
                          item.position ||
                          item.job_title ||
                          "Job Title"}
                      </h4>

                      <h5>
                        {item.company ||
                          item.company_name ||
                          "Company Name"}
                      </h5>
                    </div>

                    <span>
                      {item.duration ||
                        item.period ||
                        item.date ||
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

          <section className="creative-resume-section">
            <div className="creative-section-title">
              <span>02</span>
              <h3>Projects</h3>
            </div>

            {projects.length > 0 ? (
              projects.map((project, index) => (
                <article
                  className="creative-resume-item creative-project-item"
                  key={project.id || index}
                >
                  <h4>
                    {project.title ||
                      project.name ||
                      "Project Title"}
                  </h4>

                  <p>
                    {project.description ||
                      project.details ||
                      ""}
                  </p>
                </article>
              ))
            ) : (
              <p className="resume-empty-text">No projects added</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}