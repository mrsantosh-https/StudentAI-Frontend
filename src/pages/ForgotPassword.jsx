import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/forgot-password/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.errors?.email?.[0] ||
            "OTP not sent."
        );
      }

      setMessage(data.message);

      // Email ko next page ke liye save karo
      localStorage.setItem("reset_email", email);

      // 2 second baad OTP page
      setTimeout(() => {
        navigate("/verify-otp");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h2 className="mb-2">Forgot Password</h2>
        <p className="text-muted">
        Enter Registered email .
        </p>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Email Address
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/login">
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}