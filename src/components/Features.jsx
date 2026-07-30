import "../styles/features.css";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "🤖",
    title: "AI Resume Builder",
    text: "Create ATS-friendly resumes in minutes."
  },
  {
    icon: "📝",
    title: "AI Cover Letter",
    text: "Generate personalized cover letters instantly."
  },
  {
    icon: "🎤",
    title: "Mock Interview",
    text: "Practice interviews with AI feedback."
  },
  {
    icon: "🧠",
    title: "Notes Summarizer",
    text: "Convert long notes into smart summaries."
  },
  {
    icon: "🗺",
    title: "Career Roadmap",
    text: "Get a personalized learning roadmap."
  },
  {
    icon: "📊",
    title: "ATS Resume Score",
    text: "Check how your resume performs."
  }
  
];

export default function Features() {
  const navigate = useNavigate();
  return (
    <section className="features py-5">
      <div className="container">

        <h2 className="text-center mb-5">
          Everything You Need to Get Hired
        </h2>

        <div className="row">

          {features.map((item, index) => (
            <div className="col-lg-4 col-md-6 mb-4" key={index} 
             onClick={() => navigate("/login")}
              style={{ cursor: "pointer" }}>
              <div className="feature-card">

                <div className="feature-icon">
                  {item.icon}
                </div>

                <h4>{item.title}</h4>

                <p>{item.text}</p>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}