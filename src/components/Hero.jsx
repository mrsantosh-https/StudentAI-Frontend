import "../styles/hero.css";
import { Link } from "react-router-dom";

export default function Hero() {
return ( <section
   className="hero"
   aria-labelledby="hero-title"
 > <div className="container"> <div className="row align-items-center">

      {/* Hero Content */}
      <div className="col-lg-6">

        <span className="hero-badge">
          🚀 AI-Powered Career & Learning Platform
        </span>

        <h1
          id="hero-title"
          className="hero-title"
        >
          Build Your Career with AI Using
          <span> StudentAI</span>
        </h1>

        <p className="hero-text">
          StudentAI helps students create ATS-friendly resumes,
          generate professional cover letters, practice AI-powered
          interviews, summarize notes, and build personalized
          career and learning roadmaps—all in one place.
        </p>

        <div className="hero-buttons">

          <Link
            to="/signup"
            className="btn btn-primary btn-lg"
            aria-label="Get started with StudentAI"
          >
            Get Started Free
          </Link>

        </div>

      </div>

      {/* Hero Image */}
      <div className="col-lg-6 text-center">

        <img
          src="/Logo.png"
          alt="StudentAI AI-powered career and learning platform"
          className="hero-image img-fluid"
          width="600"
          height="600"
          loading="eager"
          fetchPriority="high"
        />

      </div>

    </div>
  </div>
</section>


);
}
