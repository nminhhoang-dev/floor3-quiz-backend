// ============================================================
// FILE: lib/fallbackQuiz.js
// ------------------------------------------------------------
// Hardcoded fallback quizzes returned when Gemini API fails,
// times out, or returns malformed JSON.
//
// WHY FALLBACK ON THE BACKEND (not just Unity)?
//   The backend is the single source of truth for quiz data.
//   If Gemini fails, backend returns valid fallback JSON with
//   the SAME schema — Unity never knows the difference.
//   Unity also has its own fallback (MockQuizGenerator) as
//   a second safety net if the entire backend is unreachable.
// ============================================================

const FALLBACK_QUIZZES = {
    technology: {
        topic: "technology",
        source: "fallback",
        quizzes: [
            {
                question: "What does CPU stand for?",
                answers: ["Central Processing Unit", "Core Power Unit", "Computer Protocol Utility", "Central Program Upload"],
                correctIndex: 0,
            },
            {
                question: "Which protocol automatically assigns IP addresses on a network?",
                answers: ["FTP", "DHCP", "DNS", "HTTP"],
                correctIndex: 1,
            },
            {
                question: "What is the function of RAM in a computer?",
                answers: ["Permanent data storage", "Temporary fast-access memory", "Graphics rendering", "Power regulation"],
                correctIndex: 1,
            },
            {
                question: "Which component converts AC power to DC for computer components?",
                answers: ["GPU", "Motherboard", "Power Supply Unit", "Heat Sink"],
                correctIndex: 2,
            },
            {
                question: "In binary, what is the decimal value of 1010?",
                answers: ["8", "10", "12", "14"],
                correctIndex: 1,
            },
        ],
    },

    biology: {
        topic: "biology",
        source: "fallback",
        quizzes: [
            {
                question: "What is the powerhouse of the cell?",
                answers: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
                correctIndex: 2,
            },
            {
                question: "Which molecule carries genetic information in most living organisms?",
                answers: ["RNA", "ATP", "DNA", "Protein"],
                correctIndex: 2,
            },
            {
                question: "What process do plants use to convert sunlight into energy?",
                answers: ["Respiration", "Photosynthesis", "Fermentation", "Transpiration"],
                correctIndex: 1,
            },
            {
                question: "How many chromosomes does a normal human cell contain?",
                answers: ["23", "44", "46", "48"],
                correctIndex: 2,
            },
            {
                question: "Which blood type is known as the universal donor?",
                answers: ["A+", "B-", "O-", "AB+"],
                correctIndex: 2,
            },
        ],
    },

    ethics: {
        topic: "ethics",
        source: "fallback",
        quizzes: [
            {
                question: "Which ethical theory judges actions by their consequences?",
                answers: ["Deontology", "Virtue ethics", "Consequentialism", "Divine command theory"],
                correctIndex: 2,
            },
            {
                question: "What term describes an AI system making decisions without human oversight?",
                answers: ["Supervised AI", "Autonomous AI", "Narrow AI", "Reactive AI"],
                correctIndex: 1,
            },
            {
                question: "The trolley problem is a classic example of which type of dilemma?",
                answers: ["Legal dilemma", "Moral dilemma", "Economic dilemma", "Political dilemma"],
                correctIndex: 1,
            },
            {
                question: "Which philosopher wrote 'Groundwork of the Metaphysics of Morals'?",
                answers: ["John Stuart Mill", "Aristotle", "Immanuel Kant", "Jean-Paul Sartre"],
                correctIndex: 2,
            },
            {
                question: "What is the term for collecting personal data without user knowledge?",
                answers: ["Data mining", "Surveillance capitalism", "Data harvesting", "Digital profiling"],
                correctIndex: 2,
            },
        ],
    },
};

/**
 * Get fallback quizzes for a topic.
 * @param {string} topic
 * @returns {object} Quiz data object with same schema as Gemini response
 */
function getFallback(topic) {
    return FALLBACK_QUIZZES[topic] || FALLBACK_QUIZZES["technology"];
}

module.exports = { getFallback };