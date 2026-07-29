import api from "../services/api";

export async function generateSummary(userData) {
  try {
    const prompt = `
Generate a professional resume summary.

Name: ${userData.fullName}
Education: ${userData.education}
Skills: ${userData.skills}
Projects: ${userData.projects}
Experience: ${userData.experience}

Return only the professional summary.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error(error);
    return "Failed to generate summary.";
  }
}

export async function generateCoverLetter(data) {
  try {
    const payload = {
      company: data?.company?.trim() || "",
      role: data?.role?.trim() || "",
      details: data?.details?.trim() || "",
    };

    console.log("Cover letter payload:", payload);

    const response = await api.post("/ai/cover-letter", payload);

    return response.data?.cover_letter || "";
  } catch (error) {
    console.error(
      "Cover letter generation error:",
      error.response?.data || error
    );

    const validationErrors = error.response?.data?.errors;

    if (validationErrors) {
      const message = Object.values(validationErrors)
        .flat()
        .join(" ");

      throw new Error(message);
    }

    throw new Error(
      error.response?.data?.message ||
        "Failed to generate cover letter."
    );
  }
}

export async function generateInterviewQuestions(role) {
  try {
    const prompt = `
Generate 5 technical interview questions for the role: ${role}.

Return only numbered questions.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error(error);
    return "Failed to generate interview questions.";
  }
}

export async function evaluateInterviewAnswer(question, answer) {
  try {
    const prompt = `
Evaluate this interview answer.

Question: ${question}

User Answer: ${answer}

Give feedback in this format:
1. Score out of 10
2. What is good
3. What can be improved
4. Better answer
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error(error);
    return "Failed to evaluate answer.";
  }
}

export async function checkATSScore(resumeData) {
  try {
    const prompt = `
Analyze this resume for ATS compatibility.

Resume:
Name: ${resumeData.full_name}
Email: ${resumeData.email}
Phone: ${resumeData.phone}
Summary: ${resumeData.summary}
Education: ${resumeData.education}
Skills: ${resumeData.skills}
Projects: ${resumeData.projects}
Experience: ${resumeData.experience}

Give result in this format:

ATS Score: __/100

Strengths:
-

Improvements:
-

Suggested Keywords:
-

Final Verdict:
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error(error);
    return "Failed to check ATS score.";
  }
}
export async function improveResume(resumeData) {
try {
  const prompt = `
You are an expert resume reviewer.

Improve the following resume.

Resume:

Name: ${resumeData.full_name}
Summary: ${resumeData.summary}
Education: ${resumeData.education}
Skills: ${resumeData.skills}
Projects: ${resumeData.projects}
Experience: ${resumeData.experience}

Return:

1. Improved Professional Summary

2. Skills to Add

3. Improvements

4. Final Advice
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
} catch (error) {
  console.error(error);
  return "Failed to improve resume.";
}
}

export async function matchJobDescription(resumeId, jobDescription) {
  try {
    const response = await api.post("/ai/job-match", {
      resume_id: Number(resumeId),
      job_description: jobDescription.trim(),
    });

    return response.data;
  } catch (error) {
    console.error("Job Matcher Error:", {
      status: error.response?.status,
      data: error.response?.data,
      resumeId,
      jobDescriptionLength: jobDescription?.trim()?.length,
    });

    throw error;
  }
}
export async function generateCareerRoadmap(data) {
  try {
    const response = await api.post("/ai/career-roadmap", {
      goal: data.goal,
      currentSkills: data.currentSkills,
      experience: data.experience,
    });

    return response.data.roadmap;
  } catch (error) {
    console.error(
      "Career roadmap error:",
      error.response?.data || error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to generate roadmap."
    );
  }
}