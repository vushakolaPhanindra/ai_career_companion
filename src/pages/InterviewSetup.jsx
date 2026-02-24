import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { extractTextFromPDF } from "../utils/pdfUtils";
import { analyzeTextNLP } from "../services/aiService";
import {
    Upload,
    FileText,
    CheckCircle,
    ArrowRight,
    Loader2,
    AlertCircle,
    Info,
    Sparkles,
    ShieldCheck,
    Mic2,
    Briefcase,
    Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILE_SIZE_MB = 10;
const DEFAULT_RESUME = "I am a motivated professional with experience in software development and project management.";

export default function InterviewSetup() {
    const [setupMode, setSetupMode] = useState("resume");
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [extractedSkills, setExtractedSkills] = useState([]);

    const navigate = useNavigate();

    const handleFileChange = useCallback(async (file) => {
        if (!file) return;
        if (file.type !== "application/pdf") {
            setError("Please upload a PDF file.");
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }

        setError("");
        setLoading(true);
        try {
            const text = await extractTextFromPDF(file);
            const skills = analyzeTextNLP(text);
            setResumeText(text);
            setResumeFile(file);
            setExtractedSkills(skills);
            if (!jobTitle) setJobTitle("Professional Candidate");
        } catch (err) {
            setError("Failed to process PDF. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [jobTitle]);

    const handleStartInterview = () => {
        if (setupMode === "resume" && !resumeText) {
            setError("Please upload your resume to start.");
            return;
        }
        if (setupMode === "manual" && (!jobTitle.trim() || !jobDescription.trim())) {
            setError("Please provide both the Job Title and Description.");
            return;
        }

        const interviewData = {
            jobTitle: jobTitle.trim() || "General Role",
            jobDescription: jobDescription.trim() || "Standard professional interview assessment.",
            resumeText: resumeText || DEFAULT_RESUME,
            extractedSkills,
            setupMode,
            startTime: new Date().toISOString()
        };

        navigate(`/interview/${Date.now()}`, { state: interviewData });
    };

    const isReady = setupMode === "resume" ? (resumeText && !loading) : (jobTitle.trim() && jobDescription.trim() && !loading);

    const containerVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                when: "beforeChildren",
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
    };

    return (
        <div className="min-h-screen bg-[#050b18] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden pt-12 pb-24 px-6">

            {/* Animated Background Image & Effects */}
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-luminosity"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2560&q=80')"
                }}
            />
            {/* Dark Overlay Layer */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#050b14]/90 via-[#0a1128]/80 to-[#010409]/90 backdrop-blur-sm" />

            {/* Subtle Abstract Neural Particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[85vh]">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full flex flex-col items-center"
                >
                    {/* Header Section */}
                    <motion.div variants={itemVariants} className="text-center mb-16 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Sparkles className="w-3.5 h-3.5" />
                            Next-Generation AI Evaluation
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-white leading-tight">
                            Configure your <br />
                            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">Interview Simulation.</span>
                        </h1>

                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                            Upload your resume or enter the job details to generate a personalized AI interview simulation tailored to your profile.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="w-full max-w-3xl">
                        {/* Centered Configuration Panel */}
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-8 md:p-12 relative">
                            {/* Premium Accent Line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />
                            {/* Mode Toggle */}
                            <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/[0.05] mb-10 w-fit mx-auto md:mx-0">
                                <button
                                    onClick={() => { setSetupMode("resume"); setError(""); }}
                                    className={`px-8 py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${setupMode === "resume" ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]" : "text-white/60 hover:text-white hover:bg-white/[0.05]"}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Resume Mode
                                </button>
                                <button
                                    onClick={() => { setSetupMode("manual"); setError(""); }}
                                    className={`px-8 py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${setupMode === "manual" ? "bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)]" : "text-white/60 hover:text-white hover:bg-white/[0.05]"}`}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Manual Entry
                                </button>
                            </div>

                            {/* Dynamic Input States */}
                            <div className="min-h-[300px]">
                                <AnimatePresence mode="wait">
                                    {setupMode === "resume" ? (
                                        <motion.div
                                            key="resume"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="space-y-6"
                                        >
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 text-transparent file:hidden"
                                                    onChange={(e) => handleFileChange(e.target.files[0])}
                                                    title=""
                                                />
                                                <div className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center text-center transition-all duration-300 ${resumeFile ? "bg-indigo-500/5 border-indigo-500/30" : "bg-black/20 border-white/10 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/[0.02]"}`}>
                                                    {loading ? (
                                                        <div className="space-y-4">
                                                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                                                            <p className="text-blue-400 font-bold animate-pulse uppercase tracking-widest text-xs">Analyzing Resume...</p>
                                                        </div>
                                                    ) : resumeFile ? (
                                                        <div className="space-y-4">
                                                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mx-auto">
                                                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h3 className="text-xl font-bold text-white">{resumeFile.name}</h3>
                                                                <p className="text-slate-500 text-sm">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Analysis Complete</p>
                                                            </div>

                                                            {extractedSkills.length > 0 && (
                                                                <div className="pt-4 space-y-3">
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detected Skills & Expertise</p>
                                                                    <div className="flex flex-wrap justify-center gap-2">
                                                                        {extractedSkills.map((skill) => (
                                                                            <motion.span
                                                                                key={skill}
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-[10px] font-bold uppercase tracking-widest"
                                                                            >
                                                                                {skill}
                                                                            </motion.span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="pt-4">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setResumeFile(null); setResumeText(""); setExtractedSkills([]); }}
                                                                    className="text-xs text-red-400/60 font-bold hover:text-red-400 transition-colors uppercase tracking-widest"
                                                                >
                                                                    Change File
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-6">
                                                            <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_30px_rgba(99,102,241,0)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                                                <Upload className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h3 className="text-2xl font-black text-white tracking-tight">Upload your Resume</h3>
                                                                <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">Drop your CV here or click to browse. We only support PDF format for best analysis.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="manual"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-6">
                                                <div className="space-y-2 group">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Target Job Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Senior Software Engineer"
                                                        value={jobTitle}
                                                        onChange={(e) => setJobTitle(e.target.value)}
                                                        className="w-full bg-black/20 border border-white/[0.05] rounded-2xl px-6 py-4 focus:border-indigo-500/50 hover:border-white/[0.1] focus:bg-white/[0.02] outline-none transition-all text-white placeholder:text-slate-600 font-medium shadow-[0_0_0_transparent] focus:shadow-[0_0_20px_rgba(79,70,229,0.15)]"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Job Description or Skills</label>
                                                    <textarea
                                                        rows={6}
                                                        placeholder="Paste the job requirements or the key skills you want to be interviewed on..."
                                                        value={jobDescription}
                                                        onChange={(e) => setJobDescription(e.target.value)}
                                                        className="w-full bg-black/20 border border-white/[0.05] rounded-[2rem] px-6 py-6 focus:border-indigo-500/50 hover:border-white/[0.1] focus:bg-white/[0.02] outline-none transition-all text-white placeholder:text-slate-600 font-medium shadow-[0_0_0_transparent] focus:shadow-[0_0_20px_rgba(79,70,229,0.15)] resize-none custom-scrollbar"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-8 overflow-hidden"
                                    >
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm font-medium">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Start Button */}
                            <motion.div variants={itemVariants} className="mt-12">
                                <motion.button
                                    whileHover={isReady ? { scale: 1.01, boxShadow: "0 0 35px rgba(79,70,229,0.5)" } : {}}
                                    whileTap={isReady ? { scale: 0.98 } : {}}
                                    disabled={!isReady || loading}
                                    onClick={handleStartInterview}
                                    className={`w-full py-5 rounded-2xl text-[15px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group
                                            ${isReady
                                            ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-white/10"
                                            : "bg-black/40 text-white/30 border border-white/5 cursor-not-allowed"}`}
                                >
                                    {isReady && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />}
                                    <span className="relative z-10 flex items-center gap-3">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                        {loading ? "System Processing..." : "Initialize Interview Environment"}
                                        {!loading && <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isReady ? "translate-x-1" : "opacity-0"}`} />}
                                    </span>
                                </motion.button>
                                <p className="mt-5 text-center text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                    Candidate Data is encrypted and private
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}
