import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

export default function ResetPassword() {
  const navigate = useNavigate();

  const email = localStorage.getItem("reset_email") || "";
  const otp = localStorage.getItem("reset_otp") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email || !otp) {
      setError(
        "Password reset session missing hai. Dobara OTP verify karein."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password kam se kam 8 characters ka hona chahiye."
      );
      return;
    }

    if (password !== passwordConfirmation) {
      setError(
        "Password aur confirm password match nahi karte."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/forgot-password/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            password,
            password_confirmation: passwordConfirmation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const validationError =
          data.errors &&
          Object.values(data.errors)?.[0]?.[0];

        throw new Error(
          validationError ||
            data.message ||
            "Password reset nahi ho saka."
        );
      }

      setMessage(
        data.message ||
          "Password successfully reset ho gaya."
      );

      localStorage.removeItem("reset_email");
      localStorage.removeItem("reset_otp");

      setPassword("");
      setPasswordConfirmation("");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Password reset successful. Ab naye password se login karein.",
          },
        });
      }, 1500);
    } catch (err) {
      console.error(
        "Reset password error:",
        err
      );

      setError(
        err.message ||
          "Password reset nahi ho saka."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>

        <p className="text-muted">
          Apne account ke liye naya password set karein.
        </p>

        {email && (
          <p className="text-center">
            <strong>{email}</strong>
          </p>
        )}

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
              New Password
            </label>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                minLength={8}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <small className="text-muted">
              Minimum 8 characters
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Confirm Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Confirm new password"
              value={passwordConfirmation}
              onChange={(e) =>
                setPasswordConfirmation(
                  e.target.value
                )
              }
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/login">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}