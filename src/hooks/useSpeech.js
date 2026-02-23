import { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================
   🎤 SPEECH SYNTHESIS (AI SPEAKING)
========================================================= */
export function useSpeechSynthesis() {
    const [speaking, setSpeaking] = useState(false);
    const [voice, setVoice] = useState(null);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        const loadVoices = () => {
            const voices = synthRef.current.getVoices();

            const preferred =
                voices.find(v => v.name.includes("Google")) ||
                voices.find(v => v.lang === "en-US") ||
                voices[0];

            setVoice(preferred);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const speak = useCallback((text, options = {}) => {
        if (!text) return;

        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.voice = voice;
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        utterance.onstart = () => {
            setSpeaking(true);
            if (options.onStart) options.onStart();
        };
        utterance.onend = () => {
            setSpeaking(false);
            if (options.onEnd) options.onEnd();
        };
        utterance.onerror = () => setSpeaking(false);

        // Key for lip sync: fires on word boundaries
        utterance.onboundary = (event) => {
            if (options.onBoundary) {
                options.onBoundary(event);
            }
        };

        synthRef.current.speak(utterance);
    }, [voice]);

    const cancel = () => {
        synthRef.current.cancel();
        setSpeaking(false);
    };

    return { speak, speaking, cancel };
}

/* =========================================================
   🎙 SPEECH RECOGNITION (USER SPEAKING + ANALYTICS)
========================================================= */
export function useSpeechRecognition({ silenceMs = 0, onSilence } = {}) {
    const [transcript, setTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    const [listening, setListening] = useState(false);
    const [silenceCountdown, setSilenceCountdown] = useState(null);

    const [confidence, setConfidence] = useState(0);
    const [fillerCount, setFillerCount] = useState(0);
    const [wordsPerMinute, setWordsPerMinute] = useState(0);
    const [pauseCount, setPauseCount] = useState(0);

    const recognitionRef = useRef(null);
    const startTimeRef = useRef(null);
    const lastResultTimeRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const onSilenceRef = useRef(onSilence);
    onSilenceRef.current = onSilence;

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setListening(true);
            startTimeRef.current = Date.now();
            lastResultTimeRef.current = Date.now();
        };

        recognition.onresult = (event) => {
            let interim = "";
            let finalText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript;
                    setConfidence(result[0].confidence || 0);
                } else {
                    interim += result[0].transcript;
                }
            }

            const fullText = finalTranscript + finalText;
            setTranscript(fullText + interim);
            setFinalTranscript(fullText);

            /* ---------- FILLER WORD DETECTION ---------- */
            const fillers = ["um", "uh", "like", "you know"];
            const lower = (finalText + interim).toLowerCase();
            const count = fillers.reduce(
                (acc, word) => acc + (lower.split(word).length - 1),
                0
            );
            setFillerCount(prev => prev + count);

            /* ---------- PAUSE DETECTION ---------- */
            const now = Date.now();
            if (now - lastResultTimeRef.current > 2000) {
                setPauseCount(prev => prev + 1);
            }
            lastResultTimeRef.current = now;

            /* ---------- WPM CALCULATION ---------- */
            const totalTimeMinutes = (now - startTimeRef.current) / 60000;
            const wordCount = fullText.trim().split(/\s+/).length;
            if (totalTimeMinutes > 0) {
                setWordsPerMinute(Math.round(wordCount / totalTimeMinutes));
            }

            /* ---------- RESET SILENCE TIMER on new speech ---------- */
            if (silenceMs > 0) {
                clearTimeout(silenceTimerRef.current);
                clearInterval(countdownIntervalRef.current);
                setSilenceCountdown(null);

                // Only arm the timer if there's actually transcript content
                if ((fullText + interim).trim()) {
                    const steps = Math.ceil(silenceMs / 1000);
                    let remaining = steps;
                    setSilenceCountdown(remaining);

                    countdownIntervalRef.current = setInterval(() => {
                        remaining -= 1;
                        setSilenceCountdown(prev => (prev !== null ? prev - 1 : null));
                        if (remaining <= 0) clearInterval(countdownIntervalRef.current);
                    }, 1000);

                    silenceTimerRef.current = setTimeout(() => {
                        setSilenceCountdown(null);
                        if (onSilenceRef.current) onSilenceRef.current();
                    }, silenceMs);
                }
            }
        };

        recognition.onerror = (e) => {
            console.error("Recognition error:", e);
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
            clearTimeout(silenceTimerRef.current);
            clearInterval(countdownIntervalRef.current);
            setSilenceCountdown(null);
        };

        recognitionRef.current = recognition;

    }, [finalTranscript]);

    const startListening = () => {
        if (recognitionRef.current && !listening) {
            try {
                setTranscript("");
                setFinalTranscript("");
                setFillerCount(0);
                setPauseCount(0);
                setWordsPerMinute(0);
                setSilenceCountdown(null);
                clearTimeout(silenceTimerRef.current);
                clearInterval(countdownIntervalRef.current);
                recognitionRef.current.start();
            } catch (err) {
                console.error("Start error:", err);
            }
        }
    };

    const stopListening = () => {
        clearTimeout(silenceTimerRef.current);
        clearInterval(countdownIntervalRef.current);
        setSilenceCountdown(null);
        if (recognitionRef.current && listening) {
            recognitionRef.current.stop();
        }
    };

    const resetTranscript = () => {
        setTranscript("");
        setFinalTranscript("");
        setFillerCount(0);
        setPauseCount(0);
        setWordsPerMinute(0);
        setConfidence(0);
    };

    return {
        transcript,
        finalTranscript,
        listening,
        silenceCountdown,
        confidence,
        fillerCount,
        wordsPerMinute,
        pauseCount,
        startListening,
        stopListening,
        resetTranscript
    };
}