import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import api from "../services/api";
import "../styles/login.css";

export default function Login() {
  const { fetchUser,setUser } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", {
        email: email.trim(),
        password,
      });

      const token = response.data.token;
      const user = response.data.user;

      if (!token ||!user) {
        toast.error("Login response invalid");
        return;
      }

      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      await fetchUser();

      toast.success("Login Successful 🎉");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data || error);

      toast.error(
        error.response?.data?.message || "Invalid Email or Password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin} className="login-card">
        <h2>Welcome Back</h2>

        <p className="login-subtitle">
          Apne StudentAI account me login karein.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control mb-3"
          placeholder="Email address"
          autoComplete="email"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control mb-3"
          placeholder="Password"
          autoComplete="current-password"
          required
        />

        <div className="login-options">
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="signup-text">
          Don&apos;t have an account?{" "}
          <Link to="/signup">Signup</Link>
        </p>
      </form>
    </div>
  );
}