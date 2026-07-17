import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Login() {
  const { fetchUser } = useUser();                              
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();

      try {
        const response = await api.post("/login", {
          email,
          password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        await fetchUser();
        toast.success("Login Successful 🎉");

        
        navigate("/dashboard");
      } catch (error) {
        console.error(error);
        
        toast.error("Invalid Email or Password");
      }
    };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <form onSubmit={handleLogin} className="card shadow border-0 p-4">
            <h2 className="text-center mb-4">Login</h2>

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
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>

            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>

            <p className="text-center mt-3">
              Don&apos;t have an account? <Link to="/signup">Signup</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}