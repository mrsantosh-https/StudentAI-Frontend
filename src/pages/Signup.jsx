import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await api.post("/register", formData);

      toast.success("Account Created Successfully 🎉");
      setTimeout(() => {
      navigate("/login");
    }, 1000);
    } catch (error) {
  console.error(error);

  if (error.response?.status === 422) {
    const errors = error.response.data.errors;

    Object.values(errors).forEach((messages) => {
      toast.error(messages[0]);
    });

    return;
  }

  toast.error("Something went wrong!");
}
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <form
            onSubmit={handleSignup}
            className="card shadow border-0 p-4"
          >
            <h2 className="text-center mb-4">
              Create Account
            </h2>

            <input
              type="text"
              name="name"
              autoComplete="name"
              className="form-control mb-3"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              autoComplete="email"
              className="form-control mb-3"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              autoComplete="password"
              className="form-control mb-3"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
          
            />
          
            <input
              type="password"
              name="password_confirmation"
              className="form-control mb-3"
              placeholder="Confirm Password"
              value={formData.password_confirmation}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              className="btn btn-primary w-100"
            >
              Signup
            </button>

            <p className="text-center mt-3">
              Already have an account?{" "}
              <Link to="/login">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}