import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getInterviewById } from "../services/db";
import { motion, AnimatePresence } from "framer-motion";
import html2pdf from "html2pdf.js";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    CartesianGrid
} from "recharts";
import {
    Download,
    Calendar,
    Briefcase,
    Activity,
    Target,
    Zap,
    MessageSquare,
    LayoutDashboard,
    BrainCircuit,
    CheckCircle,
    TrendingUp,
    Sparkles,
    Award,
    Share2,
    Loader2,
    ArrowRight
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 120, damping: 20 }
    }
};

// --- PREMIUM COMPONENTS ---
const PremiumCard = ({ children, className = "", hover = true }) => (
    <motion.div
        variants={itemVariants}
        whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
        className={`bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden relative group ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-cyan-500/[0.02] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10">{children}</div>
    </motion.div>
);

const GlowingBadge = ({ icon: Icon, label, value, colorClass, bgClass }) => (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/[0.05] backdrop-blur-md ${bgClass}`}>
        <div className={`p-2.5 rounded-xl bg-white/[0.05] ${colorClass}`}>
            {Icon && <Icon className="w-4 h-4" />}
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#94a3b8] font-bold">{label}</span>
            <span className="text-sm font-black text-white tracking-wide">{value}</span>
        </div>
    </div>
);

// --- MAIN PAGE ---
export default function Report() {
    const { state } = useLocation();
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [fetchedData, setFetchedData] = useState(null);
    const [loading, setLoading] = useState(!state && id && id !== 'session-123');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!state && id && id !== 'session-123' && currentUser) {
            getInterviewById(currentUser.uid, id).then(res => {
                if (res) setFetchedData(res);
                setLoading(false);
            }).catch(e => {
                console.error("Failed to fetch report context:", e);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [state, id, currentUser]);

    // Fallback Mock Data
    const data = useMemo(() => {
        const sourceData = state || fetchedData || {
            score: 8.8,
            jobTitle: "Senior AI Engineer",
            date: new Date().toISOString(),
            history: [
                {
                    question: "Can you explain the Transformer architecture and why self-attention is critical for LLMs?",
                    answer: "The Transformer relies entirely on attention mechanisms, discarding recurrence and convolutions. Self-attention allows the model to weigh the importance of different words in a sequence, regardless of their positional distance, enabling parallelization and capturing long-range dependencies efficiently.",
                    evaluation: {
                        score: 9.5,
                        techAccuracy: 10,
                        communication: 9,
                        confidence: 9,
                        clarity: 10,
                        feedback: "Excellent and concise explanation. You correctly identified the shift away from RNNs/CNNs and highlighted parallelization as a key benefit.",
                        improvements: "Could briefly mention multi-head attention to show deeper architectural knowledge.",
                        matchedSkills: ["Transformer", "Self-Attention", "LLMs", "Deep Learning"]
                    }
                },
                {
                    question: "How would you handle a situation where your model is heavily overfitting the training data?",
                    answer: "I would first look at adding regularization techniques like dropout or weight decay. Then, I'd consider data augmentation to artificially expand the dataset. If the problem persists, implementing early stopping during training and evaluating on a holdout validation set is crucial. Sometimes, simply reducing the model complexity helps too.",
                    evaluation: {
                        score: 8.5,
                        techAccuracy: 9,
                        communication: 8,
                        confidence: 8,
                        clarity: 9,
                        feedback: "Very practical and structured troubleshooting approach. You covered both data-centric and model-centric solutions.",
                        improvements: "Mentioning specific diagnostic tools like learning curves would solidify the methodology.",
                        matchedSkills: ["Regularization", "Data Augmentation", "Model Tuning"]
                    }
                },
                {
                    question: "Describe a challenging technical disagreement with a colleague and how you resolved it.",
                    answer: "We disagreed on the framework for a new microservice. I preferred FastAPI for its async features, while my colleague favored Flask for simplicity. We decided to do a time-boxed sprint to build a quick PoC in both. The benchmarks showed FastAPI handling our expected concurrent loads much better, so the data made the decision for us.",
                    evaluation: {
                        score: 9.0,
                        techAccuracy: 8,
                        communication: 10,
                        confidence: 9,
                        clarity: 9,
                        feedback: "Great behavioral response. Using a PoC to let data drive the decision demonstrates maturity and objective problem-solving.",
                        improvements: "None. It's perfectly structured using the STAR method implicitly.",
                        matchedSkills: ["Conflict Resolution", "Communication", "FastAPI", "Benchmarking"]
                    }
                }
            ]
        };

        return {
            ...sourceData,
            score: Number(sourceData.score) || 0
        };
    }, [state]);

    const handleDownloadPdf = async () => {
        setIsExporting(true);
        const element = document.getElementById('report-container');

        // Ensure we have a valid element and data
        const safeJobTitle = data?.jobTitle ? data.jobTitle.replace(/\s+/g, '_') : 'Candidate';

        const opt = {
            margin: [0.3, 0], // Top and Bottom margins, 0 for left/right to span fully
            filename: `AI_Evaluation_${safeJobTitle}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: '#020617', // Match the deep space background
                scrollY: -window.scrollY, // Fix blank pages when scrolled
                onclone: (clonedDoc) => {
                    // FIX: html2canvas crashes on modern CSS colors like oklab, oklch, and color-mix
                    const tmpCanvas = document.createElement('canvas');
                    tmpCanvas.width = 1;
                    tmpCanvas.height = 1;
                    const tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });
                    const win = clonedDoc.defaultView || window;

                    const colorProps = ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'fill', 'stroke'];
                    const fxProps = ['backgroundImage', 'boxShadow', 'textShadow'];

                    clonedDoc.querySelectorAll('*').forEach(el => {
                        const style = win.getComputedStyle(el);

                        colorProps.forEach(prop => {
                            const val = style[prop];
                            if (val && (val.includes('oklab') || val.includes('oklch') || val.includes('color-mix'))) {
                                tmpCtx.clearRect(0, 0, 1, 1);
                                tmpCtx.fillStyle = val;
                                tmpCtx.fillRect(0, 0, 1, 1);
                                const d = tmpCtx.getImageData(0, 0, 1, 1).data;
                                el.style[prop] = `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${d[3] / 255})`;
                            }
                        });

                        fxProps.forEach(prop => {
                            const val = style[prop];
                            if (val && (val.includes('oklab') || val.includes('oklch') || val.includes('color-mix'))) {
                                el.style[prop] = 'none'; // Safer to just remove gradients/shadows that cause hard crashes
                            }
                        });
                    });
                }
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        try {
            // In Vite/ESM environments, html2pdf might be wrapped in a 'default' property
            const pdfGenerator = typeof html2pdf === 'function' ? html2pdf : (html2pdf.default || html2pdf);
            await pdfGenerator().set(opt).from(element).save();
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Error downloading PDF: " + (error?.message || "Unknown error"));
        } finally {
            setIsExporting(false);
        }
    };

    // Data Processing
    const stats = useMemo(() => {
        const hist = data.history || [];
        const count = hist.length || 1;

        const getAvg = (key) => {
            const sum = hist.reduce((acc, q) => acc + (q.evaluation?.[key] || 7), 0);
            return (sum / count) * 10;
        };

        const timelineData = hist.map((q, i) => ({
            name: `Q${i + 1}`,
            score: (q.evaluation?.score || 7.5) * 10,
            tech: (q.evaluation?.techAccuracy || 7) * 10,
        }));

        return {
            tech: getAvg('techAccuracy'),
            comm: getAvg('communication'),
            conf: getAvg('confidence'),
            clar: getAvg('clarity'),
            prep: getAvg('score'),
            timeline: timelineData,
            allSkills: [...new Set(hist.flatMap(q => q.evaluation?.matchedSkills || []))]
        };
    }, [data.history]);

    const radarData = [
        { category: "Technical", value: stats.tech, fullMark: 100 },
        { category: "Communication", value: stats.comm, fullMark: 100 },
        { category: "Confidence", value: stats.conf, fullMark: 100 },
        { category: "Clarity", value: stats.clar, fullMark: 100 },
        { category: "Readiness", value: stats.prep, fullMark: 100 },
    ];

    const getScoreColor = (score) => {
        if (score >= 8.5) return "text-[#34d399] drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]";
        if (score >= 7.0) return "text-[#60a5fa] drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]";
        return "text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]";
    };

    const getScoreStroke = (score) => {
        if (score >= 8.5) return "#34d399";
        if (score >= 7.0) return "#60a5fa";
        return "#fbbf24";
    };

    const getScoreGradient = (score) => {
        if (score >= 8.5) return "from-[#34d399] to-[#059669]";
        if (score >= 7.0) return "from-[#60a5fa] to-[#2563eb]";
        return "from-[#fbbf24] to-[#d97706]";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex justify-center items-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-white/50 animate-pulse font-medium">Decrypting analysis matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden pb-32">

            {/* --- IMMERSIVE BACKGROUND EFFECTS --- */}
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-luminosity pointer-events-none"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2560&q=80')"
                }}
            />
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#020617]/90 via-[#0a0f1c]/80 to-[#020617]/90 backdrop-blur-sm pointer-events-none" />

            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
                {/* Glassmorphism gradient orbs */}
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen translate-x-[-20%] translate-y-[-20%]"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-cyan-600/10 rounded-full blur-[100px] mix-blend-screen translate-x-[20%] translate-y-[20%]"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* --- STICKY NAV --- */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-2xl border-b border-white/[0.05] py-4' : 'bg-transparent py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/dashboard")}>
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0a0f1c] border border-white/[0.08] group-hover:border-indigo-500/50 transition-colors shadow-lg overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <BrainCircuit className="w-5 h-5 text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-base font-black text-white tracking-widest uppercase">Nexus<span className="text-indigo-400">AI</span></h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] group-hover:text-indigo-400/80 transition-colors">Analytics Engine</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-xs font-black uppercase tracking-widest text-[#94a3b8] hover:text-white transition-all group"
                        >
                            <Share2 className="w-4 h-4 group-hover:text-cyan-400 transition-colors" /> Share
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDownloadPdf}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isExporting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF</>
                            ) : (
                                <><Download className="w-4 h-4" /> Save PDF</>
                            )}
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* --- MAIN DASHBOARD CONTENT --- */}
            <main id="report-container" className="relative z-10 max-w-7xl mx-auto px-6 pt-36">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-10"
                >
                    {/* HERO */}
                    <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 lg:gap-20 mb-4 pb-10 border-b border-white/[0.05]">
                        <div className="relative flex-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8 shadow-[0_0_20px_rgba(79,70,229,0.15)]"
                            >
                                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Profile Synthesized</span>
                            </motion.div>

                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.05] mb-6">
                                Candidate <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                                    Intelligence
                                </span>
                            </h2>
                            <p className="text-[#94a3b8] text-lg font-medium max-w-2xl leading-relaxed">
                                Forensic breakdown of competencies, technical acuity, and communication dynamics for the <span className="text-white font-bold border-b border-white/20 pb-0.5">{data.jobTitle}</span> requisition.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[300px]">
                            <GlowingBadge icon={Briefcase} label="Target Requisition" value={data.jobTitle} bgClass="bg-[#0a0f1c]" colorClass="text-indigo-400" />
                            <GlowingBadge icon={Calendar} label="Evaluation Timestamp" value={new Date(data.date).toLocaleDateString()} bgClass="bg-[#0f172a]" colorClass="text-cyan-400" />
                        </div>
                    </motion.div>

                    {/* OVERVIEW METRICS TIER */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Overall Score Pillar */}
                        <PremiumCard className="lg:col-span-4 p-10 flex flex-col items-center text-center">
                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-12 w-full flex items-center justify-center gap-2">
                                <Target className="w-4 h-4 text-indigo-400" /> Overall Alignment
                            </h3>

                            <div className="relative w-64 h-64 flex flex-col items-center justify-center mb-10">
                                <svg className="w-full h-full transform -rotate-90 absolute inset-0 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100">
                                    {/* Background track */}
                                    <circle cx="50" cy="50" r="44" stroke="#1e293b" strokeWidth="6" fill="none" strokeDasharray="4 4" />
                                    {/* Progress track */}
                                    <motion.circle
                                        cx="50" cy="50" r="44"
                                        stroke={getScoreStroke(data.score)}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={2 * Math.PI * 44}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - (data.score / 10)) }}
                                        transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 }}
                                        strokeLinecap="round"
                                        className="drop-shadow-[0_0_15px_currentColor]"
                                    />
                                </svg>

                                <div className="z-10 flex flex-col items-center">
                                    <motion.span
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.8, type: "spring" }}
                                        className={`text-[5.5rem] font-black tracking-tighter ${getScoreColor(data.score)} leading-none block mb-2`}
                                    >
                                        {(Number(data.score) || 0).toFixed(1)}
                                    </motion.span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">System Score out of 10</span>
                                </div>
                            </div>

                            <div className={`w-full px-6 py-5 bg-gradient-to-br ${getScoreGradient(data.score)} rounded-2xl border border-white/20 mt-auto text-white shadow-xl flex items-center gap-4`}>
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    {data.score >= 8.5 ? <Award className="w-5 h-5" /> : data.score >= 7.0 ? <CheckCircle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-0.5">Automated Verdict</div>
                                    <div className="text-sm font-bold">
                                        {data.score >= 8.5 ? "Exceptional fit. Highly Recommended." : data.score >= 7.0 ? "Strong candidate. Recommended." : "Lacks required proficiencies."}
                                    </div>
                                </div>
                            </div>
                        </PremiumCard>

                        {/* Radar Chart */}
                        <PremiumCard className="p-10 lg:col-span-8 flex flex-col">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.05]">
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-cyan-400" /> Attributes Mapping
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Profile Match:</span>
                                    <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-widest rounded-full">
                                        {Math.round(stats.prep)}% Match
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-[350px] relative flex justify-center items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="#1e293b" />
                                        <PolarAngleAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Candidate"
                                            dataKey="value"
                                            stroke="#06b6d4"
                                            strokeWidth={3}
                                            fill="url(#radarGradient)"
                                            fillOpacity={1}
                                        />
                                        <defs>
                                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                                                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: '#fff', fontWeight: '800' }}
                                            cursor={false}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </PremiumCard>
                    </div>

                    {/* AI INSIGHTS & DRIVERS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PremiumCard className="p-10 flex flex-col h-full">
                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 pb-6 border-b border-white/[0.05] flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" /> Behavioral & Cognitive Analysis
                            </h3>
                            <div className="space-y-6 flex-1 flex flex-col justify-center">
                                <motion.div
                                    className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-3xl relative overflow-hidden group hover:bg-emerald-500/10 transition-colors"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
                                    <h4 className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                                        <Award className="w-4 h-4" /> Principal Strengths
                                    </h4>
                                    <p className="text-slate-300 text-[15px] font-medium leading-relaxed">
                                        Demonstrates profound structural knowledge and clear, concise communication. Answers are well-anchored in practical examples, boosting confidence scores significantly during complex architectural questions.
                                    </p>
                                </motion.div>

                                <motion.div
                                    className="bg-amber-500/5 border border-amber-500/10 p-8 rounded-3xl relative overflow-hidden group hover:bg-amber-500/10 transition-colors"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                                    <h4 className="text-amber-400 text-[11px] font-black uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> Areas of Maturation
                                    </h4>
                                    <p className="text-slate-300 text-[15px] font-medium leading-relaxed">
                                        Opportunities exist to introduce deeper technical terminology earlier in responses. Expanding on architectural depth will maximize technical accuracy scoring when discussing scalable microservices.
                                    </p>
                                </motion.div>
                            </div>
                        </PremiumCard>

                        <PremiumCard className="p-10 flex flex-col h-full">
                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 pb-6 border-b border-white/[0.05] flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-blue-400" /> Skill Extraction & Velocity
                            </h3>

                            <div className="mb-10">
                                <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-6">Identified Proficiencies</h4>
                                <div className="space-y-4">
                                    {stats.allSkills.slice(0, 4).map((skill, i) => {
                                        const randomBg = Math.floor(Math.random() * 40 + 60);
                                        return (
                                            <div key={skill} className="flex items-center gap-4">
                                                <div className="w-1/3 text-[11px] font-bold text-slate-300 uppercase tracking-wider truncate">{skill}</div>
                                                <div className="flex-1 h-1.5 bg-[#0a0f1c] border border-white/[0.05] rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${randomBg}%` }}
                                                        transition={{ delay: 0.8 + i * 0.1, duration: 1.5, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                                                    />
                                                </div>
                                                <div className="text-[11px] font-black text-cyan-400 w-8">{randomBg}%</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-end">
                                <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-4">Performance Velocity</h4>
                                <div className="h-[120px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.timeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            />
                                            <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorCurve)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </PremiumCard>
                    </div>

                    {/* TRANSCRIPT */}
                    <div className="pt-10">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
                                    <MessageSquare className="w-6 h-6 text-indigo-400" />
                                </div>
                                Forensic Transcript Log
                            </h3>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] px-4 py-2 bg-[#0a0f1a] rounded-xl border border-white/[0.05]">
                                {data.history.length} Questions Analysed
                            </div>
                        </div>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:left-[32px] md:before:left-[40px] before:w-px before:bg-gradient-to-b before:from-indigo-500/50 before:via-white/[0.05] before:to-transparent">
                            {data.history.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    className="relative flex gap-6 md:gap-10"
                                >
                                    {/* Number Bullet */}
                                    <div className="relative z-10 flex-shrink-0 mt-8">
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-[#0a0f1c] border border-white/[0.08] flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-xl md:text-2xl font-black text-indigo-400 font-mono">
                                                0{idx + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Q&A Card */}
                                    <PremiumCard hover={false} className="flex-1 p-8 md:p-10 border-l-2 hover:border-l-indigo-500 transition-colors">
                                        <div className="flex flex-col xl:flex-row gap-8 justify-between items-start mb-10 pb-10 border-b border-white/[0.05]">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="p-1.5 rounded-md bg-indigo-500/20">
                                                        <BrainCircuit className="w-3 h-3 text-indigo-400" />
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Interviewer Prompt</div>
                                                </div>
                                                <p className="text-2xl font-bold text-white leading-snug tracking-tight">
                                                    {item.question}
                                                </p>
                                            </div>

                                            {/* Minimalist Score Display */}
                                            <div className="flex flex-row xl:flex-col items-center xl:items-end gap-6 xl:gap-2 flex-shrink-0 bg-white/[0.02] p-6 rounded-3xl border border-white/[0.05]">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Response Metric</span>
                                                <span className={`text-5xl font-black tracking-tighter ${getScoreColor(item.evaluation?.score || 0)}`}>
                                                    {(Number(item.evaluation?.score) || 0).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-10 relative">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="p-1.5 rounded-md bg-cyan-500/20">
                                                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                                                </div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Candidate Response</div>
                                            </div>
                                            <div className="p-8 bg-[#0a0f1c] rounded-[2rem] text-[#94a3b8] text-lg leading-relaxed font-medium border border-white/[0.02] shadow-inner">
                                                {item.answer}
                                            </div>
                                        </div>

                                        {/* AI Grading */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/[0.05] border-dashed">
                                            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                                                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> System Validation
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                    {item.evaluation?.feedback || "Solid response."}
                                                </p>
                                            </div>
                                            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                                                <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4" /> Feedback Vector
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                    {item.evaluation?.improvements || "No specific improvements suggested."}
                                                </p>
                                            </div>
                                        </div>
                                    </PremiumCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
}