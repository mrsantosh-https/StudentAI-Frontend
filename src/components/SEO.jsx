import { Helmet } from "react-helmet-async";

export default function SEO({
  title = "StudentAI - AI Career & Learning Platform",
  description = "StudentAI helps students build ATS-friendly resumes, generate cover letters, prepare for interviews, and grow their careers with AI.",
  keywords = "Student AI, AI Resume Builder, ATS Resume, Cover Letter Generator, AI Interview, Career Roadmap, Job Tracker",
  image = "/studentai-logo.png",
  url = "https://yourdomain.com",
}) {
  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />

      <meta name="keywords" content={keywords} />

      <meta name="robots" content="index, follow" />

      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />

      <meta property="og:title" content={title} />

      <meta
        property="og:description"
        content={description}
      />

      <meta property="og:image" content={image} />

      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta name="twitter:title" content={title} />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}