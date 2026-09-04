const SITE_URL =
  import.meta.env.VITE_SITE_URL || "http://localhost:5173";

export default function StructuredData() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",

      name: "StudentAI",

      url: SITE_URL,

      logo: `${SITE_URL}/studentai-logo.png`,

      description:
        "StudentAI is an AI-powered career platform that helps students build resumes, prepare for interviews, generate cover letters, and grow their careers.",
    },

    {
      "@context": "https://schema.org",
      "@type": "WebSite",

      name: "StudentAI",

      url: SITE_URL,

      description:
        "AI-powered career tools for students.",
    },
  ];

  return (
    <>
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data),
          }}
        />
      ))}
    </>
  );
}