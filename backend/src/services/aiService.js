const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using gemini-flash-latest which is confirmed to be available and working
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * Generates structured tasks based on a prompt
 */
const generateTasks = async (prompt) => {
  const fullPrompt = `
    You are an expert project manager. I need you to create a list of structured tasks for a MERN stack application based on the following request: "${prompt}".
    Return ONLY a JSON array of objects. Each object MUST have:
    - title (string)
    - description (string)
    - priority ("Low", "Medium", "High")
    - status ("Todo")
    - suggestedDeadline (ISO date string, assume today is ${new Date().toISOString()})
    
    Do not include any markdown formatting or extra text.
  `;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown from response
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) {
      console.log('No JSON array found in AI response:', text);
      return [];
    }
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('AI generateTasks Error:', err);
    throw err;
  }
};

/**
 * Generates a summary based on provided project data
 */
const generateSummary = async (projectData) => {
  const fullPrompt = `
    Analyze the following project data and provide a concise, professional summary of progress.
    Data: ${JSON.stringify(projectData)}
    
    Include:
    1. Completion status
    2. Any blockers or overdue items
    3. Suggested next steps
    
    Return the response in a clean, readable format.
  `;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('AI generateSummary Error:', err);
    throw err;
  }
};

/**
 * Converts natural language search to MongoDB query filters
 */
const convertNLToQuery = async (query) => {
  const fullPrompt = `
    Convert the following natural language task search request into a JSON object representing MongoDB query filters for a "Task" model.
    Request: "${query}"
    
    Available fields:
    - title (string)
    - priority (enum: "Low", "Medium", "High")
    - status (enum: "To Do", "In Progress", "Completed")
    
    Example: "High priority bugs" -> {"priority": "High", "title": {"$regex": "bug", "$options": "i"}}
    Return ONLY the raw JSON object. No markdown.
  `;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{.*\}/s);
    if (!jsonMatch) {
      console.log('No JSON object found in AI response:', text);
      return {};
    }
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('AI convertNLToQuery Error:', err);
    throw err;
  }
};

module.exports = {
  generateTasks,
  generateSummary,
  convertNLToQuery
};
