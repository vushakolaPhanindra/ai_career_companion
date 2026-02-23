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

    return (
        <div className="min-h-screen bg-[#050b18] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden pt-12 pb-24 px-6">

            {/* Background Aesthetic */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 max-w-5xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI-Powered Interview Coach
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white"
                    >
                        Prepare for your <span className="text-blue-500">Dream Career.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg max-w-2xl mx-auto"
                    >
                        Upload your resume or enter the job details to generate a personalized AI interview simulation tailored to your profile.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Panel: Configuration */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-8 md:p-10"
                        >
                            {/* Mode Toggle */}
                            <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-white/5 mb-10 w-fit">
                                <button
                                    onClick={() => { setSetupMode("resume"); setError(""); }}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${setupMode === "resume" ? "bg-blue-600 text-white shadow-lg" : "text-white/60 hover:text-white"}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Resume Mode
                                </button>
                                <button
                                    onClick={() => { setSetupMode("manual"); setError(""); }}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${setupMode === "manual" ? "bg-blue-600 text-white shadow-lg" : "text-white/60 hover:text-white"}`}
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
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => handleFileChange(e.target.files[0])}
                                                />
                                                <div className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center text-center transition-all duration-300 ${resumeFile ? "bg-blue-600/5 border-blue-500/30" : "bg-slate-950/30 border-white/10 group-hover:border-blue-500/50"}`}>
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
                                                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mx-auto group-hover:scale-110 transition-transform">
                                                                <Upload className="w-8 h-8 text-blue-500" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h3 className="text-xl font-bold text-white">Upload your Resume</h3>
                                                                <p className="text-slate-500 text-sm max-w-sm mx-auto">Drop your CV here or click to browse. We only support PDF format for best analysis.</p>
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
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Target Job Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Senior Software Engineer"
                                                        value={jobTitle}
                                                        onChange={(e) => setJobTitle(e.target.value)}
                                                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500/50 focus:outline-none focus:bg-slate-950 transition-all text-white font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Job Description or Skills</label>
                                                    <textarea
                                                        rows={6}
                                                        placeholder="Paste the job requirements or the key skills you want to be interviewed on..."
                                                        value={jobDescription}
                                                        onChange={(e) => setJobDescription(e.target.value)}
                                                        className="w-full bg-slate-950/60 border border-white/10 rounded-3xl px-6 py-6 focus:border-blue-500/50 focus:outline-none focus:bg-slate-950 transition-all text-white resize-none"
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
                            <div className="mt-12">
                                <button
                                    disabled={!isReady || loading}
                                    onClick={handleStartInterview}
                                    className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 
                                        ${isReady
                                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                            : "bg-slate-800 text-white/50 border border-white/5 cursor-not-allowed"}`}
                                >
                                    {loading ? "System Processing..." : "Start Interview Simulation"}
                                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isReady ? "translate-x-1" : "opacity-0"}`} />
                                </button>
                                <p className="mt-4 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                    Candidate Data is encrypted and private
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Panel: Supplementary Info */}
                    <aside className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-8"
                        >
                            <div className="space-y-2">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-400" />
                                    Preparation Tips
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Our AI uses advanced NLP to analyze your profile and the job role to simulate a realistic interview experience.
                                </p>
                            </div>

                            <ul className="space-y-6">
                                {[
                                    { title: "Personalized Questions", desc: "Questions are generated based on your resume's unique skill set.", icon: Target },
                                    { title: "Real-time Feedback", desc: "Get a detailed score and suggestions for improvement immediately.", icon: Mic2 },
                                    { title: "Simulation Environment", desc: "Realistic one-on-one session to build your confidence.", icon: ShieldCheck }
                                ].map((tip, idx) => (
                                    <li key={idx} className="flex gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <tip.icon className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-white text-sm font-bold tracking-tight">{tip.title}</h4>
                                            <p className="text-slate-500 text-xs leading-relaxed">{tip.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-6 border-t border-white/5">
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 italic text-[11px] text-slate-400 leading-relaxed font-medium">
                                    "Practice makes permanent. Use this session to refine your story and eliminate filler words before the real interview."
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-900/20 border border-white/5 rounded-[2rem] p-6 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-tighter">AI Core Ready</span>
                            </div>
                            <span className="text-[10px] font-bold text-white/20">v4.0.2</span>
                        </motion.div>
                    </aside>
                </div>

                {/* Footer Copyright/Info */}
                <div className="mt-20 text-center space-y-2 opacity-30">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Integrated Career Companion Protocol</p>
                    <p className="text-[9px] font-medium">&copy; 2026 AI Career. All rights reserved.</p>
                </div>
            </main>
        </div>
    );
}
