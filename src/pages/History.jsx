import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getUserInterviews, deleteInterview } from "../services/db";
import { ArrowLeft, Clock, Search, ChevronRight, BarChart3, Filter, ShieldAlert, BadgeInfo, Trash2, X } from "lucide-react";

export default function History() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // State
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initial Fetch
    useEffect(() => {
        async function fetchHistory() {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                // This implicitly drops duplicates and sorts by client side via db.js modification
                const data = await getUserInterviews(currentUser.uid);
                setInterviews(data);
            } catch (err) {
                console.error("Failed to load history:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [currentUser]);

    // Filtering & Sorting
    const filteredInterviews = useMemo(() => {
        return interviews.filter(session => {
            if (!searchTerm) return true;
            return session.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [interviews, searchTerm]);

    // Delete flow
    const handleDelete = async () => {
        if (!showDeleteModal) return;
        setIsDeleting(true);
        try {
            const success = await deleteInterview(currentUser.uid, showDeleteModal);
            if (success) {
                setInterviews(prev => prev.filter(i => i.id !== showDeleteModal));
            }
        } catch (e) {
            console.error("Failed to delete", e);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(null);
        }
    }

    const getScoreBadge = (score) => {
        if (score >= 4.5) return { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" };
        if (score >= 3.5) return { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-500/20" };
        return { color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-500/20" };
    }

    // Helper: Skeleton Loader
    const SkeletonCard = () => (
        <div className="bg-[#0a0f1c]/80 border border-white/[0.04] p-6 rounded-[20px] shadow-sm animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="w-3/5 h-6 bg-white/5 rounded-md" />
                <div className="w-12 h-6 bg-white/5 rounded-md" />
            </div>
            <div className="w-1/3 h-4 bg-white/5 rounded-md mb-6" />
            <div className="border-t border-white/5 pt-4">
                <div className="w-1/4 h-4 bg-white/5 rounded-md" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 relative">

            {/* Ambient Backgound (Subtle) */}
            <div className="fixed inset-0 pointer-events-none flex justify-center items-center opacity-40">
                <div className="w-[60vw] h-[60vw] bg-indigo-900/10 mix-blend-screen blur-[120px] rounded-full absolute top-[-20%] right-[-10%]" />
                <div className="w-[50vw] h-[50vw] bg-teal-900/10 mix-blend-screen blur-[100px] rounded-full absolute bottom-[-10%] justify-start" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 w-full mt-4">
                {/* Header & Nav */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="w-10 h-10 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-300" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Interview Records</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Review your past performance and analyze feedback.</p>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="relative w-full md:w-auto flex items-center gap-3">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-sm font-semibold transition-colors text-slate-300">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="w-full">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : interviews.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-2xl mx-auto mt-20 p-10 bg-[#0a0f1c]/50 border border-white/[0.05] rounded-[24px] text-center backdrop-blur-md"
                        >
                            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <BarChart3 className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">No Interviews Yet</h2>
                            <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto">
                                You haven't completed any mock interviews. Start a new session to calibrate your skills.
                            </p>
                            <button
                                onClick={() => navigate("/setup")}
                                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] text-white"
                            >
                                Launch New Interview
                            </button>
                        </motion.div>
                    ) : filteredInterviews.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <Search className="w-10 h-10 mx-auto mb-4 opacity-50" />
                            <p>No interviews found matching "{searchTerm}"</p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                        >
                            {filteredInterviews.map((session) => {
                                // Default visualization fallbacks
                                const rawScore = Number(session.score) || 0;
                                // We scale standard out of 10 to out of 5 for visually appealing badge logic
                                const scoreScale = (rawScore > 5 ? rawScore / 2 : rawScore).toFixed(1);

                                const timeObj = new Date(session.createdAt || session.date || Date.now());
                                const badgeStyle = getScoreBadge(scoreScale);

                                // Approx duration based on question count (2 min per question)
                                const qCount = session.history?.length || 5;
                                const durationMin = qCount * 2;

                                return (
                                    <motion.div
                                        key={session.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -4 }}
                                        className="bg-[#0a0f1c]/90 border border-white/[0.06] rounded-[24px] p-6 shadow-xl flex flex-col justify-between group overflow-hidden relative cursor-pointer"
                                        onClick={() => navigate(`/report/${session.id}`, { state: session })}
                                    >
                                        {/* Hover Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        <div className="relative z-10 w-full mb-8">
                                            <div className="flex justify-between items-start mb-3 gap-2">
                                                <h3 className="text-lg font-black text-white leading-tight line-clamp-2" title={session.jobTitle || "Role Unknown"}>
                                                    {session.jobTitle || "Role Unknown"}
                                                </h3>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Score Badge */}
                                                    <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-bold ${badgeStyle.bg} ${badgeStyle.color} ${badgeStyle.border} shadow-sm`}>
                                                        <span className="text-xs">Score</span>
                                                        <span className="text-[15px]">{scoreScale}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center flex-wrap gap-4 text-xs font-medium text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {timeObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-70 border-l border-white/10 pl-4">
                                                    ~{durationMin} Min
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 w-full flex items-center justify-between border-t border-white/[0.06] pt-4 mt-auto">
                                            <div className="flex items-center text-indigo-400 font-semibold text-sm group-hover:text-indigo-300 transition-colors">
                                                View Complete Report
                                                <ChevronRight className="w-4 h-4 ml-1 translate-x-0 group-hover:translate-x-1 transition-transform" />
                                            </div>

                                            {/* Delete Action - Prevents bubbling to card navigate */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowDeleteModal(session.id); }}
                                                className="w-8 h-8 rounded-lg bg-transparent hover:bg-rose-500/10 flex items-center justify-center text-slate-600 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-colors shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* DELETE MODAL */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
                            onClick={() => setShowDeleteModal(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-[#0f172a] border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
                        >
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                                <ShieldAlert className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete Interview Record?</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Are you sure you want to permanently delete this interview? This action cannot be reversed and statistics will be lost.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
