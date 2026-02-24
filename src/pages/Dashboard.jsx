import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Rocket, BarChart3 } from "lucide-react";

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        try {
            setLoading(true);
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#050b14] flex flex-col p-6 relative overflow-hidden font-sans text-slate-300">
            {/* Animated Background Image & Effects */}
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=2560&q=80')"
                }}
            />
            {/* Dark Overlay Layer */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#050b14]/90 via-[#0a1128]/80 to-[#010409]/90 backdrop-blur-sm" />

            {/* Subtle Abstract Neural Particles */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen translate-x-[-30%] translate-y-[-20%]"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[90px] mix-blend-screen translate-x-[30%] translate-y-[30%]"
                />
            </div>

            {/* Main Content Wrapper */}
            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col flex-1">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-xl font-bold shadow-lg text-white">
                            {currentUser?.displayName?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                Welcome back, {currentUser?.displayName || currentUser?.email?.split('@')[0] || "User"}
                            </h1>
                            <p className="text-white/50 text-sm mt-1">
                                Ready to sharpen your interview skills?
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white/10 hover:bg-red-500/20 text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                        <LogOut className="w-4 h-4" />
                        {loading ? "Logging out..." : "Logout"}
                    </button>
                </div>

                {/* MAIN ACTION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* NEW INTERVIEW */}
                    <motion.div
                        whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(59,130,246,0.15)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/setup")}
                        className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 cursor-pointer shadow-xl hover:border-blue-500/40 transition-all flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <Rocket className="w-8 h-8 text-blue-400" />
                            <span className="text-xs text-white/40 uppercase tracking-wider">
                                Start
                            </span>
                        </div>

                        <h2 className="text-xl font-semibold mb-2">
                            New Interview Session
                        </h2>

                        <p className="text-white/50 text-sm leading-relaxed">
                            Launch a personalized AI-powered mock interview based on your resume and job role.
                        </p>
                    </motion.div>

                    {/* VIEW HISTORY */}
                    <motion.div
                        whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(16,185,129,0.15)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/history")}
                        className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 cursor-pointer shadow-xl hover:border-emerald-500/40 transition-all flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <BarChart3 className="w-8 h-8 text-emerald-400" />
                            <span className="text-xs text-white/40 uppercase tracking-wider">
                                Analyze
                            </span>
                        </div>

                        <h2 className="text-xl font-semibold mb-2">
                            Interview History
                        </h2>

                        <p className="text-white/50 text-sm leading-relaxed">
                            Review past sessions, track improvement, and analyze your performance growth.
                        </p>
                    </motion.div>
                </div>

                {/* FOOTER SECTION */}
                <div className="mt-auto pt-16 pb-4 text-center text-slate-500 text-xs font-medium">
                    AI Career Companion • Your Personal AI Interview Coach © {new Date().getFullYear()}
                </div>

            </div> {/* Close Main Content Wrapper */}
        </div>
    );
}