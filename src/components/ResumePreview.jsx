import ModernTemplate from "./resumeTemplates/ModernTemplate";
import ProfessionalTemplate from "./resumeTemplates/ProfessionalTemplate";
import MinimalTemplate from "./resumeTemplates/MinimalTemplate";
import CorporateTemplate from "./resumeTemplates/CorporateTemplate";
import CreativeTemplate from "./resumeTemplates/CreativeTemplate";

export default function ResumePreview({
  formData = {},
  selectedTemplate = "modern",
}) {
  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const getString = (value) => {
    return typeof value === "string" ? value.trim() : "";
  };

  const splitSkills = (value) => {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }

    return String(value || "")
      .split(/,|\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  /*
   * Education, projects and experience are currently stored
   * as text in Resume Builder.
   *
   * Templates may expect arrays, so we provide safe arrays.
   */

  const toTextItems = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    const text = getString(value);

    if (!text) {
      return [];
    }

    return text
      .split(/\n\s*\n|\n/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({
        title: item,
        name: item,
        description: item,
        course: item,
        college: "",
        company: "",
        duration: "",
        year: "",
      }));
  };

  /*
  |--------------------------------------------------------------------------
  | Address
  |--------------------------------------------------------------------------
  */

  const addressParts = [
    formData.address,
    formData.city,
    formData.state,
    formData.country,
    formData.pincode,
  ]
    .map((item) => getString(item))
    .filter(Boolean);

  const location =
    addressParts.length > 0
      ? addressParts.join(", ")
      : "Your Location";

  /*
  |--------------------------------------------------------------------------
  | Normalized Resume Data
  |--------------------------------------------------------------------------
  */

  const skillsArray = splitSkills(formData.skills);

  const educationArray = toTextItems(formData.education);
  const projectsArray = toTextItems(formData.projects);
  const experienceArray = toTextItems(formData.experience);

  const resumeData = {
    /*
     * Name
     */
    full_name:
      getString(formData.fullName) || "Your Name",

    fullName:
      getString(formData.fullName) || "Your Name",

    name:
      getString(formData.fullName) || "Your Name",

    /*
     * Designation
     */
    designation:
      getString(formData.designation) ||
      "Professional Designation",

    role:
      getString(formData.designation) ||
      "Professional Designation",

    /*
     * Contact
     */
    email:
      getString(formData.email) ||
      "your-email@example.com",

    phone:
      getString(formData.phone) ||
      "+91 98765 43210",

    /*
     * Address
     */
    address: getString(formData.address),
    city: getString(formData.city),
    state: getString(formData.state),
    country: getString(formData.country),
    pincode: getString(formData.pincode),

    location,

    /*
     * Social links
     */
    linkedin: getString(formData.linkedin),
    github: getString(formData.github),
    portfolio: getString(formData.portfolio),

    /*
     * Career Objective
     */
    career_objective:
      getString(formData.careerObjective),

    careerObjective:
      getString(formData.careerObjective),

    /*
     * Summary
     */
    summary: getString(formData.summary),

    /*
     * Array versions used by templates
     */
    skills: skillsArray,
    education: educationArray,
    projects: projectsArray,
    experience: experienceArray,

    /*
     * Original text versions
     *
     * Agar kisi template ko direct text chahiye,
     * wo in properties ko use kar sakta hai.
     */
    skillsText: getString(formData.skills),
    educationText: getString(formData.education),
    projectsText: getString(formData.projects),
    experienceText: getString(formData.experience),
  };

  /*
  |--------------------------------------------------------------------------
  | Render Selected Template
  |--------------------------------------------------------------------------
  */

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case "professional":
        return (
          <ProfessionalTemplate
            resume={resumeData}
          />
        );

      case "minimal":
        return (
          <MinimalTemplate
            resume={resumeData}
          />
        );

      case "corporate":
        return (
          <CorporateTemplate
            resume={resumeData}
          />
        );

      case "creative":
        return (
          <CreativeTemplate
            resume={resumeData}
          />
        );

      case "modern":
      default:
        return (
          <ModernTemplate
            resume={resumeData}
          />
        );
    }
  };

  return (
    <div className="resume-preview-wrapper">
      {renderTemplate()}
    </div>
  );
}