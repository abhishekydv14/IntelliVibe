const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to get the Gemini model configured for JSON output
const getJsonModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest", 
    generationConfig: {
      response_mime_type: "application/json",
    },
  });
};

// Helper function to get the Gemini model configured for plain text output
const getTextModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    generationConfig: {
      response_mime_type: "text/plain",
    },
  });
};

/**
 * Analyzes a resume against a job description using Gemini.
 * (This function is already correct and remains unchanged)
 */
   // Making the prompt more explicit to ask for an integer.
   const analyzeResume = async (resumeText, jobDetails) => {
    try {
      const model = getJsonModel();
   const prompt = `As an expert recruitment AI assistant, analyze the provided resume against the job requirements.

   Your response MUST be a valid JSON object with the following structure:
   {
     "matchScore": <An integer percentage value between 0 and 100>,
     "justification": "<A brief explanation (2-3 sentences) of the score>"
   }
   
   Analyze how well this candidate matches the job requirements. Consider:
   1. Relevant skills and technologies
   2. Years of experience
   3. Educational background
   4. Previous job roles and responsibilities
   
   Job Details:
   - Title: ${jobDetails.title}
   - Company: ${jobDetails.company}
   - Required Skills: ${jobDetails.skills?.join(', ') || 'Not specified'}
   - Description: ${jobDetails.description}
   - Experience Required: ${jobDetails.experienceLevel || 'Not specified'}
   
   Resume Text:
   ${resumeText}`;
   
       const result = await model.generateContent(prompt);
       const responseText = result.response.text();
       const parsedResult = JSON.parse(responseText);
       
       // Validate the response structure
       if (typeof parsedResult.matchScore !== 'number' || !parsedResult.justification) {
         throw new Error('Invalid response structure from AI.');
       }
       
       // --- START OF THE CRITICAL FIX ---
       let score = parsedResult.matchScore;
   
       // If the AI returns a ratio (e.g., 0.8), convert it to a percentage.
       if (score <= 1 && score > 0) {
           score = score * 100;
       }
       
       // Ensure the final score is a whole number and clamped between 0 and 100.
       parsedResult.matchScore = Math.round(Math.max(0, Math.min(100, score)));
       // --- END OF THE CRITICAL FIX ---
         
       return parsedResult;
   
     } catch (error) {
        console.error('Error in AI resume analysis:', error);
        if (error.message.includes('SAFETY')) {
            throw new Error('Failed to analyze resume: The content was blocked for safety reasons.');
        }
        throw new Error('Failed to analyze resume: ' + error.message);
    }
};

/**
 * Generates a full quiz for a specific job using Gemini, respecting difficulty.
 * @param {Object} jobDetails - The job posting details.
 * @param {Object} quizConfig - Configuration for the quiz, like difficulty.
 * @returns {Promise<Array>} Array of quiz questions.
 */
const generateQuizQuestions = async (jobDetails, quizConfig) => {
  try {
    const model = getJsonModel();

    // Calculate the total number of questions from the difficulty distribution
    const totalQuestions = quizConfig.difficultyDistribution.easy + 
                           quizConfig.difficultyDistribution.medium + 
                           quizConfig.difficultyDistribution.hard;

    // A much more advanced prompt that asks for everything your schema needs!
    const prompt = `As a technical interviewer, generate a quiz with exactly ${totalQuestions} multiple-choice questions to test a candidate for the given position.

The difficulty breakdown MUST be:
- Easy: ${quizConfig.difficultyDistribution.easy} questions
- Medium: ${quizConfig.difficultyDistribution.medium} questions
- Hard: ${quizConfig.difficultyDistribution.hard} questions

Your response MUST be a single valid JSON array. Each object in the array must have this exact structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0, // The index (0-3) of the correct option
  "explanation": "A brief explanation of why the answer is correct.",
  "difficulty": "medium", // Must be one of 'easy', 'medium', or 'hard'
  "skill": "React.js" // The primary skill being tested from the job requirements
}

Create challenging but fair technical questions that test practical knowledge of the required skills.

Job Title: ${jobDetails.title}
Required Skills: ${jobDetails.skills?.join(', ') || 'Not specified'}
Description: ${jobDetails.description}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const questions = JSON.parse(responseText);

    // Basic validation to ensure the AI returned the correct number of questions
    if (!Array.isArray(questions) || questions.length !== totalQuestions) {
        throw new Error(`AI generated ${questions.length} questions, but ${totalQuestions} were requested.`);
    }
    
    return questions;

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw new Error('Failed to generate quiz questions: ' + error.message);
  }
};

/**
 * Generates a job description using Gemini based on job details.
 * @param {Object} jobDetails - The job posting details (title, companyName, skills, location, etc.)
 * @returns {Promise<string>} The generated job description.
 */
const generateJobDescription = async (jobDetails) => {
  try {
    const model = getTextModel();
    const prompt = `You are an expert HR assistant. Write a compelling, clear, and attractive job description for the following job posting. Use a professional tone, highlight the company, required skills, and location. The description should be a single, well-written paragraph of at least 100 words. Do NOT return JSON or any structured data, just the paragraph text.\n\nJob Title: ${jobDetails.title}\nCompany: ${jobDetails.companyName}\nSkills: ${jobDetails.skills}\nLocation: ${jobDetails.location}\n`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    console.error('Error generating job description:', error);
    throw new Error('Failed to generate job description: ' + error.message);
  }
};

module.exports = {
  analyzeResume,
  generateQuizQuestions,
  generateJobDescription,
};