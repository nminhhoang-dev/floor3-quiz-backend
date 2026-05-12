// ============================================================
// FILE: api/quiz.js
// ------------------------------------------------------------
// DEBUG VERSION — helps verify:
//   1. Which Vercel deployment is running
//   2. Whether Unity is calling the correct backend
//   3. Whether backend fallback still exists
//   4. Whether Gemini actually succeeds/fails
// ============================================================

const { buildPrompt } = require("../lib/promptBuilder");
const { callGemini } = require("../lib/geminiClient");

const VALID_TOPICS = ["technology", "biology", "ethics"];
const GEMINI_TIMEOUT_MS = 10000;

// Unique build marker — change this every deploy
const BUILD_ID = "DEBUG_BUILD_V2";

module.exports = async function handler(req, res) {

    // ── GLOBAL DEBUG LOG ───────────────────────────────────────
    console.log("==================================================");
    console.log(`[Quiz API] BUILD RUNNING: ${BUILD_ID}`);
    console.log(`[Quiz API] Timestamp: ${new Date().toISOString()}`);
    console.log(`[Quiz API] Method: ${req.method}`);
    console.log(`[Quiz API] URL: ${req.url}`);
    console.log("==================================================");

    // ── CORS Headers ───────────────────────────────────────────
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // ── QUICK DEPLOY TEST ──────────────────────────────────────
    // Uncomment this temporarily to verify Unity is hitting THIS backend.
    /*
    return res.status(200).json({
        debug: true,
        build: BUILD_ID,
        timestamp: Date.now(),
        message: "Unity is connected to THIS backend."
    });
    */

    // ── OPTIONS Request ────────────────────────────────────────
    if (req.method === "OPTIONS") {
        console.log("[Quiz API] OPTIONS request.");
        return res.status(200).end();
    }

    // ── Method Check ───────────────────────────────────────────
    if (req.method !== "POST") {
        console.warn(`[Quiz API] Invalid method: ${req.method}`);

        return res.status(405).json({
            error: "Method not allowed. Use POST.",
            build: BUILD_ID
        });
    }

    // ── Validate Topic ─────────────────────────────────────────
    const { topic } = req.body || {};

    console.log(`[Quiz API] Request body topic: ${topic}`);

    if (!topic || !VALID_TOPICS.includes(topic)) {

        console.warn(`[Quiz API] Invalid topic received: ${topic}`);

        return res.status(400).json({
            error: `Invalid topic. Must be one of: ${VALID_TOPICS.join(", ")}`,
            build: BUILD_ID
        });
    }

    // ── Build Prompt ───────────────────────────────────────────
    let prompt;

    try {
        prompt = buildPrompt(topic);

        console.log(`[Quiz API] Prompt built successfully.`);
        console.log(`[Quiz API] Prompt length: ${prompt.length} chars`);

    } catch (err) {

        console.error("[Quiz API] Prompt build error:", err);

        return res.status(500).json({
            error: "Failed to build prompt",
            build: BUILD_ID
        });
    }

    // ── Call Gemini ────────────────────────────────────────────
    try {

        console.log("[Quiz API] Calling Gemini...");

        const quizData = await Promise.race([
            callGemini(prompt),
            timeoutReject(GEMINI_TIMEOUT_MS, "Gemini API timeout"),
        ]);

        console.log("[Quiz API] Gemini returned successfully.");

        // Debug quiz structure
        console.log(`[Quiz API] Quiz topic: ${quizData.topic}`);
        console.log(`[Quiz API] Quiz count: ${quizData.quizzes?.length}`);

        // IMPORTANT:
        // If you EVER see source=fallback here,
        // then Gemini itself or old backend code produced it.
        console.log(`[Quiz API] Incoming source field BEFORE overwrite: ${quizData.source}`);

        quizData.source = "gemini";
        quizData.build  = BUILD_ID;

        console.log("[Quiz API] Returning SUCCESS response to Unity.");

        return res.status(200).json(quizData);

    } catch (err) {

        console.error("==================================================");
        console.error("[Quiz API] GEMINI FAILED");
        console.error(`[Quiz API] Error message: ${err.message}`);
        console.error(`[Quiz API] Build: ${BUILD_ID}`);
        console.error("==================================================");

        // IMPORTANT:
        // There is NO backend fallback here anymore.
        // Unity should receive HTTP 500.
        return res.status(500).json({
            error: err.message,
            source: "backend_error",
            build: BUILD_ID,
            timestamp: Date.now()
        });
    }
};

// ── Helper: timeout reject ────────────────────────────────────
function timeoutReject(ms, message) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error(message)), ms)
    );
}
