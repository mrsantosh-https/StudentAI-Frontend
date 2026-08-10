export default function CorporateTemplate({ resume = {} }) {
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
    <div className="corporate-resume-template" id="resume-template">
      <header className="corporate-resume-header">
        <div>
          <span className="corporate-label">Curriculum Vitae</span>
          <h1>{name}</h1>
          <h2>{role}</h2>
        </div>

        <div className="corporate-contact-box">
          <p>{email}</p>
          <p>{phone}</p>
          <p>{location}</p>
        </div>
      </header>

      <div className="corporate-resume-body">
        <aside className="corporate-resume-sidebar">
          <section className="corporate-sidebar-section">
            <h3>Core Skills</h3>

            {skills.length > 0 ? (
              <ul className="corporate-skills-list">
                {skills.map((skill, index) => (
                  <li key={`${String(skill)}-${index}`}>
                    {typeof skill === "string"
                      ? skill
                      : skill.name || skill.skill || "Skill"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="resume-empty-text">No skills added</p>
            )}
          </section>

          <section className="corporate-sidebar-section">
            <h3>Education</h3>

            {education.length > 0 ? (
              education.map((item, index) => (
                <article
                  className="corporate-education-item"
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

        <main className="corporate-resume-main">
          <section className="corporate-resume-section">
            <h3>Executive Profile</h3>
            <p>{summary}</p>
          </section>

          <section className="corporate-resume-section">
            <h3>Professional Experience</h3>

            {experience.length > 0 ? (
              experience.map((item, index) => (
                <article
                  className="corporate-resume-item"
                  key={item.id || index}
                >
                  <div className="corporate-item-header">
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

          <section className="corporate-resume-section">
            <h3>Selected Projects</h3>

            {projects.length > 0 ? (
              projects.map((project, index) => (
                <article
                  className="corporate-resume-item"
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