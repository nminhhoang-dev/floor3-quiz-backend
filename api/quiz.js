// ============================================================
// FILE: api/quiz.js
// ------------------------------------------------------------
// Vercel Serverless Function — the single endpoint Unity calls.
//
// ENDPOINT:  POST /api/quiz
// REQUEST:   { "topic": "technology" | "biology" | "ethics" }
// RESPONSE:  { "topic": "...", "quizzes": [...], "source": "gemini"|"fallback" }
//
// FLOW:
//   1. Validate request method and topic
//   2. Set CORS headers (Unity WebGL needs this)
//   3. Build prompt from topic
//   4. Call Gemini with 8-second timeout
//   5. If Gemini fails → return backend fallback
//   6. Return JSON to Unity
//
// TIMEOUT STRATEGY:
//   We use Promise.race() between the Gemini call and a timer.
//   Vercel has a max of 10s for free tier — we use 8s internally
//   so Unity's 3s timeout fires first if needed.
// ============================================================

const { buildPrompt } = require("../lib/promptBuilder");
const { callGemini } = require("../lib/geminiClient");

const VALID_TOPICS = ["technology", "biology", "ethics"];
const GEMINI_TIMEOUT_MS = 10000; 

module.exports = async function handler(req, res) {
    // ── CORS Headers (required for Unity WebGL builds) ────────────
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Pre-flight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // ── Method check ──────────────────────────────────────────────
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    // ── Parse and validate topic ──────────────────────────────────
    const { topic } = req.body || {};

    if (!topic || !VALID_TOPICS.includes(topic)) {
        return res.status(400).json({
            error: `Invalid topic. Must be one of: ${VALID_TOPICS.join(", ")}`,
        });
    }

    console.log(`[Quiz API] Request received — topic: ${topic}`);

    // ── Build prompt ──────────────────────────────────────────────
    let prompt;
    try {
        prompt = buildPrompt(topic);
    } catch (err) {
        console.error("[Quiz API] Prompt build error:", err.message);
        return res.status(500).json({ error: "Failed to build prompt" });
    }

    // ── Call Gemini with timeout ───────────────────────────────────
    // api/quiz.js — bỏ fallback, trả 500 thẳng khi Gemini fail
    try {
        const quizData = await Promise.race([
            callGemini(prompt),
            timeoutReject(GEMINI_TIMEOUT_MS, "Gemini API timeout"),
        ]);
    
        quizData.source = "gemini";
        console.log(`[Quiz API] Gemini success — ${quizData.quizzes.length} quizzes returned.`);
        return res.status(200).json(quizData);
    
    } catch (err) {
        // Trả 500 thẳng — Unity nhận error → MockQuizGenerator tự kick in
        console.error(`[Quiz API] Gemini failed: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

// ── Helper: create a promise that rejects after N ms ──────────
function timeoutReject(ms, message) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error(message)), ms)
    );
}
