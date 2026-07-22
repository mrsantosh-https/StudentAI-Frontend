import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyOtp() {
  const navigate = useNavigate();

  const email = localStorage.getItem("reset_email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/forgot-password/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verify failed.");
      }

      setMessage(data.message);

      localStorage.setItem("reset_otp", otp);

      setTimeout(() => {
        navigate("/reset-password");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/forgot-password/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage("New OTP sent successfully.");
      setTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h2>Verify OTP</h2>

        <p className="text-muted">
          OTP sent to
          <br />
          <strong>{email}</strong>
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

        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label className="form-label">
              Enter 6 Digit OTP
            </label>

            <input
              type="text"
              className="form-control text-center"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              required
            />
          </div>

          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-3">

          {timer > 0 ? (
            <p className="otp-timer">
                Resend OTP in <strong>{timer}s</strong>
                </p>
          ) : (
            <button
              className="btn btn-link"
              onClick={resendOtp}
              disabled={resending}
            >
              {resending
                ? "Sending..."
                : "Resend OTP"}
            </button>
          )}

        </div>

        <div className="text-center mt-3">
          <Link to="/forgot-password">
            ← Back
          </Link>
        </div>

      </div>
    </div>
  );
}