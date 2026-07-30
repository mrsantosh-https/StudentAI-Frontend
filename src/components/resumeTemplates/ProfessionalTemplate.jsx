import React from "react";

export default function ProfessionalTemplate({ resume = {} }) {
  const getArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value) {
      return [];
    }

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
    "Professional Title";

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

  return (
    <div
      className="professional-resume-template"
      id="resume-template"
    >
      <header className="professional-resume-header">
        <h1>{name}</h1>
        <h2>{role}</h2>

        <div className="professional-contact-row">
          <span>{email}</span>
          <span>{phone}</span>
          <span>{location}</span>
        </div>
      </header>

      <main className="professional-resume-content">
        <section className="professional-resume-section">
          <h2>Professional Summary</h2>
          <p>{summary}</p>
        </section>

        <section className="professional-resume-section">
          <h2>Skills</h2>

          {skills.length > 0 ? (
            <div className="professional-skills-list">
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

        <section className="professional-resume-section">
          <h2>Experience</h2>

          {experience.length > 0 ? (
            experience.map((item, index) => (
              <article
                className="professional-resume-item"
                key={item.id || index}
              >
                <div className="professional-item-header">
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

        <section className="professional-resume-section">
          <h2>Projects</h2>

          {projects.length > 0 ? (
            projects.map((project, index) => (
              <article
                className="professional-resume-item"
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

        <section className="professional-resume-section">
          <h2>Education</h2>

          {education.length > 0 ? (
            education.map((item, index) => (
              <article
                className="professional-resume-item"
                key={item.id || index}
              >
                <div className="professional-item-header">
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