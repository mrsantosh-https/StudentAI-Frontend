export default function FAQSchema() {
  const faqData = {
    "@context": "https://schema.org",

    "@type": "FAQPage",

    mainEntity: [
      {
        "@type": "Question",

        name:
          "What is StudentAI?",

        acceptedAnswer: {
          "@type": "Answer",

          text:
            "StudentAI is an AI-powered career platform that helps students create resumes, generate cover letters, prepare for interviews, and plan their careers.",
        },
      },

      {
        "@type": "Question",

        name:
          "Can StudentAI help create an ATS-friendly resume?",

        acceptedAnswer: {
          "@type": "Answer",

          text:
            "Yes. StudentAI provides tools that help students build professional resumes designed to be ATS-friendly.",
        },
      },

      {
        "@type": "Question",

        name:
          "Does StudentAI provide AI interview preparation?",

        acceptedAnswer: {
          "@type": "Answer",

          text:
            "Yes. StudentAI provides AI-powered interview practice and feedback to help students improve their interview skills.",
        },
      },

      {
        "@type": "Question",

        name:
          "What career tools are available in StudentAI?",

        acceptedAnswer: {
          "@type": "Answer",

          text:
            "StudentAI includes tools such as an AI Resume Builder, Cover Letter Generator, AI Interview Practice, Career Roadmap, and Job Application Tracker.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData),
      }}
    />
  );
}