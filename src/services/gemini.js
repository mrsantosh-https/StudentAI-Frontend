import api from "../services/api";

/*
|--------------------------------------------------------------------------
| Error Helper
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
| Resume Summary
|--------------------------------------------------------------------------
*/

export async function generateSummary(userData) {
  try {
    const response = await api.post(
      "/ai/resume-summary",
      {
        fullName: userData?.fullName?.trim() || "",
        education: userData?.education?.trim() || "",
        skills: userData?.skills?.trim() || "",
        projects: userData?.projects?.trim() || "",
        experience: userData?.experience?.trim() || "",
      }
    );

    const summary =
      response.data?.summary ||
      response.data?.result ||
      "";

    if (!summary) {
      throw new Error(
        response.data?.message ||
          "No resume summary received."
      );
    }

    return summary;
  } catch (error) {
    console.error(
      "Resume summary error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to generate resume summary."
      ),
      {
        cause: error,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Cover Letter
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

    const coverLetter =
      response.data?.cover_letter ||
      response.data?.result ||
      "";

    if (!coverLetter) {
      throw new Error(
        response.data?.message ||
          "No cover letter received."
      );
    }

    return coverLetter;
  } catch (error) {
    console.error(
      "Cover letter generation error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to generate cover letter."
      ),
      {
        cause: error,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Interview Questions
|--------------------------------------------------------------------------
*/

export async function generateInterviewQuestions(role) {
  const cleanRole = String(role ?? "").trim();

  if (!cleanRole) {
    throw new Error(
      "Please enter an interview role."
    );
  }

  try {
    const response = await api.post(
      "/ai/interview-questions",
      {
        role: cleanRole,
      }
    );

    const questions =
      response.data?.questions ??
      response.data?.result ??
      response.data?.data ??
      "";

    if (
      typeof questions !== "string" ||
      !questions.trim()
    ) {
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

    throw new Error(
      getErrorMessage(
        error,
        "Failed to generate interview questions."
      ),
      {
        cause: error,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Interview Answer Evaluation
|--------------------------------------------------------------------------
*/

export async function evaluateInterviewAnswer(
  question,
  answer
) {
  const cleanQuestion = String(question ?? "").trim();
  const cleanAnswer = String(answer ?? "").trim();

  if (!cleanQuestion) {
    throw new Error(
      "Interview question is required."
    );
  }

  if (!cleanAnswer) {
    throw new Error(
      "Please enter your answer."
    );
  }

  try {
    const response = await api.post(
      "/ai/interview-feedback",
      {
        question: cleanQuestion,
        answer: cleanAnswer,
      }
    );

    const feedback =
      response.data?.feedback ??
      response.data?.result ??
      response.data?.data ??
      "";

    if (
      typeof feedback !== "string" ||
      !feedback.trim()
    ) {
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

    throw new Error(
      getErrorMessage(
        error,
        "Failed to evaluate interview answer."
      ),
      {
        cause: error,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Resume Analysis / ATS Score
|--------------------------------------------------------------------------
*/

export async function checkATSScore(resumeId) {
  const parsedResumeId = Number(resumeId);

  if (
    !Number.isInteger(parsedResumeId) ||
    parsedResumeId <= 0
  ) {
    throw new Error(
      "Valid resume ID is required."
    );
  }

  try {
    const response = await api.post(
      `/resumes/${parsedResumeId}/analyze`
    );

    const analysis =
      response.data?.analysis ||
      response.data?.result ||
      response.data?.data ||
      null;

    if (!analysis) {
      throw new Error(
        response.data?.message ||
          "No ATS analysis received."
      );
    }

    return analysis;
  } catch (error) {
    console.error(
      "ATS score error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to check ATS score."
      ),
      {
        cause: error,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Improve Resume
|--------------------------------------------------------------------------
*/

export async function improveResume(resumeId) {
  const parsedResumeId = Number(resumeId);

  if (
    !Number.isInteger(parsedResumeId) ||
    parsedResumeId <= 0
  ) {
    throw new Error(
      "Valid resume ID is required."
    );
  }

  try {
    const response = await api.post(
      `/resumes/${parsedResumeId}/improve`
    );

    const improvedResume =
      response.data?.improved_resume ||
      response.data?.result ||
      response.data?.data ||
      null;

    if (!improvedResume) {
      throw new Error(
        response.data?.message ||
          "No improved resume received."
      );
    }

    return improvedResume;
  } catch (error) {
    console.error(
      "Resume improvement error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to improve resume."
      ),
      {
        cause: error,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Job / JD Matcher
|--------------------------------------------------------------------------
*/

export async function matchJobDescription(
  resumeId,
  jobDescription
) {
  const parsedResumeId = Number(resumeId);

  const cleanDescription = String(
    jobDescription ?? ""
  ).trim();

  if (
    !Number.isInteger(parsedResumeId) ||
    parsedResumeId <= 0
  ) {
    throw new Error(
      "Please select a valid resume."
    );
  }

  if (cleanDescription.length < 20) {
    throw new Error(
      "Job description must be at least 20 characters."
    );
  }

  try {
    const payload = {
      resume_id: parsedResumeId,
      job_description: cleanDescription,
    };

    console.log(
      "Job Matcher Payload:",
      payload
    );

    const response = await api.post(
      "/ai/job-match",
      payload
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Job matching failed."
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      "Job Matcher Error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to match the job description."
      ),
      {
        cause: error,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Career Roadmap
|--------------------------------------------------------------------------
*/

export async function generateCareerRoadmap(data) {
  const goal = data?.goal?.trim() || "";

  const currentSkills =
    data?.currentSkills?.trim() || "";

  const experience =
    data?.experience?.trim() || "";

  if (!goal) {
    throw new Error(
      "Career goal is required."
    );
  }

  if (!currentSkills) {
    throw new Error(
      "Current skills are required."
    );
  }

  if (!experience) {
    throw new Error(
      "Experience is required."
    );
  }

  try {
    const response = await api.post(
      "/ai/career-roadmap",
      {
        goal,
        currentSkills,
        experience,
      }
    );

    const roadmap =
      response.data?.roadmap ||
      response.data?.result ||
      "";

    if (!roadmap) {
      throw new Error(
        response.data?.message ||
          "No career roadmap received."
      );
    }

    return roadmap;
  } catch (error) {
    console.error(
      "Career roadmap error:",
      error.response?.data || error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to generate roadmap."
      ),
      {
        cause: error,
      }
    );
  }
}