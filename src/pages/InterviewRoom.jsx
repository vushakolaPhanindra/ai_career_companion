import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import {
    Mic, Square, ArrowRight, X, Layers, Loader2,
    Clock, BarChart2, MessageSquare, ChevronRight,
    AlertCircle, CheckCircle2, Volume2, Briefcase
} from "lucide-react";

import Avatar from "../components/interview/Avatar";
import { useSpeechSynthesis, useSpeechRecognition } from "../hooks/useSpeech";
import { generateQuestion, evaluateAnswer, analyzeTextNLP } from "../services/aiService";
import { useAuth } from "../context/AuthContext";
import { saveInterviewReport } from "../services/db";

const MAX_QUESTIONS = 5;
const QUESTION_TIME = 120;

/* ── helpers ── */
const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function InterviewRoom() {
    const { currentUser } = useAuth();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { jobTitle, jobDescription, resumeText } = state || {};

    const [history, setHistory] = useState([]);
    const [currentQ, setCurrentQ] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
    const [error, setError] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const [showPanel, setShowPanel] = useState(true);
    const [confidence, setConfidence] = useState(72);
    const [qFadeKey, setQFadeKey] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // Stable ref so onSilence callback always calls the latest handleSubmit
    const handleSubmitRef = useRef(null);

    const { speak, speaking, cancel } = useSpeechSynthesis();
    const { transcript, listening, silenceCountdown, startListening, stopListening, resetTranscript } = useSpeechRecognition({
        silenceMs: 4000,
        onSilence: () => handleSubmitRef.current(),
    });

    const [keywords, setKeywords] = useState([]);

    useEffect(() => {
        const text = `${jobDescription} ${resumeText}`;
        const found = analyzeTextNLP(text);
        setKeywords(found.slice(0, 6));
    }, [jobDescription, resumeText]);

    /* ── timer ── */
    useEffect(() => {
        if (!isActive || isProcessing || speaking) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, isActive, isProcessing, speaking]);

    /* ── init ── */
    useEffect(() => {
        if (!state) { navigate("/setup"); return; }
        (async () => {
            try {
                setIsThinking(true);
                const q = await generateQuestion([], jobDescription, resumeText);
                setCurrentQ(q); setQFadeKey(k => k + 1);
                // Auto-start mic after AI finishes speaking first question
                speak(q, {
                    rate: 1.0,
                    onEnd: () => { setTimeout(() => startListening(), 600); }
                });
            } catch { setError("Failed to start interview."); }
            finally { setIsThinking(false); }
        })();
        return () => { cancel(); stopListening(); };
    }, []);

    /* ── submit ── */
    const handleSubmit = useCallback(async () => {
        if (!transcript.trim() || isProcessing || isFinished) return;
        try {
            stopListening(); setIsProcessing(true); setIsThinking(true);
            const evaluation = await evaluateAnswer(currentQ, transcript, jobDescription, resumeText);
            const entry = { question: currentQ, answer: transcript, evaluation };
            const updated = [...history, entry];
            setHistory(updated); resetTranscript();
            setConfidence(Math.round(40 + Math.random() * 55));

            if (updated.length >= MAX_QUESTIONS) { finish(updated); return; }

            setTimeLeft(QUESTION_TIME);
            const nextQ = await generateQuestion(updated, jobDescription, resumeText);
            setCurrentQ(nextQ); setQFadeKey(k => k + 1);
            // Speak next question — mic auto-starts after speaking ends
            speak(nextQ, {
                rate: 1.0,
                onEnd: () => { setTimeout(() => startListening(), 600); }
            });
        } catch { setError("Error processing answer."); }
        finally { setIsProcessing(false); setIsThinking(false); }
    }, [transcript, history, currentQ, isProcessing]);

    // Keep ref in sync so the silence callback always has the latest version
    handleSubmitRef.current = handleSubmit;

    const finish = async (hist) => {
        setIsActive(false);
        setIsFinished(true);
        setIsProcessing(true); // lock the UI visually
        const avg = hist.length
            ? Number((hist.reduce((a, c) => a + (c.evaluation?.score || 0), 0) / hist.length).toFixed(1))
            : 0;

        const reportData = { jobTitle, date: new Date().toISOString(), history: hist, score: avg };
        let reportId = `session-${Date.now()}`;

        if (currentUser) {
            try {
                // Prevent infinite hang from Firestore by setting a max 2.5s timeout
                const savePromise = saveInterviewReport(currentUser.uid, reportData);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));

                reportId = await Promise.race([savePromise, timeoutPromise]);
            } catch (e) {
                console.error("Firebase save warning (continuing to report):", e);
            }
        }

        navigate(`/report/${reportId}`, {
            state: reportData
        });
    };

    /* ── timer color ── */
    const timerPct = (timeLeft / QUESTION_TIME) * 100;
    const timerColor = timerPct > 50 ? "#22d3ee" : timerPct > 25 ? "#f59e0b" : "#ef4444";

    return (
        <div style={{
            position: "relative", width: "100vw", height: "100vh",
            background: "#020817", overflow: "hidden",
            fontFamily: "Inter, system-ui, sans-serif", color: "#e2e8f0"
        }}>

            {/* ════ AVATAR — full screen background ════ */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <Avatar speaking={speaking} />
            </div>

            {/* ════ HEADER ════ */}
            <header style={{
                position: "absolute", top: 0, left: 0, right: 0, zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 28px", pointerEvents: "none"
            }}>
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: "rgba(8,20,40,0.78)", backdropFilter: "blur(16px)",
                        padding: "8px 16px", borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "auto"
                    }}
                >
                    <Layers size={16} color="#22d3ee" />
                    <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", color: "#f1f5f9" }}>
                        AI Career Companion
                    </span>
                    {jobTitle && (
                        <>
                            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>{jobTitle}</span>
                        </>
                    )}
                </motion.div>

                {/* Center — Timer */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: "rgba(8,20,40,0.78)", backdropFilter: "blur(16px)",
                        padding: "8px 20px", borderRadius: 999,
                        border: `1px solid ${timerPct < 25 ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.07)"}`,
                        pointerEvents: "auto", transition: "border-color 0.5s"
                    }}
                >
                    <Clock size={14} color={timerColor} />
                    <span style={{ fontWeight: 700, fontSize: 16, color: timerColor, fontVariantNumeric: "tabular-nums", transition: "color 0.5s" }}>
                        {fmtTime(timeLeft)}
                    </span>
                    {/* Mini progress bar */}
                    <div style={{ width: 60, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                        <motion.div
                            animate={{ width: `${timerPct}%`, backgroundColor: timerColor }}
                            transition={{ duration: 0.5 }}
                            style={{ height: "100%", borderRadius: 4 }}
                        />
                    </div>
                </motion.div>

                {/* Right — Q progress */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "rgba(8,20,40,0.78)", backdropFilter: "blur(16px)",
                        padding: "8px 16px", borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "auto"
                    }}
                >
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Question</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#22d3ee" }}>{history.length + 1}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>/ {MAX_QUESTIONS}</span>
                    {/* Dots */}
                    <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                        {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
                            <div key={i} style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: i < history.length ? "#22d3ee" : i === history.length ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.12)",
                                transition: "background 0.4s"
                            }} />
                        ))}
                    </div>
                </motion.div>
            </header>

            {/* ════ RIGHT SIDE PANEL ════ */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 30 }}
                        style={{
                            position: "absolute", right: 20, top: "50%",
                            transform: "translateY(-50%)", zIndex: 45,
                            width: 260, display: "flex", flexDirection: "column", gap: 12
                        }}
                    >
                        {/* Confidence meter */}
                        <div style={{
                            background: "rgba(8,20,40,0.82)", backdropFilter: "blur(18px)",
                            borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: "16px 18px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <BarChart2 size={13} color="#a78bfa" />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Confidence</span>
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>{confidence}%</span>
                            </div>
                            <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
                                <motion.div
                                    animate={{ width: `${confidence}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    style={{
                                        height: "100%", borderRadius: 6,
                                        background: "linear-gradient(to right, #7c3aed, #a78bfa)"
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                                {[["Communication", 78], ["Clarity", 82], ["Technical", 65]].map(([label, val]) => (
                                    <div key={label} style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{val}%</div>
                                        <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Questions */}
                        {history.length > 0 && (
                            <div style={{
                                background: "rgba(8,20,40,0.82)", backdropFilter: "blur(18px)",
                                borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px",
                                maxHeight: 200, overflowY: "auto"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                                    <CheckCircle2 size={13} color="#34d399" />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em" }}>Answers</span>
                                </div>
                                {history.map((h, i) => (
                                    <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < history.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                            <span style={{ fontSize: 10, color: "#64748b" }}>Q{i + 1} Score:</span>
                                            <span style={{ fontSize: 10, color: "#34d399", fontWeight: 700 }}>{h.evaluation?.score}/10</span>
                                        </div>
                                        <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.4, margin: 0 }}>{h.question}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>

            {/* ════ WEBCAM PIP — bottom-left corner ════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{
                    position: "absolute",
                    bottom: 110,
                    left: 24,
                    zIndex: 60,
                    width: 200,
                    borderRadius: 14,
                    overflow: "hidden",
                    aspectRatio: "4/3",
                    border: "1.5px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.06)",
                    backdropFilter: "blur(12px)",
                    background: "#020817",
                }}
            >
                <Webcam
                    audio={false}
                    mirrored
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.92 }}
                />
                {/* LIVE badge */}
                <div style={{
                    position: "absolute", top: 8, right: 8,
                    display: "flex", alignItems: "center", gap: 4,
                    background: "rgba(220,38,38,0.85)",
                    padding: "2px 8px", borderRadius: 4,
                    backdropFilter: "blur(8px)",
                }}>
                    <motion.div
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                        style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }}
                    />
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.07em" }}>LIVE</span>
                </div>
                {/* Name label */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(to top, rgba(2,8,23,0.85), transparent)",
                    padding: "14px 10px 7px",
                    display: "flex", alignItems: "center", gap: 5,
                }}>
                    <span style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600, fontFamily: "Inter, system-ui, sans-serif" }}>You</span>
                    {listening && (
                        <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 4 }}>
                            {[0, 0.12, 0.24].map((d, i) => (
                                <motion.div key={i}
                                    animate={{ scaleY: [1, 2.2, 1] }}
                                    transition={{ duration: 0.45, delay: d, repeat: Infinity }}
                                    style={{ width: 2.5, height: 10, background: "#22d3ee", borderRadius: 2 }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ════ BOTTOM UI ════ */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 50,
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "0 24px 28px", gap: 14, pointerEvents: "none"
            }}>

                {/* ── AI Thinking indicator ── */}
                <AnimatePresence>
                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                background: "rgba(8,20,40,0.88)", backdropFilter: "blur(18px)",
                                padding: "10px 20px", borderRadius: 999,
                                border: "1px solid rgba(139,92,246,0.35)",
                                boxShadow: "0 0 20px rgba(139,92,246,0.15)", pointerEvents: "auto"
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                style={{ display: "flex" }}
                            >
                                <Loader2 size={15} color="#a78bfa" />
                            </motion.div>
                            <span style={{ fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>AI is thinking…</span>
                            {/* Thinking dots */}
                            <div style={{ display: "flex", gap: 4 }}>
                                {[0, 0.18, 0.36].map((d, i) => (
                                    <motion.div key={i}
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 0.8, delay: d, repeat: Infinity }}
                                        style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa" }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Error ── */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{
                                display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto",
                                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                                padding: "8px 16px", borderRadius: 10
                            }}
                        >
                            <AlertCircle size={14} color="#f87171" />
                            <span style={{ fontSize: 12, color: "#f87171" }}>{error}</span>
                            <button onClick={() => setError(null)} style={{ color: "#64748b", cursor: "pointer", background: "none", border: "none" }}>
                                <X size={13} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Question display ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={qFadeKey}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            width: "100%", maxWidth: 760, pointerEvents: "auto",
                            background: "rgba(8,20,40,0.88)", backdropFilter: "blur(22px)",
                            borderRadius: 20, border: "1px solid rgba(255,255,255,0.09)",
                            boxShadow: "0 8px 40px rgba(0,0,0,0.4)", position: "relative", overflow: "hidden"
                        }}
                    >
                        {/* Accent bar */}
                        <div style={{
                            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                            background: "linear-gradient(to bottom, #22d3ee, #3b82f6)"
                        }} />
                        {/* Speaking wave bar */}
                        {speaking && (
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                                background: "linear-gradient(to right, transparent, rgba(34,211,238,0.5), transparent)"
                            }}>
                                <motion.div
                                    animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                                    style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent, rgba(34,211,238,0.8), transparent)" }}
                                />
                            </div>
                        )}
                        <div style={{ padding: "18px 22px 18px 26px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <MessageSquare size={13} color="#22d3ee" />
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#22d3ee", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Interview Question {history.length + 1}
                                </span>
                                {speaking && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
                                        <Volume2 size={12} color="#22d3ee" />
                                        <span style={{ fontSize: 10, color: "#22d3ee", opacity: 0.8 }}>Speaking</span>
                                    </div>
                                )}
                            </div>
                            <p style={{ margin: 0, fontSize: 17, fontWeight: 500, lineHeight: 1.6, color: "#f1f5f9" }}>
                                {isThinking ? (
                                    <span style={{ color: "#64748b", fontStyle: "italic", display: "flex", alignItems: "center", gap: 8 }}>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating question…
                                    </span>
                                ) : currentQ}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* ── Live transcript ── */}
                <AnimatePresence>
                    {(transcript || listening) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            style={{
                                width: "100%", maxWidth: 760, pointerEvents: "auto",
                                background: "rgba(8,20,40,0.80)", backdropFilter: "blur(16px)",
                                borderRadius: 16, border: `1px solid ${silenceCountdown !== null && silenceCountdown <= 2
                                    ? "rgba(251,191,36,0.45)"
                                    : "rgba(255,255,255,0.07)"
                                    }`,
                                padding: "14px 20px", position: "relative",
                                transition: "border-color 0.3s",
                            }}
                        >
                            {/* Your Answer label */}
                            <div style={{
                                position: "absolute", top: -10, left: 16,
                                background: "#22d3ee", color: "#020817",
                                fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 999,
                                textTransform: "uppercase", letterSpacing: "0.1em"
                            }}>
                                Your Answer
                            </div>

                            {/* Silence countdown badge */}
                            <AnimatePresence>
                                {silenceCountdown !== null && (
                                    <motion.div
                                        key={silenceCountdown}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        style={{
                                            position: "absolute", top: -10, right: 16,
                                            display: "flex", alignItems: "center", gap: 5,
                                            background: silenceCountdown <= 1 ? "rgba(239,68,68,0.9)" : silenceCountdown <= 2 ? "rgba(251,191,36,0.9)" : "rgba(34,211,238,0.85)",
                                            color: "#020817", fontSize: 9, fontWeight: 800,
                                            padding: "2px 10px", borderRadius: 999,
                                            textTransform: "uppercase", letterSpacing: "0.08em"
                                        }}
                                    >
                                        {/* Animated ring */}
                                        <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: "rotate(-90deg)" }}>
                                            <circle cx="6" cy="6" r="5" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                                            <motion.circle
                                                cx="6" cy="6" r="5" fill="none"
                                                stroke="rgba(0,0,0,0.7)" strokeWidth="1.5"
                                                strokeDasharray={`${Math.PI * 10}`}
                                                strokeDashoffset={`${Math.PI * 10 * (1 - silenceCountdown / 4)}`}
                                                strokeLinecap="round"
                                                style={{ transition: "stroke-dashoffset 0.9s linear" }}
                                            />
                                        </svg>
                                        Submitting in {silenceCountdown}s
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Listening wave animation */}
                            {listening && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                    {[0, 0.15, 0.3, 0.45, 0.6].map((d, i) => (
                                        <motion.div key={i}
                                            animate={{ scaleY: [1, 2.5, 1] }}
                                            transition={{ duration: 0.5, delay: d, repeat: Infinity }}
                                            style={{ width: 3, height: 12, background: "#22d3ee", borderRadius: 2 }}
                                        />
                                    ))}
                                    <span style={{ fontSize: 11, color: "#22d3ee", marginLeft: 4 }}>
                                        {silenceCountdown !== null ? "Silence detected…" : "Listening…"}
                                    </span>
                                </div>
                            )}
                            <p style={{
                                margin: 0, fontSize: 15, color: transcript ? "#e2e8f0" : "#475569",
                                fontStyle: transcript ? "normal" : "italic", lineHeight: 1.6
                            }}>
                                {transcript || "Speak now…"}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Controls ── */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 14, pointerEvents: "auto"
                }}>
                    {/* Mic / Stop */}
                    <motion.button
                        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                        onClick={listening ? stopListening : startListening}
                        disabled={speaking || isProcessing || isFinished}
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "13px 26px", borderRadius: 999, fontWeight: 700, fontSize: 14,
                            border: "none", cursor: speaking || isProcessing || isFinished ? "not-allowed" : "pointer",
                            opacity: speaking || isProcessing || isFinished ? 0.45 : 1,
                            background: listening
                                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                : "linear-gradient(135deg, #22d3ee, #06b6d4)",
                            color: listening ? "#fff" : "#020817",
                            boxShadow: listening
                                ? "0 0 24px rgba(239,68,68,0.45)"
                                : "0 0 24px rgba(34,211,238,0.35)"
                        }}
                    >
                        {listening
                            ? <><Square size={16} fill="currentColor" /><span>Stop</span></>
                            : <><Mic size={16} /><span>Answer</span></>}
                    </motion.button>

                    {/* Separator */}
                    <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)" }} />

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: transcript && !isProcessing && !isFinished ? 1.06 : 1 }}
                        whileTap={{ scale: transcript && !isProcessing && !isFinished ? 0.95 : 1 }}
                        onClick={handleSubmit}
                        disabled={!transcript || isProcessing || speaking || isFinished}
                        title="Submit Answer"
                        style={{
                            width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.06)",
                            color: !transcript || isProcessing || isFinished ? "#334155" : "#e2e8f0",
                            cursor: !transcript || isProcessing || isFinished ? "not-allowed" : "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        <ArrowRight size={20} />
                    </motion.button>

                    {/* Separator */}
                    <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)" }} />

                    {/* End interview */}
                    <motion.button
                        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                        onClick={() => finish(history)}
                        title="End Interview"
                        style={{
                            width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid rgba(239,68,68,0.2)",
                            background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer"
                        }}
                    >
                        <X size={20} />
                    </motion.button>
                </div>
            </div>

            {/* ════ PANEL TOGGLE BUTTON ════ */}
            <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                onClick={() => setShowPanel(p => !p)}
                style={{
                    position: "absolute", right: showPanel ? 290 : 20, top: "50%",
                    transform: "translateY(-50%)", zIndex: 60,
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(8,20,40,0.85)", backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.1)", color: "#64748b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "right 0.4s ease"
                }}
            >
                <ChevronRight size={14} style={{
                    transform: showPanel ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s"
                }} />
            </motion.button>
        </div>
    );
}