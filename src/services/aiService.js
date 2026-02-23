import questionBank from "./questionBank.json";

/* ─────────────────────────────────────────────────────────
   AI Service — Adaptive interview question generation &
   detailed answer evaluation
───────────────────────────────────────────────────────── */

const FEEDBACK = [
    "Good use of structure. Try adding specific metrics or outcomes to make your answer more compelling.",
    "Excellent — you clearly communicated your thought process and demonstrated ownership.",
    "Try to be more concise. Focus on the aspect most relevant to the question.",
    "Strong technical depth. Work on linking your technical work to business impact.",
    "Good answer. Using the STAR method (Situation, Task, Action, Result) would strengthen it further.",
    "Very clear and direct. Your confidence comes through well.",
    "Consider pausing on the 'Result' — quantify your impact where possible.",
    "Solid example. Elaborating on cross-functional collaboration would add depth.",
];

/* ── Simulated delay (mimics LLM response time) ── */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* ── NLP-lite Helpers — Processing & Analysis ── */
const STOP_WORDS = new Set(["a", "an", "the", "and", "or", "but", "about", "above", "after", "again", "against", "all", "am", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "safe", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"]);

const SYNONYM_MAP = {
    "js": "javascript",
    "py": "python",
    "ts": "typescript",
    "aws": "aws",
    "amazon web services": "aws",
    "ui/ux": "react", // Mapping to existing bank keys
    "user experience": "react",
    "user interface": "react",
    "frontend": "react",
    "backend": "python",
    "docker": "docker",
    "kubernetes": "docker",
    "k8s": "docker",
    "sql": "sql",
    "mysql": "sql",
    "postgres": "sql",
    "mongodb": "sql", // Generic mapping
    "security": "security",
    "cybersecurity": "security",
    "testing": "testing",
    "unit testing": "testing",
    "qa": "testing",
    "git": "technical",
    "github": "technical",
    "gitlab": "technical"
};

const extractName = (text) => {
    if (!text) return "";
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return "";
    const firstLine = lines[0];
    if (firstLine.split(' ').length <= 4 && /^[A-Z]/.test(firstLine)) {
        return firstLine;
    }
    return "";
};

/**
 * Advanced Keyword Extraction (NLP-lite)
 */
export const analyzeTextNLP = (text) => {
    if (!text) return [];

    // 1. Tokenize & Clean
    const rawTokens = text.toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ") // Remove punctuation
        .split(/\s+/);

    const tokens = rawTokens.filter(t => t.length > 2 && !STOP_WORDS.has(t));

    // 2. Map synonyms & filter to bank categories
    const categories = Object.keys(questionBank);

    // 3. Score categories based on occurrence and synonyms
    const frequencies = {};

    tokens.forEach(token => {
        // Direct match
        if (categories.includes(token)) {
            frequencies[token] = (frequencies[token] || 0) + 2;
        }
        // Synonym match
        const mapped = SYNONYM_MAP[token];
        if (mapped && categories.includes(mapped)) {
            frequencies[mapped] = (frequencies[mapped] || 0) + 1.5;
        }
    });

    // 4. Boost phrases (Job titles, specific tech)
    const normalizedText = text.toLowerCase();
    categories.forEach(cat => {
        if (normalizedText.includes(cat)) {
            frequencies[cat] = (frequencies[cat] || 0) + 5;
        }
    });

    // 5. Build results
    const results = Object.entries(frequencies)
        .map(([keyword, score]) => ({ keyword, score }))
        .filter(res => res.score > 2)
        .sort((a, b) => b.score - a.score);

    return results.map(r => r.keyword);
};

/* ─────────────────────────────────────────────────────────
   generateQuestion
   Advanced analysis of resume/JD to generate personalized
   questions, including name-calling and deep keyword matching.
───────────────────────────────────────────────────────── */
export async function generateQuestion(history, jobDescription = "", resumeText = "") {
    await delay(1800 + Math.random() * 1200);

    const userName = extractName(resumeText);
    const firstName = userName ? userName.split(' ')[0] : "there";

    /* First question — Introduction (Personalized) */
    if (history.length === 0) {
        return `Hello ${firstName}! It's a pleasure to meet you. I've had a chance to review your profile. To kick things off, could you walk me through your background and what specifically interests you about this role?`;
    }

    const count = history.length;
    const resumeSkills = analyzeTextNLP(resumeText);
    const jobRequirements = analyzeTextNLP(jobDescription);
    const overlap = resumeSkills.filter(s => jobRequirements.includes(s));

    /* 2. Generation Logic with JSON Question Bank */

    // Stage 1: Focus on Top Resume Strengths
    if (count === 1) {
        if (resumeSkills.length > 0) {
            const topSkill = resumeSkills[0]; // Priotitize most frequent/relevant
            const questions = questionBank[topSkill];
            if (questions && questions.length > 0) {
                return questions[Math.floor(Math.random() * questions.length)];
            }
        }
        return `Looking at your experience, ${firstName}, how do you usually approach learning new technologies or frameworks when starting a complex project?`;
    }

    // Stage 2: Technical/Role Fit (Bridge Resume to Job requirements)
    if (count === 2) {
        const prioritySkill = overlap.length > 0 ? overlap[0] : (jobRequirements.length > 0 ? jobRequirements[0] : null);
        if (prioritySkill && questionBank[prioritySkill]) {
            const questions = questionBank[prioritySkill];
            const q = questions[1] || questions[0];
            return `This role has a strong emphasis on ${prioritySkill.toUpperCase()}. ${firstName}, ${q}`;
        }
        const genericTechnicalQuestions = questionBank.technical || ["How do you ensure the quality and maintainability of your code?"];
        return genericTechnicalQuestions[Math.floor(Math.random() * genericTechnicalQuestions.length)];
    }

    // Stage 3: Leadership / Soft Skills / Situational
    if (count === 3) {
        const softSkills = ["leadership", "management", "communication", "agile"];
        const foundSoft = resumeSkills.filter(s => softSkills.includes(s));

        if (foundSoft.length > 0) {
            const skill = foundSoft[0]; // Prioritize strongest soft skill
            const questions = questionBank[skill];
            return `${firstName}, ${questions[Math.floor(Math.random() * questions.length)]}`;
        }
        const genericBehavioralQuestions = questionBank.behavioral || ["Describe a situation where you had to meet a tight deadline. How did you manage your time and priorities?"];
        return genericBehavioralQuestions[Math.floor(Math.random() * genericBehavioralQuestions.length)];
    }

    // Stage 4+ : Closing
    if (count >= 4) {
        const closingQuestions = questionBank.closing || ["What are your primary career goals for the next three to five years?"];
        return `${firstName}, ${closingQuestions[Math.floor(Math.random() * closingQuestions.length)]}`;
    }

    const allQuestions = [
        ...(questionBank.behavioral || []),
        ...(questionBank.technical || []),
        ...(questionBank.situational || []),
        ...(questionBank.leadership || []),
        ...(questionBank.communication || []),
        ...(questionBank.agile || []),
        ...(questionBank.management || []),
    ];
    return allQuestions[Math.floor(Math.random() * allQuestions.length)];
}

/* ─────────────────────────────────────────────────────────
   evaluateAnswer
   Analyzes answer quality, word count, fillers, and 
   relevance to key skills found in resume/job description.
───────────────────────────────────────────────────────── */
export async function evaluateAnswer(question, answer, jobDescription = "", resumeText = "") {
    await delay(1800 + Math.random() * 1000);

    const wordCount = answer.trim().split(/\s+/).length;

    // Prioritized NLP matching for scoring relevance
    const relevantSkills = [...new Set([...analyzeTextNLP(jobDescription), ...analyzeTextNLP(resumeText)])];
    const matchedSkills = relevantSkills.filter(s => answer.toLowerCase().includes(s));

    const hasNumbers = /\d+/.test(answer);
    const hasExamples = /for example|instance|when i|i once|we did|i built|i led|i managed/i.test(answer);
    const fillers = (answer.match(/\b(um|uh|like|you know|basically|literally)\b/gi) || []).length;

    /* Score components */
    const lengthScore = Math.min(10, Math.max(1, Math.round(wordCount / 18)));
    const skillBonus = Math.min(2, matchedSkills.length * 0.5); // Bonus for hitting relevant technical keywords
    const specificityBonus = (hasNumbers ? 1 : 0) + (hasExamples ? 1 : 0);
    const fillerPenalty = Math.min(3, Math.floor(fillers / 2));

    const baseScore = Math.min(10, Math.max(4, lengthScore + skillBonus + specificityBonus - fillerPenalty + Math.round(Math.random() * 2)));

    const communication = Math.min(10, Math.max(4, baseScore - 1 + Math.round(Math.random() * 2)));
    const clarity = Math.min(10, Math.max(4, baseScore + (hasExamples ? 1 : -1)));
    const techAccuracy = Math.min(10, Math.max(3, baseScore + skillBonus - 1));
    const confidence = Math.min(10, Math.max(5, baseScore + (fillers < 3 ? 1 : -1)));

    const score = Math.round((baseScore + communication + clarity + confidence) / 4);

    let feedback = FEEDBACK[Math.floor(Math.random() * FEEDBACK.length)];
    if (matchedSkills.length > 0) {
        feedback += ` I noticed you mentioned ${matchedSkills[0].toUpperCase()}, which is highly relevant here.`;
    }

    const improvements = [];
    if (wordCount < 50) improvements.push("Try to elaborate more — aim for a more detailed story.");
    if (!hasExamples) improvements.push("Ground your answer with a concrete story from your past experience.");
    if (matchedSkills.length === 0 && relevantSkills.length > 0) {
        improvements.push(`Try to weave in specific mention of relevant skills like ${relevantSkills[0].toUpperCase()}.`);
    }
    if (fillers > 4) improvements.push("Work on reducing filler words like 'um' or 'like'.");
    if (improvements.length === 0) improvements.push("Excellent work — this was a well-structured and relevant answer.");

    return {
        score,
        feedback,
        communication,
        clarity,
        techAccuracy,
        confidence,
        improvements: improvements.join(" "),
        wordCount,
        fillerWords: fillers,
        matchedSkills
    };
}
