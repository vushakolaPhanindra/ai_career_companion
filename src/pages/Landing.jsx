import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Mic,
    Brain,
    BarChart,
    Sparkles,
    ShieldCheck,
    Play
} from "lucide-react";

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans overflow-x-hidden selection:bg-blue-500/30">

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-6 py-4 transition-all duration-300">
                <div className="flex justify-between items-center w-full max-w-7xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            AI Career Companion
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/login")}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] text-sm flex items-center gap-2 backdrop-blur-sm"
                        >
                            Login / Sign Up
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative pt-32 pb-20">

                {/* Animated Background Orbs */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            transform: ['translate(0%, 0%) scale(1)', 'translate(5%, 5%) scale(1.1)', 'translate(-5%, -5%) scale(0.9)', 'translate(0%, 0%) scale(1)'],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen"
                    />
                    <motion.div
                        animate={{
                            transform: ['translate(0%, 0%) scale(1)', 'translate(-5%, 10%) scale(1.2)', 'translate(5%, -10%) scale(0.8)', 'translate(0%, 0%) scale(1)'],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-5xl space-y-10 mt-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 shadow-xl">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-sm font-medium text-white/80">AI Interview Generation Engine Live</span>
                    </div>

                    <h2 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tight text-white mb-6">
                        Ace Every Interview with
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl">
                            AI Career Companion
                        </span>
                    </h2>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
                        Experience hyper-realistic AI-powered mock interviews. Get instant,
                        actionable feedback on your technical skills, and communication style.
                    </p>

                    <div className="flex justify-center gap-6 mt-12 flex-wrap items-center">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 255, 255, 0.2)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/login")}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all backdrop-blur-sm"
                        >
                            Start Free Interview
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* FEATURE GRID */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-7xl w-full px-6"
                >
                    <FeatureCard
                        icon={<Brain className="w-8 h-8 text-blue-400" />}
                        title="Adaptive AI Engine"
                        desc="Dynamic questions generated contextually based on your resume, experience level, and the precise target job role."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={<Mic className="w-8 h-8 text-emerald-400" />}
                        title="Real Voice Interaction"
                        desc="Engage in a natural, flowing voice conversation with our low-latency AI interviewer possessing emotional intelligence."
                        delay={0.5}
                    />
                    <FeatureCard
                        icon={<BarChart className="w-8 h-8 text-indigo-400" />}
                        title="Intelligent Analytics"
                        desc="Receive deeply structured feedback, scoring rubrics, and highly actionable insights to perfect your interview delivery."
                        delay={0.6}
                    />
                </motion.div>

                {/* TRUST SECTION */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-24 pt-10 border-t border-white/5 w-full max-w-4xl text-center text-slate-400 text-sm mb-16"
                >
                    <div className="flex items-center justify-center gap-8 flex-wrap">
                        <span className="flex items-center gap-2 font-medium">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            Secure & Private
                        </span>
                        <span className="flex items-center gap-2 font-medium">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            AI-Powered Personalization
                        </span>
                    </div>
                </motion.div>
            </main>

            {/* FOOTER */}
            <footer className="py-8 text-center text-slate-500 text-sm mt-auto z-10 border-t border-white/5 bg-white/5">
                © {new Date().getFullYear()} AI Career Companion • Your Personal AI Interview Coach
            </footer>
        </div>
    );
};

function FeatureCard({ icon, title, desc, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:border-white/10 hover:bg-white/[0.04] transition-all relative overflow-hidden group text-left flex flex-col items-start"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                {icon}
            </div>
            <h3 className="text-2xl font-semibold mb-4 tracking-tight text-white">{title}</h3>
            <p className="text-slate-400 text-base leading-relaxed">{desc}</p>
        </motion.div>
    );
}

export default Landing;