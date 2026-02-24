import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Brain, Github, Mail } from "lucide-react";

const ROLES = [
    "Software Engineer",
    "AIML Engineer",
    "Data Analyst",
    "Full Stack Developer"
];

const Landing = () => {
    const navigate = useNavigate();
    const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentRoleIndex((prev) => (prev + 1) % ROLES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans overflow-x-hidden selection:bg-indigo-500/30 flex flex-col">

            {/* Animated Background Image & Effects */}
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=2560&q=80')"
                }}
            />
            {/* Dark Overlay Layer */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#050b14]/90 via-[#0a1128]/80 to-[#010409]/90 backdrop-blur-sm" />

            {/* Subtle Abstract Neural Particles */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 flex flex-col flex-1">

                {/* NAVBAR */}
                <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-6 py-4 transition-all duration-300">
                    <div className="flex justify-between items-center w-full max-w-7xl bg-[#0a1128]/70 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-3 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <Brain className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-tight">
                                AI Career Companion
                            </h1>
                        </div>

                        <div className="flex items-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/login")}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2"
                            >
                                Sign In / Register
                            </motion.button>
                        </div>
                    </div>
                </nav>

                {/* HERO SECTION */}
                <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 max-w-7xl mx-auto w-full text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8 max-w-4xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 backdrop-blur-sm text-indigo-300 text-sm font-medium mb-4">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            Next-Gen Interview AI
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                            Ace Every Interview with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                                AI Career Companion
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                            AI-powered mock interviews with real-time feedback on technical skills and communication. Prepare for:
                        </p>

                        {/* Typing Effect */}
                        <div className="h-12 flex justify-center items-center">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={currentRoleIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-2xl md:text-3xl font-semibold text-emerald-400"
                                >
                                    {ROLES[currentRoleIndex]}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/login")}
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all"
                            >
                                Start Free Interview
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                </main>

                {/* FOOTER */}
                <footer className="py-8 border-t border-white/10 bg-[#0a1128]/50 backdrop-blur-md mt-auto">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <Brain className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span className="font-bold text-white tracking-tight">AI Career Companion</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                        <div className="flex gap-4 text-slate-400">
                            <a href="#" className="hover:text-indigo-400 transition-colors bg-white/5 p-2 rounded-lg border border-white/5 hover:border-indigo-500/30">
                                <Github className="w-4 h-4" />
                            </a>
                            <a href="#" className="hover:text-indigo-400 transition-colors bg-white/5 p-2 rounded-lg border border-white/5 hover:border-indigo-500/30">
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <p>Built for the future of career preparation.</p>
                        <p>AI Career Companion © {new Date().getFullYear()}</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Landing;