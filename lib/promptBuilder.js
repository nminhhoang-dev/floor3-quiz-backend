// ============================================================
// FILE: lib/promptBuilder.js
// ------------------------------------------------------------
// Builds the exact prompt sent to Gemini based on topic.
//
// WHY STRICT PROMPT ENGINEERING?
//   Gemini is a language model — without strict instructions
//   it may return markdown, extra text, or malformed JSON.
//   We tell it exactly what format to return and nothing else.
//
// PROMPT DESIGN RULES:
//   1. Tell Gemini it is a quiz generator (role)
//   2. Specify the topic clearly
//   3. Demand EXACTLY 5 questions
//   4. Show the exact JSON schema it must follow
//   5. Say "Return ONLY the JSON" — no markdown, no explanation
//   6. Specify difficulty: suitable for university students
// ============================================================

const TOPIC_CONTEXTS = {
    technology: {
        label: "Technology & Mechanical Systems",
        description:
            "computer hardware, software, networking, robotics, circuits, " +
            "mechanical engineering, automation, and digital systems",
    },
    biology: {
        label: "Biology & Life Sciences",
        description:
            "cell biology, genetics, human anatomy, ecosystems, evolution, " +
            "microbiology, and medical science",
    },
    ethics: {
        label: "Ethics & Humanity",
        description:
            "philosophical ethics, AI ethics, human rights, social responsibility, " +
            "moral dilemmas, and the relationship between technology and society",
    },
};

/**
 * Build a prompt for Gemini that forces strict JSON output.
 * @param {string} topic - "technology" | "biology" | "ethics"
 * @returns {string} The full prompt string
 */
function buildPrompt(topic) {
    const ctx = TOPIC_CONTEXTS[topic];

    if (!ctx) {
        throw new Error(`Unknown topic: "${topic}". Valid: technology, biology, ethics`);
    }

    return `You are a quiz generator for an educational video game called "The Mechanical Soul".

Your task: Generate exactly 5 multiple-choice quiz questions about the topic: ${ctx.label}.

Topic scope: ${ctx.description}.

Requirements:
- Each question must have exactly 4 answer options (A, B, C, D)
- Exactly one answer must be correct
- Questions should be clear, factual, and suitable for university-level students
- Questions must be in English
- Vary the difficulty: 2 easy, 2 medium, 1 hard
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)

CRITICAL: Return ONLY a valid JSON object. No markdown. No explanation. No code blocks.
The JSON must follow this exact schema:

{
  "topic": "${topic}",
  "quizzes": [
    {
      "question": "Question text here?",
      "answers": ["Answer A", "Answer B", "Answer C", "Answer D"],
      "correctIndex": 0
    }
  ]
}

Generate exactly 5 quiz objects in the "quizzes" array. Return nothing except the JSON.`;
}

module.exports = { buildPrompt, TOPIC_CONTEXTS };