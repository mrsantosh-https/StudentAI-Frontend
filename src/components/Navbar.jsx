import "../styles/main.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg student-navbar">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Student<span>AI</span>
          <img
              src="/Logo.png"
              alt="StudentAI Logo"
              className="sidebar-logo-img"
            />
        </Link>

        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav mx-auto gap-lg-3">
           <li className="nav-item">
            <Link className="nav-link" to="/">
              Home
            </Link>
          </li>
            <li className="nav-item"><a className="nav-link" href="features">Features</a></li>
            <li className="nav-item"><a className="nav-link" href="about">About</a></li>
          </ul>

          <div className="d-flex gap-2">
           <Link to="/login" className="btn login-btn">Login</Link>
          <Link to="/signup" className="btn start-btn">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}