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
        <div className="min-h-screen bg-slate-950 text-white p-6">

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
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/setup")}
                    className="bg-slate-900 border border-white/10 rounded-2xl p-8 cursor-pointer shadow-xl hover:border-blue-500/40 transition"
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
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/history")}
                    className="bg-slate-900 border border-white/10 rounded-2xl p-8 cursor-pointer shadow-xl hover:border-emerald-500/40 transition"
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
            <div className="mt-16 text-center text-white/30 text-xs">
                AI Career Companion • Your Personal AI Interview Coach
            </div>

        </div>
    );
}