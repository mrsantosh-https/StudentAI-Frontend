import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import SEO from "../components/SEO";

import api from "../services/api";
import toast from "react-hot-toast";

import "../styles/contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Handle Input Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Submit Contact Form
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      console.log(
        "Contact Form Data:",
        formData
      );

      const response = await api.post(
        "/contact",
        formData
      );

      console.log(
        "Contact Response:",
        response.data
      );

      toast.success(
        response.data?.message ||
          "Your message has been sent successfully!"
      );

      /*
      |--------------------------------------------------------------------------
      | Reset Form
      |--------------------------------------------------------------------------
      */

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      console.error(
        "Contact form error:",
        error.response?.data || error
      );

      /*
      |--------------------------------------------------------------------------
      | Laravel Validation Errors
      |--------------------------------------------------------------------------
      */

      if (error.response?.data?.errors) {
        const errors =
          error.response.data.errors;

        const firstError =
          Object.values(errors)[0]?.[0];

        toast.error(
          firstError ||
            "Please check your form fields."
        );

      } else {
        toast.error(
          error.response?.data?.message ||
            "Message could not be sent. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}

      <Sidebar />


      {/* Main Dashboard */}

      <main className="dashboard-main">

        {/* Topbar */}

        <Topbar />


        {/* SEO */}

        <SEO
          title="Contact Us - StudentAI"
          description="Contact the StudentAI team for support, feedback and assistance."
        />


        {/* Page Content */}

        <div className="dashboard-content">

          <section className="contact-section">

            <div className="container-fluid">

              {/* Hero */}

              <div className="contact-hero text-center mb-5">

                <span className="contact-badge">
                  CONTACT STUDENTAI
                </span>

                <h1>
                  We're Here to Help You
                  <span> 🚀</span>
                </h1>

                <p className="contact-description">
                  Have a question, feedback, or need help
                  with StudentAI? Send us a message and
                  our team will get back to you.
                </p>

              </div>


              {/* Main Content */}

              <div className="row g-4 align-items-stretch">

                {/* Contact Information */}

                <div className="col-lg-5">

                  <div className="contact-info-card">

                    <div className="contact-card-glow" />

                    <h3>
                      Get in Touch
                    </h3>

                    <p className="contact-info-description">
                      StudentAI is built to help students
                      improve their careers with powerful
                      AI-powered tools.
                    </p>


                    {/* Email */}

                    <div className="contact-info-item">

                      <div className="contact-icon">
                        📧
                      </div>

                      <div>

                        <h6>
                          Email Us
                        </h6>

                        <p>
                          smartaistudentai@gmail.com
                        </p>

                      </div>

                    </div>


                    {/* Support */}

                    <div className="contact-info-item">

                      <div className="contact-icon">
                        💬
                      </div>

                      <div>

                        <h6>
                          Feedback & Support
                        </h6>

                        <p>
                          Share your feedback or report
                          any issue with StudentAI.
                        </p>

                      </div>

                    </div>


                    {/* AI */}

                    <div className="contact-info-item">

                      <div className="contact-icon">
                        🤖
                      </div>

                      <div>

                        <h6>
                          AI Career Assistance
                        </h6>

                        <p>
                          Get help with resumes,
                          interviews, cover letters
                          and career planning.
                        </p>

                      </div>

                    </div>


                    {/* Bottom */}

                    <div className="contact-info-bottom">

                      <span className="ai-status-dot" />

                      <div>

                        <h5>
                          Build Your Career with AI
                        </h5>

                        <p>
                          Smart tools designed to help
                          students prepare for their
                          future.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>


                {/* Contact Form */}

                <div className="col-lg-7">

                  <div className="contact-form-card">

                    <div className="contact-form-header">

                      <span>
                        SEND A MESSAGE
                      </span>

                      <h3>
                        How Can We Help?
                      </h3>

                      <p>
                        Fill out the form below and our
                        team will review your message.
                      </p>

                    </div>


                    <form onSubmit={handleSubmit}>

                      <div className="row">

                        {/* Name */}

                        <div className="col-md-6 mb-4">

                          <label>
                            Your Name
                          </label>

                          <input
                            type="text"
                            name="name"
                            className="contact-input"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                            required
                          />

                        </div>


                        {/* Email */}

                        <div className="col-md-6 mb-4">

                          <label>
                            Email Address
                          </label>

                          <input
                            type="email"
                            name="email"
                            className="contact-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            required
                          />

                        </div>

                      </div>


                      {/* Subject */}

                      <div className="mb-4">

                        <label>
                          Subject
                        </label>

                        <input
                          type="text"
                          name="subject"
                          className="contact-input"
                          placeholder="What is this about?"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />

                      </div>


                      {/* Message */}

                      <div className="mb-4">

                        <label>
                          Message
                        </label>

                        <textarea
                          name="message"
                          className="contact-input contact-textarea"
                          rows="6"
                          placeholder="Tell us how we can help..."
                          value={formData.message}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />

                      </div>


                      {/* Submit */}

                      <button
                        type="submit"
                        className="contact-submit-btn"
                        disabled={loading}
                      >

                        {loading
                          ? "Sending Message..."
                          : "Send Message 🚀"}

                      </button>

                    </form>

                  </div>

                </div>

              </div>


              {/* Features */}

              <div className="row g-4 mt-4">

                <div className="col-md-4">

                  <div className="contact-feature-card">

                    <div className="contact-feature-icon">
                      ⚡
                    </div>

                    <h5>
                      Fast Support
                    </h5>

                    <p>
                      We value your questions and
                      feedback.
                    </p>

                  </div>

                </div>


                <div className="col-md-4">

                  <div className="contact-feature-card">

                    <div className="contact-feature-icon">
                      🔒
                    </div>

                    <h5>
                      Your Privacy Matters
                    </h5>

                    <p>
                      Your information is handled
                      securely.
                    </p>

                  </div>

                </div>


                <div className="col-md-4">

                  <div className="contact-feature-card">

                    <div className="contact-feature-icon">
                      🎓
                    </div>

                    <h5>
                      Built for Students
                    </h5>

                    <p>
                      Smart career tools designed
                      for your future.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}