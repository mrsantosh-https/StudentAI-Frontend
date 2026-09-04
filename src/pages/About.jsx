import {
FaRobot,
FaFileAlt,
FaBriefcase,
FaGraduationCap,
FaRocket,
FaUsers,
FaLightbulb,
FaBullseye,
FaArrowRight,
} from "react-icons/fa";
import "../styles/about.css";
import { Link } from "react-router-dom";

const About = () => {
const features = [
{
icon: <FaFileAlt />,
title: "AI Resume Builder",
description:
"Create professional and ATS-friendly resumes designed to help you stand out.",
},
{
icon: <FaRobot />,
title: "AI Career Coach",
description:
"Get personalized career guidance, answers to your questions, and practical advice.",
},
{
icon: <FaBriefcase />,
title: "Job Matcher",
description:
"Compare your resume with job descriptions and discover matching and missing skills.",
},
{
icon: <FaGraduationCap />,
title: "Career Roadmap",
description:
"Generate a personalized learning roadmap based on your career goals and current skills.",
},
];

const values = [
{
icon: <FaBullseye />,
title: "Our Mission",
description:
"To make career guidance and professional development accessible to every student and fresher.",
},
{
icon: <FaLightbulb />,
title: "Smart Guidance",
description:
"We use artificial intelligence to provide personalized suggestions and practical career insights.",
},
{
icon: <FaRocket />,
title: "Career Growth",
description:
"Our goal is to help users learn the right skills, build projects, and prepare for opportunities.",
},
];

return ( <div className="about-page">
{/* Hero Section */} <section className="about-hero"> <div className="about-hero-content"> <div className="about-badge"> <FaRobot />
AI-Powered Career Platform </div>


      <h1>
        Build Your Future With <span>StudentAI</span>
      </h1>

      <p>
        StudentAI is an AI-powered career platform designed to help
        students and freshers build skills, create professional resumes,
        prepare for interviews, and confidently move towards their dream
        careers.
      </p>

      <button className="about-btn" >
      <Link to="/login">Explore StudentAI</Link>
        
        <FaArrowRight />
      </button>
    </div>

    <div className="about-hero-visual">
      <div className="ai-circle">
        <FaRobot />
      </div>

      <div className="floating-card card-one">
        <FaFileAlt />
        <span>Smart Resume</span>
      </div>

      <div className="floating-card card-two">
        <FaBriefcase />
        <span>Job Ready</span>
      </div>

      <div className="floating-card card-three">
        <FaRocket />
        <span>Career Growth</span>
      </div>
    </div>
  </section>

  {/* About StudentAI */}
  <section className="about-intro">
    <div className="section-heading">
      <span>ABOUT STUDENTAI</span>
      <h2>Your AI Partner for Career Success</h2>
    </div>

    <div className="about-intro-content">
      <div className="about-text">
        <p>
          Choosing the right career path can be difficult, especially for
          students and freshers. StudentAI was created to simplify that
          journey.
        </p>

        <p>
          Our platform brings powerful AI tools together in one place so
          you can improve your resume, understand your skills, prepare for
          interviews, explore career opportunities, and create a clear path
          toward your professional goals.
        </p>

        <p>
          Whether you are preparing for your first job or planning your
          future career, StudentAI helps you take the next step with
          confidence.
        </p>
      </div>

      <div className="about-stats">
        <div className="stat-card">
          <FaRobot />
          <div>
            <h3>AI Powered</h3>
            <p>Smart career assistance</p>
          </div>
        </div>

        <div className="stat-card">
          <FaUsers />
          <div>
            <h3>For Students</h3>
            <p>Built for learners & freshers</p>
          </div>
        </div>

        <div className="stat-card">
          <FaRocket />
          <div>
            <h3>Career Focused</h3>
            <p>Practical tools for growth</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Features */}
  <section className="about-features">
    <div className="section-heading">
      <span>WHAT WE OFFER</span>
      <h2>Everything You Need to Grow Your Career</h2>
      <p>
        Powerful AI tools designed to help students prepare for the
        professional world.
      </p>
    </div>

    <div className="features-grid">
      {features.map((feature, index) => (
        <div className="feature-card" key={index}>
          <div className="feature-icon">{feature.icon}</div>

          <h3>{feature.title}</h3>

          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  </section>

  {/* Our Values */}
  <section className="about-values">
    <div className="section-heading">
      <span>OUR PURPOSE</span>
      <h2>Helping Students Move Forward</h2>
    </div>

    <div className="values-grid">
      {values.map((value, index) => (
        <div className="value-card" key={index}>
          <div className="value-icon">{value.icon}</div>

          <h3>{value.title}</h3>

          <p>{value.description}</p>
        </div>
      ))}
    </div>
  </section>

  {/* CTA */}
  <section className="about-cta">
    <div>
      <h2>Ready to Build Your Career?</h2>

      <p>
        Start exploring AI-powered tools and take the next step toward your
        professional future.
      </p>
    </div>

    <button>
        <Link to="/signup">Get Started </Link>
      
      <FaArrowRight />
    </button>
  </section>
</div>

);
};

export default About;
