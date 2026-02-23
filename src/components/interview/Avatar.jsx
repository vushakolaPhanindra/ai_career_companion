import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FRAMES = [0, 0.10, 0.30, 0.62, 0.85, 0.45, 0.20, 0.75, 0.28, 0.52, 0.07, 0.40, 0.68];
const SPEAK_SEQ = [3, 8, 1, 5, 2, 9, 4, 0, 7, 2, 5, 1, 3, 6, 0, 8, 4, 10, 2, 6, 11, 3, 7, 0, 4, 2, 8, 5, 1, 12, 0, 3];
const lerp = (a, b, t) => a + (b - a) * t;

export default function Avatar({ speaking }) {
    const [mouth, setMouth] = useState(0);
    const [blinking, setBlinking] = useState(false);
    const [breathY, setBreathY] = useState(0);
    const [headTilt, setHeadTilt] = useState(0);
    const [gazeX, setGazeX] = useState(0);
    const [gazeY, setGazeY] = useState(0);
    const [waveHeights, setWaveHeights] = useState([4, 4, 4, 4, 4]);

    const mouthRef = useRef(0);
    const targetRef = useRef(0);
    const seqIdxRef = useRef(0);
    const rafRef = useRef(null);

    /* lip sync */
    useEffect(() => {
        let timer;
        const cycle = () => {
            seqIdxRef.current = (seqIdxRef.current + 1) % SPEAK_SEQ.length;
            targetRef.current = speaking ? FRAMES[SPEAK_SEQ[seqIdxRef.current]] : 0;
            timer = setTimeout(cycle, speaking ? 72 + Math.random() * 90 : 200);
        };
        cycle();
        return () => clearTimeout(timer);
    }, [speaking]);

    /* smooth lerp */
    useEffect(() => {
        const tick = () => {
            mouthRef.current = lerp(mouthRef.current, targetRef.current, 0.26);
            setMouth(mouthRef.current);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    /* blink */
    useEffect(() => {
        const go = () => {
            const wait = 2800 + Math.random() * 3500;
            setTimeout(() => {
                setBlinking(true);
                setTimeout(() => { setBlinking(false); go(); }, 115);
            }, wait);
        };
        go();
    }, []);

    /* breathing + micro head tilt */
    useEffect(() => {
        let t = 0, timer;
        const tick = () => {
            t += 0.018;
            setBreathY(Math.sin(t) * 2.8);
            setHeadTilt(Math.sin(t * 0.38) * 0.30);
            timer = setTimeout(tick, 42);
        };
        tick();
        return () => clearTimeout(timer);
    }, []);

    /* eye gaze drift */
    useEffect(() => {
        let t = 0, timer;
        const tick = () => {
            t += 0.012;
            // Drift gaze slowly, occasionally glance toward camera
            const gx = Math.sin(t * 0.7) * 1.8 + Math.sin(t * 1.9) * 0.6;
            const gy = Math.sin(t * 0.5) * 1.2 + Math.cos(t * 1.3) * 0.4;
            setGazeX(gx);
            setGazeY(gy);
            timer = setTimeout(tick, 50);
        };
        tick();
        return () => clearTimeout(timer);
    }, []);

    /* audio wave bars */
    useEffect(() => {
        if (!speaking) { setWaveHeights([4, 4, 4, 4, 4]); return; }
        let timer;
        const tick = () => {
            setWaveHeights([
                4 + Math.random() * 18,
                4 + Math.random() * 28,
                4 + Math.random() * 34,
                4 + Math.random() * 28,
                4 + Math.random() * 18,
            ]);
            timer = setTimeout(tick, 90);
        };
        tick();
        return () => clearTimeout(timer);
    }, [speaking]);

    const o = mouth;
    const jawDrop = o * 16;
    const ulArcY = -4 - o * 3.5;
    const llArcY = jawDrop + 4 + o * 1.5;

    return (
        <motion.div
            style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
                background: "radial-gradient(ellipse at 50% 30%, #0e2448 0%, #060f1e 55%, #020817 100%)"
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}
        >
            {/* ── Office background ── */}
            <OfficeBackground />

            {/* ── Studio spotlight ── */}
            <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: "70%", height: "85%",
                background: "radial-gradient(ellipse at 50% 0%, rgba(60,140,255,0.07) 0%, transparent 65%)",
                pointerEvents: "none", zIndex: 2,
            }} />

            {/* ── Ambient face glow when speaking ── */}
            <AnimatePresence>
                {speaking && (
                    <motion.div
                        key="glow"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.06, 1] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            position: "absolute", width: 460, height: 460, borderRadius: "50%",
                            top: "50%", left: "50%", transform: "translate(-50%, -58%)",
                            background: "radial-gradient(circle, rgba(34,211,238,0.11) 0%, rgba(34,130,255,0.04) 45%, transparent 70%)",
                            pointerEvents: "none", zIndex: 3,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ── Sound rings ── */}
            <AnimatePresence>
                {speaking && [0, 0.7, 1.4].map((delay, i) => (
                    <motion.div key={i}
                        initial={{ scale: 0.7, opacity: 0.5 }}
                        animate={{ scale: 1.55, opacity: 0 }}
                        transition={{ duration: 2.8, delay, repeat: Infinity, ease: "easeOut" }}
                        style={{
                            position: "absolute", width: 280, height: 280, borderRadius: "50%",
                            top: "50%", left: "50%", transform: "translate(-50%, -58%)",
                            border: `1px solid rgba(34,211,238,${0.35 - i * 0.08})`,
                            pointerEvents: "none", zIndex: 3,
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* ══════════ SVG AVATAR ══════════ */}
            <svg
                viewBox="-60 -10 360 530"
                style={{
                    width: "min(52vw, 460px)",
                    height: "min(90vh, 700px)",
                    transform: `translateY(${breathY}px) rotate(${headTilt}deg)`,
                    filter: speaking
                        ? "drop-shadow(0 0 32px rgba(34,211,238,0.18)) drop-shadow(0 20px 48px rgba(0,0,0,0.85))"
                        : "drop-shadow(0 20px 48px rgba(0,0,0,0.85))",
                    transition: "filter 0.5s ease",
                    zIndex: 10,
                }}
            >
                <defs>
                    {/* Skin — mature warm tone, less orange */}
                    <radialGradient id="avSkin" cx="38%" cy="24%" r="66%">
                        <stop offset="0%" stopColor="#f2d4a8" />
                        <stop offset="28%" stopColor="#e8bc80" />
                        <stop offset="58%" stopColor="#d4995c" />
                        <stop offset="82%" stopColor="#be8044" />
                        <stop offset="100%" stopColor="#a66830" />
                    </radialGradient>
                    {/* Skin side shadow */}
                    <radialGradient id="avSkinSide" cx="50%" cy="50%" r="55%">
                        <stop offset="0%" stopColor="#cc9050" />
                        <stop offset="100%" stopColor="#8a4c1c" />
                    </radialGradient>
                    {/* Subsurface scatter — very subtle */}
                    <radialGradient id="avSubSurf" cx="45%" cy="35%" r="50%">
                        <stop offset="0%" stopColor="rgba(240,160,90,0.10)" />
                        <stop offset="100%" stopColor="rgba(200,100,50,0.0)" />
                    </radialGradient>
                    {/* Hair — deep charcoal black, no warm tones */}
                    <linearGradient id="avHair" x1="10%" y1="0%" x2="90%" y2="100%">
                        <stop offset="0%" stopColor="#1a1a1e" />
                        <stop offset="45%" stopColor="#111114" />
                        <stop offset="100%" stopColor="#0a0a0c" />
                    </linearGradient>
                    {/* Hair highlight — very subtle cool sheen */}
                    <linearGradient id="avHairHL" x1="20%" y1="0%" x2="60%" y2="80%">
                        <stop offset="0%" stopColor="rgba(180,190,210,0.12)" />
                        <stop offset="40%" stopColor="rgba(140,150,170,0.06)" />
                        <stop offset="100%" stopColor="rgba(80,90,110,0.0)" />
                    </linearGradient>
                    <linearGradient id="avHairSheen" x1="0%" y1="0%" x2="100%" y2="60%">
                        <stop offset="0%" stopColor="rgba(60,65,80,0.0)" />
                        <stop offset="40%" stopColor="rgba(80,88,105,0.18)" />
                        <stop offset="100%" stopColor="rgba(40,44,55,0.0)" />
                    </linearGradient>
                    {/* Suit — charcoal executive */}
                    <linearGradient id="avJacketL" x1="0%" y1="0%" x2="80%" y2="100%">
                        <stop offset="0%" stopColor="#2c2f36" />
                        <stop offset="55%" stopColor="#1f2228" />
                        <stop offset="100%" stopColor="#14161b" />
                    </linearGradient>
                    <linearGradient id="avJacketR" x1="100%" y1="0%" x2="20%" y2="100%">
                        <stop offset="0%" stopColor="#252830" />
                        <stop offset="100%" stopColor="#101216" />
                    </linearGradient>
                    {/* Jacket lapel edge */}
                    <linearGradient id="avJacketEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(150,158,175,0.14)" />
                        <stop offset="100%" stopColor="rgba(80,85,100,0.03)" />
                    </linearGradient>
                    {/* Shirt — crisp white */}
                    <linearGradient id="avShirt" x1="0%" y1="0%" x2="100%" y2="15%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#e8eef4" />
                    </linearGradient>
                    {/* Iris — dark hazel-brown, more mature */}
                    <radialGradient id="avIris" cx="32%" cy="28%" r="68%">
                        <stop offset="0%" stopColor="#7a6040" />
                        <stop offset="35%" stopColor="#4a3820" />
                        <stop offset="70%" stopColor="#2e2010" />
                        <stop offset="100%" stopColor="#180c04" />
                    </radialGradient>
                    {/* Sclera */}
                    <radialGradient id="avSclera" cx="36%" cy="30%" r="66%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="80%" stopColor="#edf0f4" />
                        <stop offset="100%" stopColor="#dde4ec" />
                    </radialGradient>
                    {/* Mouth interior */}
                    <linearGradient id="avMouthIn" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6a1010" />
                        <stop offset="50%" stopColor="#380606" />
                        <stop offset="100%" stopColor="#1e0202" />
                    </linearGradient>
                    <linearGradient id="avTeeth" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f5f2ea" />
                        <stop offset="100%" stopColor="#ccc6b8" />
                    </linearGradient>
                    <linearGradient id="avLlip" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#b86858" />
                        <stop offset="50%" stopColor="#a85848" />
                        <stop offset="100%" stopColor="#904030" />
                    </linearGradient>
                    {/* Upper lip */}
                    <linearGradient id="avUlip" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#aa5848" />
                        <stop offset="100%" stopColor="#8e3e30" />
                    </linearGradient>
                    {/* Neck */}
                    <linearGradient id="avNeck" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a05a2c" />
                        <stop offset="38%" stopColor="#cc9858" />
                        <stop offset="62%" stopColor="#cc9858" />
                        <stop offset="100%" stopColor="#944e22" />
                    </linearGradient>
                    {/* Desk */}
                    <linearGradient id="avDesk" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0f2444" />
                        <stop offset="100%" stopColor="#060f1c" />
                    </linearGradient>
                    {/* Glasses — matte near-black */}
                    <linearGradient id="avGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1a1a1e" />
                        <stop offset="50%" stopColor="#111114" />
                        <stop offset="100%" stopColor="#0d0d10" />
                    </linearGradient>

                    {/* Eye clip paths */}
                    <clipPath id="avEyeL">
                        <ellipse cx="85" cy="117" rx="16" ry={blinking ? 0.8 : 11} />
                    </clipPath>
                    <clipPath id="avEyeR">
                        <ellipse cx="155" cy="117" rx="16" ry={blinking ? 0.8 : 11} />
                    </clipPath>

                    {/* Soft shadow filter */}
                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(0,0,0,0.60)" />
                    </filter>
                    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.35)" />
                    </filter>
                    {/* Rim light filter for face edges */}
                    <filter id="rimLight" x="-15%" y="-15%" width="130%" height="130%">
                        <feDropShadow dx="-2" dy="0" stdDeviation="4" floodColor="rgba(34,130,200,0.14)" />
                    </filter>
                </defs>

                {/* ── Desk ── */}
                <path d="M -60 440 Q 120 422 300 440 L 300 530 L -60 530 Z" fill="url(#avDesk)" />
                <path d="M -60 440 Q 120 417 300 440" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none" />
                {/* Glass desk surface sheen */}
                <path d="M -20 440 Q 120 424 260 440" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none" />

                {/* Desk props */}
                {/* Laptop */}
                <rect x="-30" y="416" width="55" height="32" rx="3" fill="#0c1e3a" opacity="0.85" />
                <rect x="-29" y="417" width="53" height="20" rx="2" fill="#0a1828" />
                {/* Screen glow */}
                <rect x="-28" y="418" width="51" height="18" rx="1.5" fill="#12304e" />
                <rect x="-25" y="420" width="20" height="2" rx="1" fill="rgba(34,211,238,0.4)" />
                <rect x="-25" y="423" width="32" height="1.5" rx="1" fill="rgba(255,255,255,0.12)" />
                <rect x="-25" y="426" width="25" height="1.5" rx="1" fill="rgba(255,255,255,0.08)" />
                {/* Laptop hinge */}
                <rect x="-30" y="446" width="55" height="3" rx="1.5" fill="#081828" />

                {/* Notepad */}
                <rect x="196" y="428" width="40" height="22" rx="2" fill="#f0ede5" opacity="0.12" />
                <line x1="199" y1="433" x2="232" y2="433" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="199" y1="437" x2="228" y2="437" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="199" y1="441" x2="230" y2="441" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Coffee mug */}
                <rect x="220" y="412" width="20" height="24" rx="3" fill="#1a3a5e" opacity="0.75" />
                <path d="M 240 417 Q 248 417 248 424 Q 248 431 240 431" stroke="#1a3a5e" strokeWidth="2.5" fill="none" opacity="0.75" />
                {/* Steam */}
                <path d="M 226 410 Q 228 403 226 396" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M 231 408 Q 233 401 231 394" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeLinecap="round" fill="none" />

                {/* ── Body / Suit ── */}
                {/* ─── SHOULDERS ─── */}
                {/* Left shoulder mass */}
                <path d="M -60 530 L -55 340 Q -40 290 -10 275 Q 20 265 50 268 L 68 270 L 84 278 L 78 340 Z"
                    fill="url(#avJacketL)" />
                {/* Left shoulder cap highlight */}
                <path d="M -10 275 Q 20 265 50 268 L 68 270"
                    stroke="rgba(80,130,220,0.14)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Left shoulder top roll */}
                <ellipse cx="20" cy="272" rx="38" ry="10" fill="rgba(255,255,255,0.04)" />
                {/* Left sleeve body — upper arm */}
                <path d="M -55 340 Q -50 300 -10 290 Q 20 284 50 286 L 68 288 L 78 340"
                    fill="url(#avJacketL)" />

                {/* ── LEFT FOREARM (elbow down) ── */}
                {/* Sleeve lower — forearm */}
                <path d="M -55 340 Q -58 390 -54 430 L -30 435 Q -10 432 10 430 L 22 425 L 22 340 Z"
                    fill="url(#avJacketL)" />
                {/* Sleeve seam left side */}
                <path d="M -55 340 Q -56 385 -52 428" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" fill="none" />
                {/* Shirt cuff — left */}
                <rect x="-52" y="426" width="75" height="14" rx="5"
                    fill="#d8eaf8" opacity="0.9" />
                <rect x="-52" y="426" width="75" height="4" rx="2"
                    fill="rgba(255,255,255,0.4)" />
                {/* Cuff button left */}
                <circle cx="10" cy="433" r="3" fill="#b0c8e0" />
                <circle cx="10" cy="433" r="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />

                {/* Right shoulder mass */}
                <path d="M 300 530 L 295 340 Q 280 290 250 275 Q 220 265 190 268 L 172 270 L 156 278 L 162 340 Z"
                    fill="url(#avJacketR)" />
                {/* Right shoulder cap highlight */}
                <path d="M 250 275 Q 220 265 190 268 L 172 270"
                    stroke="rgba(60,100,180,0.12)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Right shoulder top roll */}
                <ellipse cx="220" cy="272" rx="38" ry="10" fill="rgba(255,255,255,0.03)" />
                {/* Right sleeve body — upper arm */}
                <path d="M 295 340 Q 290 300 250 290 Q 220 284 190 286 L 172 288 L 162 340"
                    fill="url(#avJacketR)" />

                {/* ── RIGHT FOREARM (elbow down) ── */}
                {/* Sleeve lower — forearm */}
                <path d="M 295 340 Q 298 390 294 430 L 270 435 Q 250 432 230 430 L 218 425 L 218 340 Z"
                    fill="url(#avJacketR)" />
                {/* Sleeve seam right side */}
                <path d="M 295 340 Q 296 385 292 428" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" fill="none" />
                {/* Shirt cuff — right */}
                <rect x="217" y="426" width="75" height="14" rx="5"
                    fill="#d8eaf8" opacity="0.9" />
                <rect x="217" y="426" width="75" height="4" rx="2"
                    fill="rgba(255,255,255,0.4)" />
                {/* Cuff button right */}
                <circle cx="230" cy="433" r="3" fill="#b0c8e0" />
                <circle cx="230" cy="433" r="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />

                {/* Left jacket panel */}
                <path d="M -60 530 L 18 295 Q 40 262 68 268 L 84 278 L 120 312 L 78 340 Z" fill="url(#avJacketL)" />
                {/* Right jacket panel */}
                <path d="M 300 530 L 222 295 Q 200 262 172 268 L 156 278 L 120 312 L 162 340 Z" fill="url(#avJacketR)" />
                {/* Bottom jacket fill */}
                <path d="M -60 530 L 78 340 L 120 312 L 162 340 L 300 530 Z" fill="url(#avJacketL)" />
                {/* Jacket edge highlights — subtle charcoal sheen */}
                <path d="M 84 278 L 78 340 L -60 530" stroke="rgba(160,165,175,0.07)" strokeWidth="1.5" fill="none" />
                <path d="M 156 278 L 162 340 L 300 530" stroke="rgba(130,135,148,0.05)" strokeWidth="1.5" fill="none" />
                {/* Jacket fabric texture — very subtle */}
                <path d="M 40 380 Q 80 358 120 362 Q 160 358 200 380" stroke="rgba(255,255,255,0.025)" strokeWidth="22" strokeLinecap="round" fill="none" />
                {/* Elbow bend crease — left */}
                <path d="M -30 385 Q -20 380 -5 382" stroke="rgba(0,0,0,0.15)" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Elbow bend crease — right */}
                <path d="M 245 385 Q 260 380 270 382" stroke="rgba(0,0,0,0.12)" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Shirt */}
                <path d="M 94 268 L 120 302 L 146 268 L 138 255 L 120 262 L 102 255 Z" fill="url(#avShirt)" />
                {/* Shirt shadow fold */}
                <path d="M 120 262 L 120 302" stroke="rgba(140,180,220,0.25)" strokeWidth="1.2" fill="none" />

                {/* Tie — executive deep blue, clean solid silk */}
                <path d="M 113 256 L 127 256 L 124 298 L 120 306 L 116 298 Z" fill="#1e3a8a" />
                <path d="M 120 306 L 112 328 L 120 320 L 128 328 Z" fill="#16306e" />
                {/* Tie silk sheen — single clean highlight */}
                <path d="M 116 260 Q 119 280 121 298" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Tie knot */}
                <path d="M 113 255 L 120 264 L 127 255 L 123 247 L 117 247 Z" fill="#152d6e" />
                <ellipse cx="120" cy="257" rx="4" ry="5" fill="rgba(100,140,220,0.15)" />

                {/* Pocket square — crisp white */}
                <path d="M 46 284 L 60 281 L 63 294 L 49 297 Z" fill="#f8f8f8" opacity="0.85" />
                <path d="M 52 282 L 54 294" stroke="rgba(220,230,240,0.40)" strokeWidth="0.7" fill="none" />

                {/* Collar — crisp white */}
                <path d="M 94 268 L 106 254 L 120 261 L 134 254 L 146 268"
                    stroke="#ffffff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                {/* Collar shadow — very subtle */}
                <path d="M 94 268 L 106 254 L 120 261 L 134 254 L 146 268"
                    stroke="rgba(180,195,210,0.18)" strokeWidth="1" fill="none" strokeLinecap="round" />

                {/* Jacket lapels — sharp charcoal, executive */}
                <path d="M 84 278 Q 70 296 56 324" stroke="rgba(8,10,14,0.82)" strokeWidth="1.6" fill="none" />
                <path d="M 84 278 Q 70 296 56 324" stroke="rgba(200,205,215,0.06)" strokeWidth="2.5" fill="none" />
                <path d="M 156 278 Q 170 296 184 324" stroke="rgba(6,8,12,0.80)" strokeWidth="1.6" fill="none" />
                <path d="M 156 278 Q 170 296 184 324" stroke="rgba(180,185,195,0.05)" strokeWidth="2.5" fill="none" />

                {/* Jacket buttons — dark silver-charcoal */}
                {[314, 336, 358].map((y, i) => (
                    <g key={i}>
                        <circle cx="120" cy={y} r="3.5" fill="#26272c" />
                        <circle cx="120" cy={y} r="3.5" fill="none" stroke="rgba(200,205,215,0.20)" strokeWidth="0.8" />
                        <ellipse cx="119.5" cy={y - 1} rx="1.2" ry="0.8" fill="rgba(255,255,255,0.09)" />
                    </g>
                ))}

                {/* ── Neck ── */}
                <rect x="100" y="245" width="40" height="30" rx="6" fill="url(#avNeck)" />
                {/* Neck shadow sides */}
                <ellipse cx="100" cy="258" rx="5" ry="13" fill="rgba(150,75,30,0.35)" />
                <ellipse cx="140" cy="258" rx="5" ry="13" fill="rgba(120,60,22,0.30)" />

                {/* ── Ears ── */}
                <ellipse cx="65" cy="162" rx="11" ry="15" fill="#d59060" filter="url(#subtleShadow)" />
                <ellipse cx="65" cy="162" rx="6" ry="9" fill="#b87040" />
                <path d="M 65 152 Q 60 162 65 172" stroke="#a86030" strokeWidth="1" fill="none" opacity="0.5" />
                <ellipse cx="175" cy="162" rx="11" ry="15" fill="#d59060" filter="url(#subtleShadow)" />
                <ellipse cx="175" cy="162" rx="6" ry="9" fill="#b87040" />
                <path d="M 175 152 Q 180 162 175 172" stroke="#a86030" strokeWidth="1" fill="none" opacity="0.5" />

                {/* ── Head + Face group ── */}
                <g transform="translate(0, 50)">

                    {/* ══ HAIR drawn FIRST so skin covers the forehead ══ */}

                    {/* Back hair layer — depth */}
                    <path d="M 50 108 Q 44 82 60 50 Q 90 20 120 18 Q 150 20 180 50 Q 196 82 190 108"
                        fill="#090909" />

                    {/* Main hair cap */}
                    <path d="M 50 88 Q 46 62 72 38 Q 96 16 120 14 Q 144 16 168 38 Q 194 62 190 88 Q 172 58 120 52 Q 68 58 50 88 Z"
                        fill="url(#avHair)" />

                    {/* Side volume — LEFT temple */}
                    <path d="M 50 88 Q 42 80 44 58 Q 50 36 72 28 Q 58 50 54 74 Q 51 83 52 96 Z"
                        fill="#0d0d10" />
                    {/* Side volume — RIGHT temple */}
                    <path d="M 190 88 Q 198 80 196 58 Q 190 36 168 28 Q 182 50 186 74 Q 189 83 188 96 Z"
                        fill="#0c0c0f" />

                    {/* Hair volume top — center mound */}
                    <path d="M 82 38 Q 120 22 158 38 Q 140 30 120 28 Q 100 30 82 38 Z"
                        fill="#111116" opacity="0.85" />

                    {/* Side part groove */}
                    <path d="M 76 28 Q 70 38 68 52 Q 66 62 68 72"
                        stroke="#050508" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9" />
                    <path d="M 76 28 Q 70 38 68 52 Q 66 62 68 72"
                        stroke="#1a1a20" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />

                    {/* Hair flow strands — upper area */}
                    <path d="M 68 44 Q 90 34 120 32 Q 150 34 172 44"
                        stroke="rgba(30,32,38,0.58)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <path d="M 68 54 Q 92 46 120 44 Q 148 46 170 54"
                        stroke="rgba(28,30,36,0.42)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                    {/* Fine strand detail — sides */}
                    <path d="M 54 84 Q 66 66 80 52" stroke="rgba(22,22,28,0.52)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                    <path d="M 186 84 Q 174 66 160 52" stroke="rgba(22,22,28,0.46)" strokeWidth="1.1" strokeLinecap="round" fill="none" />

                    {/* Hair sheen overlay */}
                    <path d="M 50 88 Q 46 62 72 38 Q 96 16 120 14 Q 144 16 168 38 Q 194 62 190 88 Q 172 58 120 52 Q 68 58 50 88 Z"
                        fill="url(#avHairSheen)" />

                    {/* Top highlight streak */}
                    <path d="M 80 30 Q 108 20 136 30 Q 118 24 100 25 Z"
                        fill="url(#avHairHL)" opacity="0.8" />

                    {/* Hair sides near ears — taper */}
                    <path d="M 50 88 Q 47 106 49 130 Q 52 110 56 92 Z" fill="#0a0a0d" />
                    <path d="M 190 88 Q 193 106 191 130 Q 188 110 184 92 Z" fill="#0a0a0d" />

                    {/* ══ FACE SKIN — flat forehead, structured masculine shape ══ */}
                    {/* Face: flat forehead line → curved temples → cheekbones → jaw → chin */}
                    <path d="
                        M 68 88
                        L 172 88
                        C 193 90, 194 116, 192 142
                        C 190 160, 174 174, 156 184
                        C 144 193, 132 198, 120 198
                        C 108 198, 96 193, 84 184
                        C 66 174, 50 160, 48 142
                        C 46 116, 47 90, 68 88 Z
                    " fill="url(#avSkin)" filter="url(#softShadow)" />
                    {/* Rim light — same face shape */}
                    <path d="
                        M 68 88
                        L 172 88
                        C 193 90, 194 116, 192 142
                        C 190 160, 174 174, 156 184
                        C 144 193, 132 198, 120 198
                        C 108 198, 96 193, 84 184
                        C 66 174, 50 160, 48 142
                        C 46 116, 47 90, 68 88 Z
                    " fill="none" stroke="rgba(34,130,210,0.10)" strokeWidth="4" filter="url(#rimLight)" />
                    {/* Subsurface scatter */}
                    <path d="
                        M 68 88
                        L 172 88
                        C 193 90, 194 116, 192 142
                        C 190 160, 174 174, 156 184
                        C 144 193, 132 198, 120 198
                        C 108 198, 96 193, 84 184
                        C 66 174, 50 160, 48 142
                        C 46 116, 47 90, 68 88 Z
                    " fill="url(#avSubSurf)" />






                    {/* ── Eyebrows — darker, straighter, exec arch ── */}
                    {/* Left eyebrow */}
                    <path d="M 70 100 Q 85 92 102 97"
                        stroke="#14120e" strokeWidth="4.5" strokeLinecap="round" fill="none"
                        style={{ transform: speaking ? "translateY(-1px)" : "none", transition: "transform 0.3s" }} />
                    <path d="M 71 99 Q 86 91.5 101 96.5"
                        stroke="rgba(55,50,40,0.40)" strokeWidth="1.8" strokeLinecap="round" fill="none"
                        style={{ transform: speaking ? "translateY(-1px)" : "none", transition: "transform 0.3s" }} />
                    {/* Right eyebrow */}
                    <path d="M 138 97 Q 155 92 172 100"
                        stroke="#14120e" strokeWidth="4.5" strokeLinecap="round" fill="none"
                        style={{ transform: speaking ? "translateY(-1px)" : "none", transition: "transform 0.3s" }} />
                    <path d="M 139 96.5 Q 155 91.5 171 99"
                        stroke="rgba(55,50,40,0.40)" strokeWidth="1.8" strokeLinecap="round" fill="none"
                        style={{ transform: speaking ? "translateY(-1px)" : "none", transition: "transform 0.3s" }} />

                    {/* ── Eyes ── */}
                    {/* Left eye white */}
                    <ellipse cx="85" cy="117" rx="16" ry="11" fill="url(#avSclera)" />
                    {/* Left eye shadow (upper) */}
                    <ellipse cx="85" cy="112" rx="15" ry="6" fill="rgba(60,30,10,0.12)" />
                    <g clipPath="url(#avEyeL)">
                        {/* Iris */}
                        <ellipse cx={85 + gazeX * 0.5} cy={117 + gazeY * 0.4} rx="9.5" ry="9.5" fill="url(#avIris)" />
                        {/* Limbal ring */}
                        <circle cx={85 + gazeX * 0.5} cy={117 + gazeY * 0.4} r="9.4" fill="none" stroke="rgba(10,20,50,0.65)" strokeWidth="1.4" />
                        {/* Iris rays */}
                        <line x1="79" y1="112" x2="77" y2="109" stroke="rgba(60,120,200,0.18)" strokeWidth="0.8" />
                        <line x1="91" y1="112" x2="93" y2="109" stroke="rgba(60,120,200,0.15)" strokeWidth="0.8" />
                        {/* Pupil — follows gaze */}
                        <ellipse cx={85 + gazeX * 0.7} cy={117 + gazeY * 0.6} rx="5.8" ry="5.8" fill="#060810" />

                        {/* ── Refined Eye Highlights — Mature Glints ── */}
                        {/* Main sharp glint — very small, realistic */}
                        <circle cx={81 + gazeX * 0.45} cy={114 + gazeY * 0.35} r="1.2" fill="rgba(255,255,255,0.85)" />
                        {/* Faint 'window' reflection */}
                        <rect x={86 + gazeX * 0.4} y={118 + gazeY * 0.3} width="4" height="3" rx="1"
                            fill="rgba(255,255,255,0.15)" transform={`rotate(-15, ${88 + gazeX * 0.4}, ${119.5 + gazeY * 0.3})`} />
                        {/* Subtle blue environment catchlight */}
                        <circle cx={88 + gazeX * 0.35} cy={115 + gazeY * 0.25} r="0.8" fill="rgba(180,220,255,0.35)" />
                    </g>
                    {/* Left eyelid crease */}
                    <path d="M 69 117 Q 85 104 101 117" stroke="#a86a38" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                    {/* Left lower lid */}
                    <path d="M 70 119 Q 85 127 100 119" stroke="#a86030" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45" />
                    {/* Left lashes — reduced size */}
                    {[-2.5, -1.6, -0.6, 0.6, 1.6, 2.5].map((i, idx) => (
                        <line key={idx}
                            x1={85 + i * 4.9} y1="108" x2={85 + i * 5.2} y2={104 + Math.abs(i) * 0.3}
                            stroke="#120a02" strokeWidth="1.2" strokeLinecap="round" />
                    ))}
                    {/* Left lower lashes */}
                    {[-1.5, 0, 1.5].map((i, idx) => (
                        <line key={idx}
                            x1={85 + i * 5.5} y1="126" x2={85 + i * 5.8} y2="130"
                            stroke="rgba(18,10,2,0.5)" strokeWidth="0.9" strokeLinecap="round" />
                    ))}

                    {/* Right eye white */}
                    <ellipse cx="155" cy="117" rx="16" ry="11" fill="url(#avSclera)" />
                    {/* Right eye shadow (upper) */}
                    <ellipse cx="155" cy="112" rx="15" ry="6" fill="rgba(60,30,10,0.12)" />
                    <g clipPath="url(#avEyeR)">
                        <ellipse cx={155 + gazeX * 0.5} cy={117 + gazeY * 0.4} rx="9.5" ry="9.5" fill="url(#avIris)" />
                        {/* Limbal ring */}
                        <circle cx={155 + gazeX * 0.5} cy={117 + gazeY * 0.4} r="9.4" fill="none" stroke="rgba(10,20,50,0.65)" strokeWidth="1.4" />
                        {/* Iris rays */}
                        <line x1="149" y1="112" x2="147" y2="109" stroke="rgba(60,120,200,0.18)" strokeWidth="0.8" />
                        <line x1="161" y1="112" x2="163" y2="109" stroke="rgba(60,120,200,0.15)" strokeWidth="0.8" />
                        {/* Pupil — follows gaze */}
                        <ellipse cx={155 + gazeX * 0.7} cy={117 + gazeY * 0.6} rx="5.8" ry="5.8" fill="#060810" />

                        {/* ── Refined Eye Highlights — Mature Glints ── */}
                        <circle cx={151 + gazeX * 0.45} cy={114 + gazeY * 0.35} r="1.2" fill="rgba(255,255,255,0.85)" />
                        <rect x={156 + gazeX * 0.4} y={118 + gazeY * 0.3} width="4" height="3" rx="1"
                            fill="rgba(255,255,255,0.15)" transform={`rotate(-15, ${158 + gazeX * 0.4}, ${119.5 + gazeY * 0.3})`} />
                        <circle cx={158 + gazeX * 0.35} cy={115 + gazeY * 0.25} r="0.8" fill="rgba(180,220,255,0.35)" />
                    </g>
                    <path d="M 139 117 Q 155 104 171 117" stroke="#a86a38" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                    <path d="M 140 119 Q 155 127 170 119" stroke="#a86030" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45" />
                    {[-2.5, -1.6, -0.6, 0.6, 1.6, 2.5].map((i, idx) => (
                        <line key={idx}
                            x1={155 + i * 4.9} y1="108" x2={155 + i * 5.2} y2={100 + Math.abs(i) * 0.5}
                            stroke="#120a02" strokeWidth="1.5" strokeLinecap="round" />
                    ))}
                    {[-1.5, 0, 1.5].map((i, idx) => (
                        <line key={idx}
                            x1={155 + i * 5.5} y1="126" x2={155 + i * 5.8} y2="130"
                            stroke="rgba(18,10,2,0.5)" strokeWidth="0.9" strokeLinecap="round" />
                    ))}

                    {/* ── Glasses — thin matte black executive frames ── */}
                    {/* Left lens — thinner, slightly rectangular */}
                    <rect x="68" y="109" width="36" height="18" rx="4" fill="none"
                        stroke="url(#avGlass)" strokeWidth="1.6" />
                    {/* Right lens */}
                    <rect x="136" y="109" width="36" height="18" rx="4" fill="none"
                        stroke="url(#avGlass)" strokeWidth="1.6" />
                    {/* Nose bridge — thin and clean */}
                    <path d="M 104 117 Q 112 114 120 117 Q 128 114 136 117"
                        stroke="#111114" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    {/* Temple arms */}
                    <path d="M 68 117 Q 58 117 52 120" stroke="#111114" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                    <path d="M 172 117 Q 182 117 188 120" stroke="#111114" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                    {/* Minimal lens highlight — very subtle */}
                    <path d="M 72 112 Q 78 110 84 112" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" strokeLinecap="round" fill="none" />
                    <path d="M 140 112 Q 146 110 152 112" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" strokeLinecap="round" fill="none" />

                    {/* ── Nose ── */}
                    <path d="M 115 122 Q 110 144 106 155 Q 120 160 134 155 Q 130 144 125 122"
                        fill="none" stroke="rgba(170,82,28,0.48)" strokeWidth="1.8" strokeLinecap="round" />
                    {/* Nostrils */}



                    {/* Nasolabial folds */}
                    <path d="M 98 152 Q 92 163 96 174" stroke="rgba(158,78,28,0.22)" strokeWidth="1.5" fill="none" />
                    <path d="M 142 152 Q 148 163 144 174" stroke="rgba(158,78,28,0.22)" strokeWidth="1.5" fill="none" />



                    {/* ── Mouth ── */}
                    <g transform="translate(120, 172)">
                        {/* Interior */}
                        {o > 0.05 && (
                            <path d={`M -29 0 Q 0 ${ulArcY + 3} 29 0 Q ${21 + o * 4} ${llArcY} 0 ${llArcY + o * 2} Q ${-(21 + o * 4)} ${llArcY} -29 0 Z`}
                                fill="url(#avMouthIn)" />
                        )}
                        {/* Teeth */}
                        {o > 0.16 && (
                            <path d={`M -23 0 Q 0 ${ulArcY + 1} 23 0 L 22 ${jawDrop * 0.38} Q 0 ${jawDrop * 0.44} -22 ${jawDrop * 0.38} Z`}
                                fill="url(#avTeeth)" />
                        )}
                        {/* Tongue on wide vowels */}
                        {o > 0.55 && (
                            <ellipse cx="0" cy={jawDrop * 0.62} rx={14} ry={jawDrop * 0.28} fill="#c06060" opacity="0.80" />
                        )}
                        {/* Upper lip — Cupid's bow */}
                        <path d={`M -29 0 C -17 ${ulArcY - 3}, -7 ${ulArcY - 9}, 0 ${ulArcY - 7} C 7 ${ulArcY - 9}, 17 ${ulArcY - 3}, 29 0 L 23 0 Q 0 ${ulArcY + 3} -23 0 Z`}
                            fill="#c26054" />
                        {/* Cupid's bow dip */}
                        <path d={`M -8 ${ulArcY - 6} Q 0 ${ulArcY - 11} 8 ${ulArcY - 6}`}
                            stroke="#a03e36" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                        {/* Lower lip */}
                        <path d={`M -29 0 Q ${-(21 + o * 5)} ${llArcY - 2} 0 ${llArcY + 2} Q ${21 + o * 5} ${llArcY - 2} 29 0 L 24 0 Q 0 ${llArcY - 4 + jawDrop * 0.4} -24 0 Z`}
                            fill="url(#avLlip)" />


                    </g>

                    {/* ── Chin dimple ── */}
                    <path d="M 117 183 Q 120 187 123 183"
                        stroke="rgba(158,78,28,0.30)" strokeWidth="1.3" strokeLinecap="round" fill="none" />

                    {/* ══ FACIAL HAIR ══ */}

                    {/* Mustache — clean executive shape */}
                    {/* Left wing */}
                    <path d="M 91 166 Q 100 162 110 165 Q 108 168 98 169 Q 93 169 91 166 Z"
                        fill="rgba(18,16,14,0.78)" />
                    {/* Right wing */}
                    <path d="M 149 166 Q 140 162 130 165 Q 132 168 142 169 Q 147 169 149 166 Z"
                        fill="rgba(18,16,14,0.74)" />
                    {/* Mustache center dip */}
                    <path d="M 110 165 Q 115 167 120 165 Q 125 167 130 165"
                        stroke="rgba(14,12,10,0.30)" strokeWidth="1" fill="none" strokeLinecap="round" />
                    {/* Philtrum shadow under nose */}
                    <path d="M 112 163 Q 120 165 128 163"
                        stroke="rgba(10,8,6,0.20)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    {/* Sideburns — left */}
                    <path d="M 52 118 Q 50 136 54 152 Q 56 158 60 162"
                        stroke="rgba(18,16,14,0.38)" strokeWidth="7" strokeLinecap="round" fill="none" />
                    <path d="M 52 118 Q 50 136 54 152 Q 56 158 60 162"
                        stroke="rgba(12,10,8,0.18)" strokeWidth="12" strokeLinecap="round" fill="none" />
                    {/* Sideburns — right */}
                    <path d="M 188 118 Q 190 136 186 152 Q 184 158 180 162"
                        stroke="rgba(18,16,14,0.34)" strokeWidth="7" strokeLinecap="round" fill="none" />
                    <path d="M 188 118 Q 190 136 186 152 Q 184 158 180 162"
                        stroke="rgba(12,10,8,0.16)" strokeWidth="12" strokeLinecap="round" fill="none" />

                    {/* ── Mature Executive Beard — Final High Density ── */}
                    {/* Level 1: Wide fade layer */}
                    <path d="
                        M 54 148 
                        C 52 176, 64 192, 84 188 
                        C 98 198, 110 202, 120 202 
                        C 130 202, 142 198, 156 188 
                        C 176 192, 188 176, 186 148 
                        L 172 148 
                        C 174 168, 162 184, 150 182 
                        C 140 190, 130 194, 120 194 
                        C 110 194, 100 190, 90 182 
                        C 76 184, 66 168, 68 148 Z
                    " fill="rgba(12,10,8,0.28)" />

                    {/* Level 2: Mid coverage / Connection */}
                    <path d="
                        M 56 154 
                        C 54 176, 66 190, 84 186 
                        C 98 195, 110 200, 120 200 
                        C 130 200, 142 195, 156 186 
                        C 174 190, 186 176, 184 154 
                        L 174 154 
                        C 176 170, 164 182, 150 180 
                        C 140 188, 130 192, 120 192 
                        C 110 192, 100 188, 90 180 
                        C 76 182, 64 170, 66 154 Z
                    " fill="rgba(14,12,10,0.45)" />

                    {/* Level 3: Core mass */}
                    <path d="
                        M 60 162 
                        C 58 178, 68 188, 84 184 
                        C 96 193, 108 198, 120 198 
                        C 132 198, 144 193, 156 184 
                        C 172 188, 182 178, 180 162 
                        L 170 162 
                        C 172 172, 162 180, 150 178 
                        C 140 185, 130 188, 120 188 
                        C 110 188, 100 185, 90 178 
                        C 78 180, 68 172, 70 162 Z
                    " fill="rgba(10,8,6,0.78)" />

                    {/* Soul patch */}
                    <path d="M 110 184 Q 120 190 130 184 Q 120 194 110 184 Z" fill="rgba(8,6,4,0.85)" />

                    {/* Enhanced follicle texture — doubled density */}
                    {[
                        [85, 182], [100, 192], [120, 194], [140, 192], [155, 182],
                        [75, 172], [90, 185], [120, 190], [150, 185], [165, 172],
                        [110, 196], [130, 196], [95, 188], [145, 188], [80, 178], [160, 178],
                        [115, 197], [125, 197], [105, 190], [135, 190], [100, 200], [140, 200],
                        [70, 165], [170, 165], [82, 190], [158, 190], [120, 200], [110, 201], [130, 201],
                        [65, 155], [175, 155], [58, 148], [182, 148]
                    ].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="1.3" fill="rgba(6,4,2,0.30)" />
                    ))}



                </g> {/* end head+face group */}

                {/* ── Speaking dot ── */}
                {speaking && (
                    <circle cx="120" cy="22" r="6" fill="#22d3ee">
                        <animate attributeName="r" values="6;9;6" dur="0.9s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0.15;0.9" dur="0.9s" repeatCount="indefinite" />
                    </circle>
                )}
            </svg>

            {/* ── Name plate ── */}
            <div style={{
                position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
                zIndex: 20, textAlign: "center", pointerEvents: "none",
            }}>
                <div style={{
                    fontSize: 15, fontWeight: 700, letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.92)", fontFamily: "Inter, system-ui, sans-serif",
                    textShadow: "0 2px 12px rgba(34,130,255,0.4)",
                }}>Alex Morgan</div>
                <div style={{
                    fontSize: 10, fontWeight: 500, letterSpacing: "0.12em",
                    color: "rgba(100,180,255,0.70)", fontFamily: "Inter, system-ui, sans-serif",
                    textTransform: "uppercase", marginTop: 2,
                }}>AI Senior Interviewer</div>
            </div>

            {/* ── Status chip with audio wave ── */}
            <motion.div
                animate={{
                    borderColor: speaking ? "rgba(34,211,238,0.55)" : "rgba(255,255,255,0.08)",
                    boxShadow: speaking ? "0 0 24px rgba(34,211,238,0.12)" : "none",
                }}
                transition={{ duration: 0.4 }}
                style={{
                    position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 22px", borderRadius: 999,
                    background: "rgba(6,14,30,0.94)", border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)", whiteSpace: "nowrap", zIndex: 20,
                }}
            >
                {/* Dot indicator */}
                <motion.span
                    animate={{
                        backgroundColor: speaking ? "#22d3ee" : "#334155",
                        boxShadow: speaking ? "0 0 10px rgba(34,211,238,0.9)" : "none",
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0 }}
                />
                {/* Audio wave bars */}
                <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 20 }}>
                    {waveHeights.map((h, i) => (
                        <motion.div
                            key={i}
                            animate={{ height: h }}
                            transition={{ duration: 0.09, ease: "easeOut" }}
                            style={{
                                width: 3, borderRadius: 4, flexShrink: 0,
                                background: speaking
                                    ? `rgba(34,211,238,${0.5 + i * 0.1})`
                                    : "rgba(100,116,139,0.35)",
                            }}
                        />
                    ))}
                </div>
                <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                    color: speaking ? "#22d3ee" : "#64748b",
                    fontFamily: "Inter, system-ui, sans-serif",
                    transition: "color 0.3s",
                }}>
                    {speaking ? "Speaking\u2026" : "Ready"}
                </span>
            </motion.div>

            {/* ── Bottom vignette ── */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(to top, #020817 0%, rgba(2,8,23,0.35) 25%, transparent 46%)",
                zIndex: 5,
            }} />
        </motion.div>
    );
}

/* ── Rich office background ── */
function OfficeBackground() {
    return (
        <svg
            viewBox="0 0 900 640"
            preserveAspectRatio="xMidYMid slice"
            style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                zIndex: 1,
            }}
        >
            <defs>
                {/* Wall warm gradient */}
                <linearGradient id="offWall" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1a1008" />
                    <stop offset="55%" stopColor="#150e07" />
                    <stop offset="100%" stopColor="#0d0904" />
                </linearGradient>
                {/* Window sky — golden hour */}
                <linearGradient id="offSky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0a1628" />
                    <stop offset="35%" stopColor="#0e1f3a" />
                    <stop offset="70%" stopColor="#162840" />
                    <stop offset="100%" stopColor="#1a2a30" />
                </linearGradient>
                {/* Window warm glow */}
                <radialGradient id="offWinGlow" cx="50%" cy="80%" r="60%">
                    <stop offset="0%" stopColor="rgba(255,180,80,0.22)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                {/* Floor wood */}
                <linearGradient id="offFloor" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1c1005" />
                    <stop offset="100%" stopColor="#0e0803" />
                </linearGradient>
                {/* Ceiling light warm cone */}
                <radialGradient id="offLight1" cx="30%" cy="0%" r="70%">
                    <stop offset="0%" stopColor="rgba(255,210,140,0.18)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="offLight2" cx="70%" cy="0%" r="65%">
                    <stop offset="0%" stopColor="rgba(255,200,120,0.14)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                {/* Desk surface */}
                <linearGradient id="offDesk" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3a1f06" />
                    <stop offset="40%" stopColor="#2e1804" />
                    <stop offset="100%" stopColor="#1e1003" />
                </linearGradient>
                {/* Monitor glow */}
                <radialGradient id="offMonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(34,180,220,0.55)" />
                    <stop offset="100%" stopColor="rgba(10,60,100,0.10)" />
                </radialGradient>
                {/* Shelf wood */}
                <linearGradient id="offShelf" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2a1508" />
                    <stop offset="50%" stopColor="#341a08" />
                    <stop offset="100%" stopColor="#241208" />
                </linearGradient>
                {/* Ambient room glow from window */}
                <radialGradient id="offAmbient" cx="25%" cy="45%" r="40%">
                    <stop offset="0%" stopColor="rgba(20,80,160,0.12)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                {/* Ceiling */}
                <linearGradient id="offCeil" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#120c04" />
                    <stop offset="100%" stopColor="#1c1208" />
                </linearGradient>
                {/* Crown molding */}
                <linearGradient id="offMold" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2e1e0a" />
                    <stop offset="100%" stopColor="#1e1408" />
                </linearGradient>
            </defs>

            {/* ── Ceiling ── */}
            <rect x="0" y="0" width="900" height="80" fill="url(#offCeil)" />
            {/* Crown molding strip */}
            <rect x="0" y="76" width="900" height="12" rx="3" fill="url(#offMold)" />
            <rect x="0" y="83" width="900" height="2" fill="rgba(255,200,120,0.08)" />

            {/* ── Back wall ── */}
            <rect x="0" y="88" width="900" height="440" fill="url(#offWall)" />

            {/* Subtle wall panel lines — wainscoting */}
            {[200, 500, 730].map((x, i) => (
                <rect key={i} x={x} y="105" width="2" height="370" rx="1"
                    fill="rgba(255,180,80,0.05)" />
            ))}
            {/* Horizontal rail */}
            <rect x="0" y="280" width="900" height="5" rx="1" fill="rgba(255,180,80,0.06)" />
            <rect x="0" y="278" width="900" height="1" fill="rgba(255,180,80,0.04)" />

            {/* ── Warm ceiling light cones ── */}
            <rect x="0" y="0" width="900" height="640" fill="url(#offLight1)" />
            <rect x="0" y="0" width="900" height="640" fill="url(#offLight2)" />

            {/* ── Ceiling light fixtures ── */}
            {/* Left fixture */}
            <rect x="230" y="76" width="60" height="8" rx="4" fill="#2a1c08" />
            <rect x="240" y="84" width="40" height="5" rx="2" fill="rgba(255,220,160,0.85)" />
            <ellipse cx="260" cy="90" rx="30" ry="12" fill="rgba(255,210,140,0.12)" />
            {/* Right fixture */}
            <rect x="610" y="76" width="60" height="8" rx="4" fill="#2a1c08" />
            <rect x="620" y="84" width="40" height="5" rx="2" fill="rgba(255,220,160,0.85)" />
            <ellipse cx="640" cy="90" rx="30" ry="12" fill="rgba(255,210,140,0.12)" />

            {/* ── Large window — left side ── */}
            {/* Window frame outer */}
            <rect x="38" y="108" width="230" height="310" rx="5"
                fill="#1e1208" stroke="rgba(255,180,80,0.12)" strokeWidth="3" />
            {/* Window glass */}
            <rect x="48" y="118" width="210" height="290" rx="3" fill="url(#offSky)" />
            {/* Sky ambient glow */}
            <rect x="48" y="118" width="210" height="290" rx="3" fill="url(#offWinGlow)" />

            {/* City skyline silhouette inside window */}
            <g clipPath="url(#winClip)">
                <defs>
                    <clipPath id="winClip">
                        <rect x="48" y="118" width="210" height="290" rx="3" />
                    </clipPath>
                </defs>
                {/* Stars */}
                {[{ x: 62, y: 128 }, { x: 80, y: 134 }, { x: 105, y: 122 }, { x: 130, y: 130 }, { x: 155, y: 125 }, { x: 172, y: 135 }, { x: 195, y: 128 }, { x: 218, y: 132 }, { x: 240, y: 127 }].map((s, i) => (
                    <circle key={i} cx={s.x} cy={s.y} r="0.8" fill="rgba(255,255,255,0.7)" />
                ))}
                {/* Distant city buildings */}
                {[
                    { x: 50, y: 260, w: 20, h: 150 },
                    { x: 72, y: 240, w: 16, h: 170 },
                    { x: 90, y: 268, w: 22, h: 142 },
                    { x: 114, y: 248, w: 18, h: 162 },
                    { x: 134, y: 255, w: 24, h: 155 },
                    { x: 160, y: 243, w: 16, h: 167 },
                    { x: 178, y: 258, w: 20, h: 152 },
                    { x: 200, y: 250, w: 18, h: 160 },
                    { x: 220, y: 262, w: 22, h: 148 },
                    { x: 244, y: 245, w: 16, h: 165 },
                ].map(({ x, y, w, h }, i) => (
                    <rect key={i} x={x} y={y} width={w} height={h}
                        fill={`rgba(8,20,45,${0.7 + i % 3 * 0.08})`} />
                ))}
                {/* City window lights */}
                {[
                    { x: 54, y: 270 }, { x: 58, y: 282 }, { x: 75, y: 255 }, { x: 79, y: 268 }, { x: 92, y: 278 },
                    { x: 96, y: 290 }, { x: 116, y: 262 }, { x: 120, y: 276 }, { x: 136, y: 265 }, { x: 140, y: 280 },
                    { x: 163, y: 252 }, { x: 167, y: 265 }, { x: 181, y: 268 }, { x: 185, y: 282 }, { x: 203, y: 258 },
                    { x: 207, y: 272 }, { x: 222, y: 270 }, { x: 226, y: 284 }, { x: 246, y: 254 }, { x: 250, y: 268 },
                ].map((p, i) => (
                    <rect key={i} x={p.x} y={p.y} width="2.5" height="3.5" rx="0.5"
                        fill={i % 3 === 0 ? "rgba(255,220,140,0.8)" : i % 3 === 1 ? "rgba(180,220,255,0.6)" : "rgba(255,200,100,0.7)"} />
                ))}
                {/* Horizon glow */}
                <rect x="48" y="350" width="210" height="60" fill="rgba(255,120,60,0.06)" />
                <rect x="48" y="380" width="210" height="30" fill="rgba(255,160,80,0.10)" />
            </g>

            {/* Window frame dividers */}
            <line x1="153" y1="118" x2="153" y2="408" stroke="rgba(255,180,80,0.12)" strokeWidth="2.5" />
            <line x1="48" y1="263" x2="258" y2="263" stroke="rgba(255,180,80,0.12)" strokeWidth="2.5" />
            {/* Window sill */}
            <rect x="32" y="408" width="242" height="14" rx="3" fill="#241608" />
            <rect x="32" y="408" width="242" height="4" rx="1" fill="rgba(255,200,120,0.08)" />

            {/* Light shafts from window */}
            <polygon points="48,118 258,118 420,520 200,520"
                fill="rgba(30,100,200,0.03)" />
            <polygon points="100,118 210,118 340,520 280,520"
                fill="rgba(20,80,160,0.025)" />

            {/* Window ambient glow on wall */}
            <rect x="0" y="0" width="900" height="640" fill="url(#offAmbient)" />

            {/* ── Bookshelf — right side ── */}
            {/* Back panel */}
            <rect x="660" y="98" width="225" height="380" rx="4"
                fill="url(#offShelf)" stroke="rgba(255,180,80,0.08)" strokeWidth="2" />
            {/* Inner back */}
            <rect x="668" y="106" width="210" height="366" fill="rgba(0,0,0,0.35)" />

            {/* Shelf planks */}
            {[190, 280, 365].map((y, i) => (
                <g key={i}>
                    <rect x="660" y={y} width="225" height="10" rx="2"
                        fill="#3a1e08" stroke="rgba(255,180,80,0.06)" strokeWidth="1" />
                    <rect x="660" y={y} width="225" height="2"
                        fill="rgba(255,200,120,0.1)" />
                </g>
            ))}

            {/* Books — Row 1 (top) */}
            {[
                { x: 672, w: 15, h: 78, c: "#1e3d72" },
                { x: 689, w: 20, h: 83, c: "#7a1824" },
                { x: 711, w: 13, h: 76, c: "#1a4028" },
                { x: 726, w: 18, h: 80, c: "#3a1868" },
                { x: 746, w: 16, h: 82, c: "#1e3a5e" },
                { x: 764, w: 22, h: 77, c: "#5a1818" },
                { x: 788, w: 14, h: 79, c: "#1a3e2a" },
                { x: 804, w: 17, h: 81, c: "#181848" },
                { x: 823, w: 19, h: 76, c: "#2a1a5a" },
                { x: 844, w: 13, h: 80, c: "#401818" },
                { x: 859, w: 18, h: 78, c: "#1e3060" },
            ].map(({ x, w, h, c }, i) => (
                <g key={i}>
                    <rect x={x} y={190 - h} width={w} height={h} rx="1"
                        fill={c} stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" />
                    {/* Spine highlight */}
                    <rect x={x} y={190 - h} width="2" height={h}
                        fill="rgba(255,255,255,0.07)" />
                </g>
            ))}

            {/* Books — Row 2 */}
            {[
                { x: 670, w: 18, h: 68, c: "#2a1050" },
                { x: 690, w: 14, h: 72, c: "#1e3a60" },
                { x: 706, w: 22, h: 65, c: "#601820" },
                { x: 730, w: 16, h: 70, c: "#1a4030" },
                { x: 748, w: 20, h: 67, c: "#1c1c50" },
                { x: 770, w: 15, h: 69, c: "#1e3a5e" },
                { x: 787, w: 18, h: 72, c: "#3a1820" },
                { x: 807, w: 12, h: 66, c: "#204020" },
                { x: 821, w: 20, h: 70, c: "#1a1850" },
                { x: 843, w: 16, h: 68, c: "#501820" },
                { x: 861, w: 17, h: 71, c: "#1a3850" },
            ].map(({ x, w, h, c }, i) => (
                <g key={i}>
                    <rect x={x} y={280 - h} width={w} height={h} rx="1"
                        fill={c} stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" />
                    <rect x={x} y={280 - h} width="2" height={h}
                        fill="rgba(255,255,255,0.06)" />
                </g>
            ))}

            {/* Decorative items — Row 3 */}
            {/* Small trophy */}
            <rect x="675" y="340" width="18" height="22" rx="2" fill="#c8960c" opacity="0.7" />
            <rect x="672" y="362" width="24" height="4" rx="1" fill="#a07808" opacity="0.7" />
            <ellipse cx="684" cy="335" rx="9" ry="7" fill="#d4a010" opacity="0.65" />
            {/* Small globe */}
            <circle cx="720" cy="347" r="14" fill="none" stroke="rgba(34,180,255,0.3)" strokeWidth="1.5" />
            <circle cx="720" cy="347" r="12" fill="rgba(18,50,100,0.6)" />
            <ellipse cx="720" cy="347" rx="12" ry="4" fill="none" stroke="rgba(34,180,255,0.2)" strokeWidth="1" />
            <line x1="720" y1="335" x2="720" y2="359" stroke="rgba(34,180,255,0.2)" strokeWidth="0.8" />
            {/* File folder stack */}
            <rect x="748" y="340" width="30" height="4" rx="1" fill="#c8960c" opacity="0.5" />
            <rect x="750" y="336" width="28" height="4" rx="1" fill="#1e3a70" opacity="0.7" />
            <rect x="752" y="330" width="26" height="6" rx="1" fill="#1a3060" opacity="0.8" />

            {/* Framed diploma/certificate on wall — center */}
            <rect x="340" y="115" width="110" height="85" rx="4"
                fill="#1e1208" stroke="rgba(255,180,80,0.14)" strokeWidth="2.5" />
            <rect x="346" y="121" width="98" height="73" rx="3" fill="#0d0a04" />
            <rect x="350" y="125" width="90" height="65" rx="2"
                fill="none" stroke="rgba(200,160,80,0.18)" strokeWidth="1" />
            {/* Diploma text lines */}
            <rect x="360" y="135" width="70" height="3" rx="1" fill="rgba(200,160,80,0.25)" />
            <rect x="368" y="142" width="54" height="2" rx="1" fill="rgba(200,160,80,0.15)" />
            <rect x="356" y="150" width="78" height="8" rx="1" fill="rgba(200,160,80,0.12)" />
            <rect x="362" y="162" width="66" height="2" rx="1" fill="rgba(200,160,80,0.10)" />
            <rect x="366" y="168" width="58" height="2" rx="1" fill="rgba(200,160,80,0.10)" />
            {/* Seal */}
            <circle cx="395" cy="178" r="6" fill="none" stroke="rgba(200,160,80,0.22)" strokeWidth="1" />
            <circle cx="395" cy="178" r="3.5" fill="rgba(200,160,80,0.12)" />

            {/* Second frame — smaller on wall */}
            <rect x="480" y="125" width="72" height="56" rx="3"
                fill="#1c1108" stroke="rgba(255,180,80,0.10)" strokeWidth="2" />
            <rect x="485" y="130" width="62" height="46" rx="2" fill="rgba(10,30,60,0.6)" />
            {/* Abstract art lines */}
            <line x1="490" y1="155" x2="542" y2="145" stroke="rgba(34,211,238,0.25)" strokeWidth="1.2" />
            <line x1="490" y1="162" x2="542" y2="158" stroke="rgba(200,160,80,0.2)" strokeWidth="1" />
            <circle cx="516" cy="148" r="8" fill="none" stroke="rgba(34,211,238,0.18)" strokeWidth="1" />

            {/* ── Desk in front ── */}
            {/* Desk surface */}
            <rect x="-20" y="510" width="940" height="50" rx="5" fill="url(#offDesk)" />
            {/* Desk top edge highlight */}
            <rect x="-20" y="510" width="940" height="4" rx="2" fill="rgba(255,200,120,0.12)" />
            {/* Desk front face */}
            <rect x="-20" y="560" width="940" height="80" fill="#1a0e04" />
            {/* Desk side legs */}
            <rect x="20" y="556" width="28" height="84" rx="3" fill="#140c04" />
            <rect x="852" y="556" width="28" height="84" rx="3" fill="#140c04" />

            {/* Monitor on desk */}
            <rect x="340" y="420" width="170" height="98" rx="4"
                fill="#0c0806" stroke="rgba(255,180,80,0.06)" strokeWidth="1.5" />
            <rect x="346" y="426" width="158" height="86" rx="3" fill="url(#offMonGlow)" />
            {/* Monitor stand */}
            <rect x="418" y="518" width="14" height="8" rx="2" fill="#0c0806" />
            <rect x="406" y="526" width="38" height="5" rx="2" fill="#0c0806" />
            {/* Screen content hints */}
            <rect x="352" y="435" width="90" height="4" rx="1" fill="rgba(34,180,220,0.35)" />
            <rect x="352" y="443" width="70" height="3" rx="1" fill="rgba(34,180,220,0.2)" />
            <rect x="352" y="450" width="80" height="3" rx="1" fill="rgba(34,180,220,0.2)" />
            <rect x="352" y="458" width="60" height="3" rx="1" fill="rgba(34,180,220,0.15)" />
            <rect x="352" y="466" width="75" height="3" rx="1" fill="rgba(34,180,220,0.15)" />
            {/* Screen glow reflection on desk */}
            <ellipse cx="425" cy="514" rx="55" ry="6"
                fill="rgba(34,180,220,0.07)" />

            {/* Desk items — notepad */}
            <rect x="530" y="496" width="55" height="20" rx="2"
                fill="#f5f0e0" opacity="0.12" />
            <rect x="533" y="500" width="42" height="2" rx="0.5" fill="rgba(0,0,0,0.15)" />
            <rect x="533" y="505" width="36" height="2" rx="0.5" fill="rgba(0,0,0,0.12)" />
            <rect x="533" y="510" width="40" height="2" rx="0.5" fill="rgba(0,0,0,0.12)" />
            {/* Pen */}
            <rect x="590" y="497" width="3" height="22" rx="1.5" fill="rgba(255,200,100,0.3)" />

            {/* Coffee mug */}
            <rect x="620" y="492" width="22" height="24" rx="4" fill="#1a1208" stroke="rgba(255,180,80,0.18)" strokeWidth="1.2" />
            <path d="M 642 500 Q 650 500 650 508 Q 650 516 642 516" fill="none"
                stroke="rgba(255,180,80,0.18)" strokeWidth="2" strokeLinecap="round" />
            {/* Coffee steam */}
            <path d="M 628 490 Q 631 484 628 478" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 634 490 Q 637 483 634 477" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* ── Plant — left near window ── */}
            {/* Pot */}
            <rect x="272" y="490" width="36" height="28" rx="4" fill="#3a1a08" stroke="rgba(255,180,80,0.1)" strokeWidth="1" />
            <rect x="268" y="488" width="44" height="8" rx="3" fill="#2a1408" />
            {/* Soil */}
            <ellipse cx="290" cy="490" rx="17" ry="4" fill="#1a0c04" />
            {/* Leaves */}
            <path d="M 290 488 Q 270 460 262 436" stroke="#1a4020" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M 290 488 Q 300 455 318 438" stroke="#1e4828" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M 290 488 Q 282 458 268 450" stroke="#163820" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 290 488 Q 302 462 308 455" stroke="#1c4220" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 290 488 Q 292 465 290 458" stroke="#1a4020" strokeWidth="5" strokeLinecap="round" fill="none" />

            {/* ── Floor ── */}
            <rect x="0" y="556" width="900" height="84" fill="url(#offFloor)" />
            {/* Floor wood grain lines */}
            {[10, 25, 42, 60, 78].map((y, i) => (
                <line key={i} x1="0" y1={556 + y} x2="900" y2={556 + y}
                    stroke="rgba(255,180,80,0.03)" strokeWidth="1" />
            ))}
            {/* Floor reflection */}
            <rect x="300" y="556" width="300" height="84"
                fill="rgba(34,180,220,0.025)" />

            {/* ── Overall warm ambient overlay ── */}
            <rect x="0" y="0" width="900" height="640"
                fill="rgba(30,15,5,0.18)" />
        </svg>
    );
}
