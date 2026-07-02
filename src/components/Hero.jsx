import "../styles/hero.css";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="row align-items-center">

          <div className="col-lg-6">
            <span className="hero-badge">
              🚀 AI Powered Learning Platform
            </span>

            <h1 className="hero-title">
              Build Your Career With
              <span> StudentAI</span>
            </h1>

            <p className="hero-text">
              Create ATS-friendly resumes, generate cover letters,
              practice AI interviews, summarize notes, and get your
              personalized learning roadmap—all in one place.
            </p>

            <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started
            </Link>
          </div>
          </div>

          <div className="col-lg-6 text-center">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700"
              alt="Student AI"
              className="hero-image img-fluid"
            />
          </div>

        </div>
      </div>

    </section>
  );
}