import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "../styles/signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.name.trim().length < 3) {
      toast.error("Name kam se kam 3 characters ka hona chahiye.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password kam se kam 8 characters ka hona chahiye.");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Password aur confirm password match nahi karte.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      toast.success("Account Created Successfully 🎉");

      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      console.error(
        "Signup error:",
        error.response?.data || error
      );

      if (error.response?.status === 422) {
        const validationErrors =
          error.response?.data?.errors || {};

        const firstError = Object.values(validationErrors)
          .flat()
          .find(Boolean);

        toast.error(
          firstError ||
            error.response?.data?.message ||
            "Please check your details."
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Account create nahi ho saka."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <form
        onSubmit={handleSignup}
        className="signup-card"
      >
        <div className="signup-header">
          <div className="signup-logo">StudentAI</div>

          <h2>Create Account</h2>

          <p>
            StudentAI join karein aur apni career journey
            start karein.
          </p>
        </div>

        <div className="signup-field">
          <label htmlFor="name">
            Full Name
          </label>

          <input
            id="name"
            type="text"
            name="name"
            className="form-control"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            minLength={3}
            disabled={loading}
            required
          />
        </div>

        <div className="signup-field">
          <label htmlFor="email">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            name="email"
            className="form-control"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={loading}
            required
          />
        </div>

        <div className="signup-field">
          <label htmlFor="password">
            Password
          </label>

          <div className="signup-password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              disabled={loading}
              required
            />

            <button
              type="button"
              className="signup-password-toggle"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
              disabled={loading}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <small>
            Minimum 8 characters
          </small>
        </div>

        <div className="signup-field">
          <label htmlFor="password_confirmation">
            Confirm Password
          </label>

          <input
            id="password_confirmation"
            type={showPassword ? "text" : "password"}
            name="password_confirmation"
            className="form-control"
            placeholder="Confirm your password"
            value={formData.password_confirmation}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            disabled={loading}
            required
          />

          {formData.password_confirmation &&
            formData.password !==
              formData.password_confirmation && (
              <small className="signup-error-text">
                Passwords match nahi karte.
              </small>
            )}
        </div>

        <button
          type="submit"
          className="signup-submit-btn"
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

        <p className="signup-login-text">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}