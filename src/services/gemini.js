import api from "../services/api";

/*
|--------------------------------------------------------------------------
| Error helper
|--------------------------------------------------------------------------
*/

function getErrorMessage(error, fallbackMessage) {
  const validationErrors = error.response?.data?.errors;

  if (validationErrors) {
    return Object.values(validationErrors)
      .flat()
      .join(" ");
  }

  return (
    error.response?.data?.message ||
    error.message ||
    fallbackMessage
  );
}

/*
|--------------------------------------------------------------------------
| Resume summary
|--------------------------------------------------------------------------
*/

export async function generateSummary(userData) {
  try {
    const response = await api.post("/ai/resume-summary", {
      full_name: userData?.fullName?.trim() || "",
      education: userData?.education?.trim() || "",
      skills: userData?.skills?.trim() || "",
      projects: userData?.projects?.trim() || "",
      experience: userData?.experience?.trim() || "",
    });

    return (
      response.data?.summary ||
      response.data?.result ||
      ""
    );
  } catch (error) {
    console.error(
      "Resume summary error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to generate resume summary."
      )
    );
  }
}

/*
|--------------------------------------------------------------------------
| Cover letter
|--------------------------------------------------------------------------
*/

export async function generateCoverLetter(data) {
  try {
    const payload = {
      company: data?.company?.trim() || "",
      role: data?.role?.trim() || "",
      details: data?.details?.trim() || "",
    };

    const response = await api.post(
      "/ai/cover-letter",
      payload
    );

    return (
      response.data?.cover_letter ||
      response.data?.result ||
      ""
    );
  } catch (error) {
    console.error(
      "Cover letter generation error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to generate cover letter."
      )
    );
  }
}

/*
|--------------------------------------------------------------------------
| Interview questions
|--------------------------------------------------------------------------
*/

export async function generateInterviewQuestions(role) {
  const cleanRole = String(role ?? "").trim();

  if (!cleanRole) {
    throw new Error("Please enter an interview role.");
  }

  try {
    const response = await api.post("/ai/interview-questions", {
      role: cleanRole,
    });

    const questions =
      response.data?.questions ??
      response.data?.result ??
      response.data?.data ??
      "";

    if (typeof questions !== "string" || !questions.trim()) {
      throw new Error(
        response.data?.message ||
          "No interview questions were received."
      );
    }

    return questions.trim();
  } catch (error) {
    console.error(
      "Interview questions error:",
      error.response?.data || error
    );

    const validationErrors = error.response?.data?.errors;

    if (validationErrors) {
      const validationMessage = Object.values(validationErrors)
        .flat()
        .join(" ");

      throw new Error(validationMessage);
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to generate interview questions."
    );
  }
}

/*
|--------------------------------------------------------------------------
| Interview answer evaluation
|--------------------------------------------------------------------------
*/

export async function evaluateInterviewAnswer(question, answer) {
  const cleanQuestion = String(question ?? "").trim();
  const cleanAnswer = String(answer ?? "").trim();

  if (!cleanQuestion) {
    throw new Error("Interview question is required.");
  }

  if (!cleanAnswer) {
    throw new Error("Please enter your answer.");
  }

  try {
    const response = await api.post("/ai/interview-feedback", {
      question: cleanQuestion,
      answer: cleanAnswer,
    });

    const feedback =
      response.data?.feedback ??
      response.data?.result ??
      response.data?.data ??
      "";

    if (typeof feedback !== "string" || !feedback.trim()) {
      throw new Error(
        response.data?.message ||
          "No interview feedback was received."
      );
    }

    return feedback.trim();
  } catch (error) {
    console.error(
      "Interview evaluation error:",
      error.response?.data || error
    );

    const validationErrors = error.response?.data?.errors;

    if (validationErrors) {
      const validationMessage = Object.values(validationErrors)
        .flat()
        .join(" ");

      throw new Error(validationMessage);
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to evaluate interview answer."
    );
  }
}
/*
|--------------------------------------------------------------------------
| ATS score
|--------------------------------------------------------------------------
*/

export async function checkATSScore(resumeData) {
  try {
    const response = await api.post("/ai/ats-score", {
      full_name: resumeData?.full_name || "",
      email: resumeData?.email || "",
      phone: resumeData?.phone || "",
      summary: resumeData?.summary || "",
      education: resumeData?.education || "",
      skills: resumeData?.skills || "",
      projects: resumeData?.projects || "",
      experience: resumeData?.experience || "",
    });

    return (
      response.data?.analysis ||
      response.data?.result ||
      ""
    );
  } catch (error) {
    console.error(
      "ATS score error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to check ATS score."
      )
    );
  }
}

/*
|--------------------------------------------------------------------------
| Improve resume
|--------------------------------------------------------------------------
*/

export async function improveResume(resumeData) {
  try {
    const response = await api.post(
      "/ai/improve-resume",
      {
        full_name: resumeData?.full_name || "",
        summary: resumeData?.summary || "",
        education: resumeData?.education || "",
        skills: resumeData?.skills || "",
        projects: resumeData?.projects || "",
        experience: resumeData?.experience || "",
      }
    );

    return (
      response.data?.improved_resume ||
      response.data?.result ||
      ""
    );
  } catch (error) {
    console.error(
      "Resume improvement error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to improve resume."
      )
    );
  }
}

/*
|--------------------------------------------------------------------------
| Job matcher
|--------------------------------------------------------------------------
*/

export async function matchJobDescription(
  resumeId,
  jobDescription
) {
  try {
    const cleanDescription = String(
      jobDescription || ""
    ).trim();

    const response = await api.post("/ai/job-match", {
      resume_id: Number(resumeId),
      job_description: cleanDescription,
    });

    return response.data;
  } catch (error) {
    console.error("Job Matcher Error:", {
      status: error.response?.status,
      data: error.response?.data,
      resumeId,
      jobDescriptionLength:
        jobDescription?.trim()?.length,
    });

    throw new Error(
      getErrorMessage(
        error,
        "Failed to match the job description."
      )
    );
  }
}

/*
|--------------------------------------------------------------------------
| Career roadmap
|--------------------------------------------------------------------------
*/

export async function generateCareerRoadmap(data) {
  try {
    const response = await api.post(
      "/ai/career-roadmap",
      {
        goal: data?.goal?.trim() || "",
        currentSkills:
          data?.currentSkills?.trim() || "",
        experience:
          data?.experience?.trim() || "",
      }
    );

    return (
      response.data?.roadmap ||
      response.data?.result ||
      ""
    );
  } catch (error) {
    console.error(
      "Career roadmap error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to generate roadmap."
      )
    );
  }
}