// ============================================================
// FILE: lib/geminiClient.js
// ------------------------------------------------------------
// Handles all communication with Google Gemini API.
// Responsible for:
//   - Calling Gemini with the prompt
//   - Stripping markdown code fences if Gemini adds them
//   - Parsing and validating the JSON response
//   - Returning clean quiz data
//
// MODEL: gemini-1.5-flash — fast, cheap, good for structured output
// ============================================================

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Call Gemini and return parsed quiz JSON.
 * @param {string} prompt - The full prompt from promptBuilder
 * @returns {Promise<object>} Parsed quiz object
 * @throws {Error} If Gemini fails or returns invalid JSON
 */
async function callGemini(prompt) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        generationConfig: {
            // Force JSON-like output — temperature 0 = deterministic
            temperature: 0.3,
            maxOutputTokens: 2048,
        },
    });

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // Gemini sometimes wraps output in ```json ... ``` even when told not to.
    // Strip any markdown code fences before parsing.
    const cleaned = stripMarkdown(raw);

    // Parse and validate
    const parsed = JSON.parse(cleaned); // throws if invalid JSON
    validateQuizData(parsed);

    return parsed;
}

/**
 * Strip markdown code fences that Gemini may add despite instructions.
 * Handles: ```json ... ```, ``` ... ```, and leading/trailing whitespace.
 */
function stripMarkdown(text) {
    return text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
}

/**
 * Validate that the parsed object matches our expected quiz schema.
 * Throws descriptive errors so we know exactly what went wrong.
 */
function validateQuizData(data) {
    if (!data || typeof data !== "object") {
        throw new Error("Response is not a JSON object");
    }

    if (!Array.isArray(data.quizzes)) {
        throw new Error("Missing 'quizzes' array in response");
    }

    if (data.quizzes.length !== 5) {
        throw new Error(`Expected 5 quizzes, got ${data.quizzes.length}`);
    }

    data.quizzes.forEach((q, i) => {
        if (typeof q.question !== "string" || q.question.trim() === "") {
            throw new Error(`Quiz ${i}: missing or empty 'question'`);
        }
        if (!Array.isArray(q.answers) || q.answers.length !== 4) {
            throw new Error(`Quiz ${i}: 'answers' must be array of exactly 4`);
        }
        if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex > 3) {
            throw new Error(`Quiz ${i}: 'correctIndex' must be 0-3`);
        }
    });
}

module.exports = { callGemini };