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
// DESIGN GOALS FOR FLOOR 3 QUIZZES:
//   - Questions appear during active gameplay
//   - Players have limited time and attention
//   - Questions must be short, readable, and fast to answer
//   - Difficulty should still vary for engagement
//
// PROMPT DESIGN RULES:
//   1. Tell Gemini its role clearly
//   2. Specify the topic scope
//   3. Demand EXACTLY 5 questions
//   4. Enforce short question/answer length
//   5. Require EASY → HARD progression
//   6. Show the exact JSON schema
//   7. Demand ONLY valid JSON output
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

    return `You are a quiz generator for an educational action video game called "The Mechanical Soul".

Players answer questions WHILE actively playing the game.
They have limited time and attention.

Your task: Generate exactly 5 multiple-choice quiz questions about the topic: ${ctx.label}.

Topic scope: ${ctx.description}.

Requirements:
- Each question must have exactly 4 answer options (A, B, C, D)
- Exactly one answer must be correct
- Questions must be clear, factual, and fast to read
- Questions must be suitable for university-level students
- Questions must be in English
- Vary the difficulty:
  - 2 easy questions
  - 2 medium questions
  - 1 hard question
- Easy = common knowledge or basic concepts
- Medium = requires basic understanding of the topic
- Hard = challenging but still answerable quickly
- Question text: maximum 12 words
- Each answer option: maximum 5 words
- Avoid long explanations or setup sentences
- Avoid trick questions, double negatives, or "which is NOT" questions
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)

GOOD example:
{
  "question": "What does CPU stand for?",
  "answers": ["Central Processing Unit", "Core Power Utility", "Computer Protocol Unit", "Central Program Upload"],
  "correctIndex": 0
}

BAD example (too long and complex):
{
  "question": "In distributed computing systems, what does the CAP theorem primarily describe?",
  "answers": ["Consistency, availability, partition tolerance tradeoff", "..."]
}

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

Generate exactly 5 quiz objects in the "quizzes" array.
Return nothing except the JSON.`;
}

module.exports = { buildPrompt, TOPIC_CONTEXTS };
