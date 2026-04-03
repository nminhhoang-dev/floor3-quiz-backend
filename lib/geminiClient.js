// ============================================================
// FILE: lib/geminiClient.js
// ── UPDATED ────────────────────────────────────────────────
// Changes:
//   - Package: @google/generative-ai → @google/genai (new SDK)
//   - Model: gemini-1.5-flash → gemini-2.0-flash
//   - API call pattern updated to match new @google/genai SDK
// ============================================================

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Call Gemini and return parsed quiz JSON.
 * @param {string} prompt
 * @returns {Promise<object>} Parsed quiz object
 */
async function callGemini(prompt) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.3,
            maxOutputTokens: 2048,
        },
    });

    const raw = response.text;

    // Strip markdown code fences if Gemini adds them despite instructions
    const cleaned = stripMarkdown(raw);

    // Parse and validate
    const parsed = JSON.parse(cleaned);
    validateQuizData(parsed);

    return parsed;
}

function stripMarkdown(text) {
    return text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
}

function validateQuizData(data) {
    if (!data || typeof data !== "object")
        throw new Error("Response is not a JSON object");

    if (!Array.isArray(data.quizzes))
        throw new Error("Missing 'quizzes' array in response");

    if (data.quizzes.length !== 5)
        throw new Error(`Expected 5 quizzes, got ${data.quizzes.length}`);

    data.quizzes.forEach((q, i) => {
        if (typeof q.question !== "string" || q.question.trim() === "")
            throw new Error(`Quiz ${i}: missing or empty 'question'`);
        if (!Array.isArray(q.answers) || q.answers.length !== 4)
            throw new Error(`Quiz ${i}: 'answers' must be array of exactly 4`);
        if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex > 3)
            throw new Error(`Quiz ${i}: 'correctIndex' must be 0-3`);
    });
}

module.exports = { callGemini };